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
import styles from './MaterialsTableView.module.css';

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
  hideOptions?: boolean;
  rowChild?: React.ReactElement;
  exchangeRate?: Number;
  formatCurrency?: boolean;
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
    const subMaterials = row.subMaterials;
    if (row?.material.hasSubMaterials) {
      subMaterials?.forEach((s: any) => {
        total += Number(s.quantity) * Number.parseFloat(s.cost);
      });
    } else {
      total = Number(row?.material?.cost);
    }

    const exchange = Number(exchangeRate);
    return total / exchange;
  };

  const calculateColons = (row: any) => {
    let total = 0;
    const subMaterials = row.subMaterials;
    if (row?.material.hasSubMaterials) {
      subMaterials?.forEach((s: any) => {
        total += Number(s.quantity) * Number.parseFloat(s.cost);
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
      return dolarFormat(Number(row.cost / Number(exchangeRate)));
    } else if (isCostColumn && formatCurrency) {
      return colonFormat(Number(row.cost));
    } else if (isSubTotal) {
      return colonFormat(Number(row.quantity) * Number(row.cost));
    }
    return row[headerName] || '-';
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
            const hasSubMaterials = row.subMaterials?.length > 0;
            return (
              <React.Fragment key={`table-row-${row.id}`}>
                <Tr
                  key={`table-row-${row.id}`}
                  className={`${
                    isSelected &&
                    hasSubMaterials &&
                    row?.material?.hasSubMaterials
                      ? styles.rowSelected
                      : ''
                  }`}
                >
                  {headers?.map(header => {
                    const isNameColumn = header.name === 'name';
                    return (
                      <Td
                        key={`table-row-header-${header.name as string}`}
                        onClick={e => onRowClick(isSelected, row, e)}
                        id={row.id?.toString()}
                        className={`${styles.td} ${
                          header.isGreen
                            ? styles.column_color__green
                            : styles.column_color__black
                        } ${isNameColumn ? styles.column_bold_text : ''} ${
                          handleRowClick &&
                          hasSubMaterials &&
                          row?.material?.hasSubMaterials
                            ? styles.cursor_pointer
                            : ''
                        }`}
                      >
                        {hasSubMaterials &&
                          row?.material?.hasSubMaterials &&
                          isNameColumn && (
                            <i
                              className={`${
                                styles.materialArrow
                              } icon ion-md-arrow-drop${
                                rowChildVisible && isSelected ? 'down' : 'right'
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
                        <MenuList>
                          {onClickAddSubMaterial &&
                            row?.material?.hasSubMaterials && (
                              <MenuItem
                                onClick={() =>
                                  onClickAddSubMaterial(row.id.toString())
                                }
                              >
                                Add sub material <Spacer></Spacer> <Plus />
                              </MenuItem>
                            )}
                          <MenuItem
                            onClick={() => onClickEdit(row.id.toString())}
                          >
                            Edit <Spacer></Spacer> <Pencil />
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
                        className={`${styles.childRowSelected} ${cssFormat}`}
                      >
                        {headers?.map(header => {
                          return (
                            <Td
                              key={`table-row-header-${header.name as string}`}
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
                                  Edit <Spacer></Spacer> <Pencil />
                                </MenuItem>
                                <MenuItem
                                  onClick={() =>
                                    onClickDeleteSubMaterial(
                                      row.id.toString(),
                                      sub.id.toString(),
                                    )
                                  }
                                >
                                  Delete <Spacer></Spacer> <Trash />
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
    </Box>
  );
};

export default MaterialsTableView;
