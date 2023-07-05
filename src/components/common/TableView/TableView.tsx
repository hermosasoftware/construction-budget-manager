import React, { useMemo, useState } from 'react';
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
} from '@chakra-ui/react';
import {
  DotsThreeOutlineVertical,
  FilePdf,
  Pencil,
  Trash,
} from 'phosphor-react';
import { TObject } from '../../../types/global';
import Pagination from '../Pagination';
import styles from './TableView.module.css';
import { useAppSelector } from '../../../redux/hooks';

export type TTableHeader<T = TObject> = {
  name: keyof TTableItem<T>;
  value: string | number;
  isGreen?: boolean;
  isEditable?: boolean;
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
  } = props;
  const [rowChildVisible, seTrowChildVisible] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string | number>('');

  const [currentPage, setCurrentPage] = useState<number>(0);

  const itemsPerPage = useAppSelector(state => state.settings.itemsPerPage);

  const items: any = useMemo(() => {
    const auxItems = !filter ? props.items : props.items?.filter(filter);
    if (!usePagination) return auxItems;
    let start = currentPage * itemsPerPage;
    let end = start + itemsPerPage;
    if (!auxItems) return [];
    return auxItems.slice(start, end);
  }, [props.items, filter, currentPage, itemsPerPage]);

  const handleOnPageChange = (pageNumber: number, itemsPerPage: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Box className={styles.table_container} style={{ ...(boxStyle ?? '') }}>
      <Table>
        <Thead>
          <Tr>
            {headers?.map(header => (
              <Th
                key={`table-header-${header.name as string}`}
                className={styles.th}
              >
                {header.value}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {items?.map((row: any) => (
            <React.Fragment key={`table-row-${row.id}`}>
              <Tr key={`table-row-${row.id}`}>
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
                      header.name === 'name' ? styles.column_bold_text : ''
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
                          Edit<Spacer></Spacer>
                          <Pencil />
                        </MenuItem>
                        <MenuItem
                          onClick={() => onClickDelete(row.id.toString())}
                        >
                          Delete <Spacer></Spacer> <Trash />
                        </MenuItem>
                        {onClickExportPDF && (
                          <MenuItem
                            onClick={() => onClickExportPDF(row.id.toString())}
                          >
                            Export to PDF <Spacer /> <FilePdf size={24} />
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
      {usePagination && props.items.length > itemsPerPage ? (
        <Pagination
          totalCount={props.items.length}
          itemsPerPage={itemsPerPage}
          handleOnPageChange={handleOnPageChange}
          currentPage={currentPage}
        />
      ) : undefined}
    </Box>
  );
};

export default TableView;
