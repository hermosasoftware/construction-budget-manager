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
import { DotsThreeOutlineVertical, Pencil, Trash } from 'phosphor-react';
import { TObject } from '../../../types/global';

import styles from './TableView.module.css';

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
  rowChild?: React.ReactElement;
  hideOptions?: boolean;
}

const TableView = <T extends TObject>(props: ITableProps<T>) => {
  const {
    headers,
    filter,
    boxStyle,
    onClickEdit,
    onClickDelete,
    handleRowClick,
    rowChild,
    hideOptions,
  } = props;
  const [rowChildVisible, seTrowChildVisible] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string | number>('');

  const items = useMemo(() => {
    return !filter ? props.items : props.items?.filter(filter);
  }, [props.items, filter]);

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
          {items?.map(row => (
            <React.Fragment key={`table-row-${row.id}`}>
              <Tr key={`table-row-${row.id}`}>
                {headers?.map(header => (
                  <Td
                    key={`table-row-header-${header.name as string}`}
                    onClick={e => {
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
                      header.isGreen
                        ? styles.column_color__green
                        : styles.column_color__black
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
    </Box>
  );
};

export default TableView;
