import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Center,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Stack,
  Tag,
  Tooltip,
} from '@chakra-ui/react';
import {
  DotsThreeOutlineVertical,
  FilePdf,
  Pencil,
  Trash,
} from 'phosphor-react';
import { TObject } from '../../../types/global';
import Pagination from '../Pagination';
import { useAppSelector } from '../../../redux/hooks';
import { parseCurrentPageItems } from '../../../utils/common';
import {
  colonFormat,
  currencyToNumber,
  dolarFormat,
  isCurrency,
} from '../../../utils/numbers';
import { isDate } from '../../../utils/dates';

import styles from './TableView.module.css';

export type TTableHeader<T = TObject> = {
  name: keyof TTableItem<T>;
  value: string | number;
  isGreen?: boolean;
  isEditable?: boolean;
  showTotal?: boolean;
};

export type TTableItem<T = TObject> = T & { id: string | number };

interface ITableProps<T> {
  headers: Array<TTableHeader<TTableItem<T>>>;
  items: Array<TTableItem<T>>;
  filter?: (
    value: TTableItem<T>,
    index: number,
    array: TTableItem<T>[],
  ) => boolean;
  boxStyle?: React.CSSProperties;
  handleRowClick?: (event: any) => void;
  onClickEdit?: (id: string) => void;
  onClickDelete?: (id: string) => void;
  onClickExportPDF?: (id: string) => void;
  rowChild?: React.ReactElement;
  hideOptions?: boolean;
  usePagination?: boolean;
  showTotals?: boolean;
}

