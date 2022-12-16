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
import { DotsThreeOutlineVertical, Pencil, Plus, Trash } from 'phosphor-react';
import { TObject } from '../../../types/global';
import { colonFormat, dolarFormat } from '../../../utils/numbers';
import styles from './OrdersTableView.module.css';

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
  onClickAddSubMaterial?: (id: string) => void;
  onClickEditSubMaterial?: (materialId: string, submaterialId: string) => void;
  onClickDeleteSubMaterial?: (
    materialId: string,
    submaterialId: string,
  ) => void;
  rowChild?: React.ReactElement;
  hideOptions?: boolean;
  exchangeRate?: Number;
  formatCurrency?: boolean;
}

const OrdersTableView = <T extends TObject>(props: ITableProps<T>) => {
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
    rowChild,
    hideOptions,
    exchangeRate,
    formatCurrency,
  } = props;
  const [rowChildVisible, setRowChildVisible] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string | number>('');

  const items = useMemo(() => {
    return !filter ? props.items : props.items?.filter(filter);
  }, [props.items, filter]);

  const onRowClick = (isSelected: boolean, row: any, e: React.MouseEvent) => {
    if (isSelected) setRowChildVisible(!rowChildVisible);
    else setRowChildVisible(true);
    setSelectedRow(row.id);

    handleRowClick && handleRowClick(e);
  };

  const calculateDollars = (row: any) => {
    let total = 0;
    const subMaterials = row?.materials;
    if (row?.materials?.length) {
      subMaterials.forEach((s: any) => {
        total += Number(s.quantity) * Number.parseFloat(s.cost);
      });
    } else {
      total = Number(row?.cost);
    }

    const exchange = Number(exchangeRate);
    return dolarFormat(total / exchange);
  };

  const calculateColons = (row: any) => {
    let total = 0;
    const subMaterials = row?.materials;
    if (row?.materials?.length) {
      subMaterials.forEach((s: any) => {
        total += Number(s.quantity) * Number.parseFloat(s.cost);
      });
    } else {
      total = Number(row?.cost);
    }
    return colonFormat(total);
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
          {items?.map(row => {
            const isSelected = selectedRow === row.id && rowChildVisible;
            const hasSubMaterials = row.materials?.length;
            return (
              <React.Fragment key={`table-row-${row.id}`}>
                <Tr
                  key={`table-row-${row.id}`}
                  className={`${
                    isSelected && hasSubMaterials && row?.materials?.length
                      ? styles.rowSelected
                      : ''
                  }`}
                >
                  {headers?.map(header => {
                    const isFirstColumn = headers[0] === header;
                    const isDollarColumn = header.name === 'dollarCost';
                    const isCostColumn = header.name === 'cost';
                    return (
                      <Td
                        key={`table-row-header-${header.name as string}`}
                        onClick={e => onRowClick(isSelected, row, e)}
                        id={row.id?.toString()}
                        className={`${styles.td} ${
                          header.isGreen
                            ? styles.column_color__green
                            : styles.column_color__black
                        } ${isFirstColumn ? styles.column_bold_text : ''} ${
                          handleRowClick &&
                          hasSubMaterials &&
                          row?.materials?.length
                            ? styles.cursor_pointer
                            : ''
                        }`}
                      >
                        {hasSubMaterials &&
                          row?.materials?.length &&
                          isFirstColumn && (
                            <i
                              className={`${
                                styles.materialArrow
                              } icon ion-md-arrow-drop${
                                rowChildVisible && isSelected ? 'down' : 'right'
                              }`}
                            ></i>
                          )}
                        {!isDollarColumn
                          ? isCostColumn && formatCurrency
                            ? calculateColons(row)
                            : row[header.name] || '-'
                          : calculateDollars(row)}
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
                        <MenuList>
                          {onClickAddSubMaterial && row?.materials?.length && (
                            <MenuItem
                              onClick={() =>
                                onClickAddSubMaterial(row.id.toString())
                              }
                            >
                              Add material <Spacer /> <Plus />
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={() => onClickEdit(row.id.toString())}
                          >
                            Edit <Spacer /> <Pencil />
                          </MenuItem>
                          <MenuItem
                            onClick={() => onClickDelete(row.id.toString())}
                          >
                            Delete <Spacer /> <Trash />
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  ) : null}
                </Tr>
                {rowChildVisible &&
                  isSelected &&
                  hasSubMaterials &&
                  row?.materials?.length &&
                  row?.materials?.map((sub: any) => (
                    <Tr key={`table-row-${sub.id}`}>
                      {headers?.map(header => {
                        const isDollarColumn = header.name === 'dollarCost';
                        const isCostColumn = header.name === 'cost';
                        return (
                          <Td
                            key={`table-row-header-${header.name as string}`}
                            id={sub.id?.toString()}
                            className={`${styles.td}`}
                          >
                            {!isDollarColumn
                              ? isCostColumn
                                ? colonFormat(Number(sub.cost))
                                : sub[header.name] || '-'
                              : dolarFormat(
                                  Number(sub.cost / Number(exchangeRate)),
                                )}
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
                                Edit <Spacer /> <Pencil />
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  onClickDeleteSubMaterial(
                                    row.id.toString(),
                                    sub.id.toString(),
                                  )
                                }
                              >
                                Delete <Spacer /> <Trash />
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      ) : null}
                    </Tr>
                  ))}
              </React.Fragment>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default OrdersTableView;
