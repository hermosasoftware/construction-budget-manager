import React, { useMemo, useState } from 'react';
import {
  Box,
  Center,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
} from '@chakra-ui/react';
import { DotsThreeOutlineVertical, Pencil, Plus, Trash } from 'phosphor-react';
import { TObject } from '../../../types/global';
import {
  colonFormat,
  currencyToNumber,
  dolarFormat,
  isCurrency,
} from '../../../utils/numbers';
import { isDate } from '../../../utils/dates';
import { useAppSelector } from '../../../redux/hooks';
import Pagination from '../../common/Pagination';
import { parseCurrentPageItems } from '../../../utils/common';

import styles from './MaterialsTableView.module.css';

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
  onClickAddSubMaterial?: (id: string) => void;
  onClickEditSubMaterial?: (materialId: string, submaterialId: string) => void;
  onClickDeleteSubMaterial?: (
    materialId: string,
    submaterialId: string,
  ) => void;
  hideOptions?: boolean;
  rowChild?: React.ReactElement;
  exchangeRate?: Number;
  formatCurrency?: boolean;
  usePagination?: boolean;
  showTotals?: boolean;
}

const MaterialsTableView = <T extends TObject>(props: ITableProps<T>) => {
  const {
    headers,
    filter,
    boxStyle,
    onClickEdit,
    onClickDelete,
    handleRowClick,
    onClickAddSubMaterial,
    onClickEditSubMaterial,
    onClickDeleteSubMaterial,
    hideOptions,
    exchangeRate,
    formatCurrency,
    usePagination,
    showTotals = false,
  } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [rowChildVisible, setRowChildVisible] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string | number>('');
  const { colorMode } = useColorMode();

  const itemsPerPage = useAppSelector(state => state.settings.itemsPerPage);

  const [currentPage, setCurrentPage] = useState<number>(0);

  const [filteredCount, setFilteredCount] = useState<number>(
    props.items?.length,
  );

  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  const sortData = (data: TTableItem<T>[]) =>
    data?.sort((a: any, b: any) => {
      const valueA = renderColumnValue(a, sortBy);
      const valueB = renderColumnValue(b, sortBy);
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
    setCurrentPage(pageNumber);
  };

  const onRowClick = (isSelected: boolean, row: any, e: React.MouseEvent) => {
    if (isSelected) setRowChildVisible(!rowChildVisible);
    else setRowChildVisible(true);
    setSelectedRow(row.id);

    handleRowClick && handleRowClick(e);
  };

  const calculateDollars = (row: any) => {
    let total = 0;
    const subMaterials = row?.subMaterials;
    if (row?.material?.hasSubMaterials) {
      subMaterials?.forEach((element: any) => {
        total +=
          (Number(element?.quantity) * Number.parseFloat(element?.cost)) /
          Number(row?.material?.quantity);
      });
      total *= Number(row?.material?.quantity);
    } else {
      total = Number(row?.material?.cost) * Number(row?.material?.quantity);
    }

    const exchange = Number(exchangeRate);
    return total / exchange;
  };

  const calculateColons = (row: any) => {
    let total = 0;
    const subMaterials = row?.subMaterials;
    if (row?.material?.hasSubMaterials) {
      subMaterials?.forEach((element: any) => {
        total +=
          (Number(element?.quantity) * Number.parseFloat(element?.cost)) /
          Number(row?.material?.quantity);
      });
    } else {
      total = Number(row?.material?.cost);
    }
    return total;
  };

  const renderColumnValue = (row: any, headerName: any) => {
    const isDollarColumn = headerName === 'dollarCost';
    const isCostColumn = headerName === 'cost';
    const isSubTotal = headerName === 'subtotal';
    if (isDollarColumn && formatCurrency) {
      return dolarFormat(calculateDollars(row));
    } else if (isCostColumn && formatCurrency) {
      return colonFormat(calculateColons(row));
    } else if (isSubTotal) {
      return colonFormat(calculateColons(row) * Number(row.material?.quantity));
    }
    return row.material[headerName] || '-';
  };

  const renderSubColumnValue = (row: any, headerName: any) => {
    const isDollarColumn = headerName === 'dollarCost';
    const isCostColumn = headerName === 'cost';
    const isSubTotal = headerName === 'subtotal';
    if (isDollarColumn && formatCurrency) {
      return dolarFormat(
        Number((row.cost * row.quantity) / Number(exchangeRate)),
      );
    } else if (isCostColumn && formatCurrency) {
      return colonFormat(Number(row.cost));
    } else if (isSubTotal) {
      return colonFormat(Number(row.quantity) * Number(row.cost));
    }
    return row[headerName] || '-';
  };

  const checkRenderPagination = () =>
    usePagination &&
    props.items.length > itemsPerPage &&
    filteredCount > itemsPerPage;

  const TotalStats = () => {
    const data = checkRenderPagination() ? props?.items : items;
    const toShow = headers?.filter(header => header?.showTotal);
    const totalValues = data?.reduce((summary: any, item: any) => {
      for (const element of toShow) {
        summary[element?.name] =
          (summary[element?.name] || 0) +
          currencyToNumber(renderColumnValue(item, element?.name));
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

  const items = useMemo(() => {
    const auxItems = !filter ? props.items : props.items?.filter(filter);
    setFilteredCount(auxItems.length);
    if (!usePagination) return sortData(auxItems);
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
    setCurrentPage(0);
  }, [props.items?.length]);

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
            {items?.map(row => {
              const isSelected = selectedRow === row.id && rowChildVisible;
              const hasSubMaterials = row.subMaterials?.length > 0;
              return (
                <React.Fragment key={`table-row-${row.id}`}>
                  <Tr
                    key={`table-row-${row.id}`}
                    className={`${styles.tr} ${styles.rounded} ${
                      isSelected &&
                      hasSubMaterials &&
                      row?.material?.hasSubMaterials
                        ? styles.rowSelected
                        : ''
                    }`}
                  >
                    {headers?.map(header => {
                      const isFirstColumn = headers[0] === header;
                      return (
                        <Td
                          key={`table-row-header-${header.name as string}`}
                          onClick={e => onRowClick(isSelected, row, e)}
                          id={row.id?.toString()}
                          className={`${styles.td} ${
                            header.isGreen && styles.column_color__green
                          } ${isFirstColumn ? styles.column_bold_text : ''} ${
                            handleRowClick &&
                            hasSubMaterials &&
                            row?.material?.hasSubMaterials
                              ? styles.cursor_pointer
                              : ''
                          }`}
                        >
                          {hasSubMaterials &&
                            row?.material?.hasSubMaterials &&
                            isFirstColumn && (
                              <i
                                className={`${
                                  styles.materialArrow
                                } icon ion-md-arrow-drop${
                                  rowChildVisible && isSelected
                                    ? 'down'
                                    : 'right'
                                }`}
                              ></i>
                            )}

                          {renderColumnValue(row, header.name)}
                        </Td>
                      );
                    })}
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
                          <MenuList
                            className={
                              colorMode === 'dark' ? styles.menuList : ''
                            }
                          >
                            {onClickAddSubMaterial &&
                              row?.material?.hasSubMaterials && (
                                <MenuItem
                                  onClick={() =>
                                    onClickAddSubMaterial(row.id.toString())
                                  }
                                >
                                  {appStrings?.addSubmaterial} <Spacer />
                                  <Plus />
                                </MenuItem>
                              )}
                            <MenuItem
                              onClick={() => onClickEdit(row.id.toString())}
                            >
                              {appStrings?.edit} <Spacer /> <Pencil />
                            </MenuItem>
                            <MenuItem
                              onClick={() => onClickDelete(row.id.toString())}
                            >
                              {appStrings?.delete} <Spacer /> <Trash />
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    ) : null}
                  </Tr>
                  {rowChildVisible &&
                    isSelected &&
                    hasSubMaterials &&
                    row?.material?.hasSubMaterials &&
                    row.subMaterials?.map((sub: any, i: number, arr: any) => {
                      let cssFormat = '';
                      const isLastRow = i === arr.length - 1;
                      cssFormat = isLastRow ? styles.bottomRoundBorder : '';
                      return (
                        <Tr
                          key={`table-row-${sub.id}`}
                          className={`${
                            colorMode === 'light'
                              ? styles.childRowSelected
                              : styles.childRowSelectedDark
                          } ${cssFormat}`}
                        >
                          {headers?.map(header => {
                            return (
                              <Td
                                key={`table-row-header-${
                                  header.name as string
                                }`}
                                id={sub.id?.toString()}
                                className={`${styles.td}`}
                              >
                                {renderSubColumnValue(sub, header.name)}
                              </Td>
                            );
                          })}
                          {onClickEditSubMaterial &&
                          onClickDeleteSubMaterial &&
                          !hideOptions ? (
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
                                    onClick={() =>
                                      onClickEditSubMaterial(
                                        row.id.toString(),
                                        sub.id.toString(),
                                      )
                                    }
                                  >
                                    {appStrings?.edit} <Spacer /> <Pencil />
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() =>
                                      onClickDeleteSubMaterial(
                                        row.id.toString(),
                                        sub.id.toString(),
                                      )
                                    }
                                  >
                                    {appStrings?.delete} <Spacer /> <Trash />
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Td>
                          ) : null}
                        </Tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
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

export default MaterialsTableView;