const TableView = <T extends TObject>(props: ITableProps<T>) => {
  const {
    headers,
    filter,
    boxStyle,
    onClickEdit,
    onClickDelete,
    onClickExportPDF,
    handleRowClick,
    rowChild,
    hideOptions,
    usePagination,
    showTotals = false,
  } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [rowChildVisible, seTrowChildVisible] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string | number>('');

  const [currentPage, setCurrentPage] = useState<number>(
    Math.max(0, Number(searchParams.get('page')) - 1),
  );

  const itemsPerPage = useAppSelector(state => state.settings.itemsPerPage);

  const [filteredCount, setFilteredCount] = useState<number>(
    props.items?.length,
  );

  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  const sortData = (data: TTableItem<T>[]) =>
    data?.sort((a: any, b: any) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortAscending ? valueA - valueB : valueB - valueA;
      } else if (!isNaN(valueA) && !isNaN(valueB)) {
        return sortAscending ? +valueA - +valueB : +valueB - +valueA;
      } else if (isCurrency(valueA) && isCurrency(valueB)) {
        const numberA = currencyToNumber(valueA);
        const numberB = currencyToNumber(valueB);
        return sortAscending ? numberA - numberB : numberB - numberA;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        return sortAscending
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      } else if (isDate(valueA) && isDate(valueB)) {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        return sortAscending
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortAscending
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return 1;
      }
    });

  const handleColumnClick = (column: string) =>
    column === sortBy ? setSortAscending(!sortAscending) : setSortBy(column);

  const handleOnPageChange = (pageNumber: number, itemsPerPage: number) => {
    setSearchParams({ page: (pageNumber + 1)?.toString() });
    setCurrentPage(pageNumber);
  };

  const checkRenderPagination = () =>
    usePagination &&
    props.items.length > itemsPerPage &&
    props.items.length === filteredCount &&
    filteredCount > itemsPerPage;

  const TotalStats = () => {
    const data = checkRenderPagination() ? props?.items : items;
    const toShow = headers?.filter(header => header?.showTotal);
    const totalValues = data?.reduce((summary: any, item: any) => {
      for (const element of toShow) {
        summary[element?.name] =
          (summary[element?.name] || 0) + currencyToNumber(item[element?.name]);
      }
      return summary;
    }, {});

    return (
      <>
        {toShow?.map((element, key) => (
          <Tooltip key={key} label={element?.value}>
            <Tag colorScheme={key % 2 ? 'teal' : 'green'}>
              {element?.value?.toString()?.toUpperCase()?.includes('DOLLAR')
                ? dolarFormat(totalValues[element?.name])
                : colonFormat(totalValues[element?.name])}
            </Tag>
          </Tooltip>
        ))}
      </>
    );
  };

  const items: any = useMemo(() => {
    const auxItems = !filter ? props.items : props.items?.filter(filter);
    setFilteredCount(auxItems.length);
    if (!usePagination || props.items.length !== auxItems.length) {
      return sortData(auxItems);
    }
    return parseCurrentPageItems(sortData(auxItems), currentPage, itemsPerPage);
  }, [
    filter,
    props.items,
    usePagination,
    currentPage,
    itemsPerPage,
    sortAscending,
    sortBy,
  ]);

  React.useEffect(() => {
    setCurrentPage(Math.max(0, Number(searchParams.get('page')) - 1));
  }, [props.items?.length, searchParams]);

  return (
    <>
      <Box className={styles.table_container} style={{ ...(boxStyle ?? '') }}>
        <Table>
          <Thead>
            <Tr>
              {headers?.map(header => (
                <Th
                  key={`table-header-${header.name as string}`}
                  className={`${styles.th} ${
                    header.name === sortBy
                      ? sortAscending
                        ? styles.sort_asc
                        : styles.sort_desc
                      : ''
                  }`}
                  onClick={() => handleColumnClick(header.name as string)}
                >
                  {header.value}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {items?.map((row: any) => (
              <React.Fragment key={`table-row-${row.id}`}>
                <Tr key={`table-row-${row.id}`} className={styles.tr}>
                  {headers?.map(header => (
                    <Td
                      key={`table-row-header-${header.name as string}`}
                      onClick={(e: any) => {
                        if (rowChild) {
                          if (selectedRow === row.id)
                            seTrowChildVisible(!rowChildVisible);
                          else seTrowChildVisible(true);
                          setSelectedRow(row.id);
                        }
                        handleRowClick && handleRowClick(e);
                      }}
                      id={row.id?.toString()}
                      className={`${styles.td} ${
                        header.isGreen && styles.column_color__green
                      } ${
                        headers[0] === header ? styles.column_bold_text : ''
                      } ${handleRowClick ? styles.cursor_pointer : ''}`}
                    >
                      {row[header.name]}
                    </Td>
                  ))}
                  {onClickEdit && onClickDelete && !hideOptions ? (
                    <Td
                      id={row.id?.toString()}
                      className={`${styles.td}`}
                      textAlign="center"
                      width="90px"
                    >
                      <Menu>
                        <MenuButton boxSize="40px">
                          <Center>
                            <DotsThreeOutlineVertical
                              className={styles.cursor_pointer}
                              weight="fill"
                            />
                          </Center>
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            onClick={() => onClickEdit(row.id.toString())}
                          >
                            {appStrings?.edit}
                            <Spacer />
                            <Pencil />
                          </MenuItem>
                          <MenuItem
                            onClick={() => onClickDelete(row.id.toString())}
                          >
                            {appStrings?.delete} <Spacer /> <Trash />
                          </MenuItem>
                          {onClickExportPDF && (
                            <MenuItem
                              onClick={() =>
                                onClickExportPDF(row.id.toString())
                              }
                            >
                              {appStrings?.exportPDF} <Spacer />
                              <FilePdf size={24} />
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </Td>
                  ) : null}
                </Tr>
                {rowChildVisible && rowChild && row.id === selectedRow && (
                  <Tr>
                    <Td>{React.cloneElement(rowChild, { rowID: row.id })}</Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
        {checkRenderPagination() ? (
          <Pagination
            totalCount={props.items.length}
            itemsPerPage={itemsPerPage}
            handleOnPageChange={handleOnPageChange}
            currentPage={currentPage}
            filteredCount={filteredCount}
          />
        ) : undefined}
      </Box>
      {showTotals && items?.length ? (
        <Stack direction="row" className={styles.totals_container}>
          <Tag>{appStrings?.totals?.toUpperCase()}</Tag>
          <TotalStats />
        </Stack>
      ) : undefined}
    </>
  );
};

export default TableView;
