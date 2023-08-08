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
import {
  DotsThreeOutlineVertical,
  FilePdf,
  Pencil,
  Plus,
  Trash,
} from 'phosphor-react';
import { TObject } from '../../../types/global';
import {
  colonFormat,
  currencyToNumber,
  dolarFormat,
} from '../../../utils/numbers';
import { useAppSelector } from '../../../redux/hooks';
import Pagination from '../../common/Pagination';
import { parseCurrentPageItems } from '../../../utils/common';

import styles from './InvoiceTableView.module.css';

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
  onClickAddProduct?: (id: string) => void;
  onClickEditProduct?: (itemId: string, productId: string) => void;
  onClickDeleteProduct?: (itemId: string, productId: string) => void;
  rowChild?: React.ReactElement;
  hideOptions?: boolean;
  exchangeRate?: Number;
  formatCurrency?: boolean;
  usePagination?: boolean;
  showTotals?: boolean;
}

const InvoiceTableView = <T extends TObject>(props: ITableProps<T>) => {
  const {
    headers,
    filter,
    boxStyle,
    onClickEdit,
    onClickDelete,
    handleRowClick,
    onClickAddProduct,
    onClickEditProduct,
    onClickDeleteProduct,
    hideOptions,
    exchangeRate,
    formatCurrency,
    usePagination,
    showTotals = false,
  } = props;
  const [rowChildVisible, setRowChildVisible] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<string | number>('');
  const { colorMode } = useColorMode();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const itemsPerPage = useAppSelector(state => state.settings.itemsPerPage);

  const [currentPage, setCurrentPage] = useState<number>(0);

  const [filteredCount, setFilteredCount] = useState<number>(
    props.items?.length,
  );

  const items = useMemo(() => {
    const auxItems = !filter ? props.items : props.items?.filter(filter);
    setFilteredCount(auxItems.length);
    if (!usePagination) return auxItems;
    return parseCurrentPageItems(auxItems, currentPage, itemsPerPage);
  }, [filter, props.items, usePagination, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [props.items?.length]);

  const handleOnPageChange = (pageNumber: number, itemsPerPage: number) => {
    setCurrentPage(pageNumber);
  };

  const onRowClick = (isSelected: boolean, row: any, e: React.MouseEvent) => {
    if (isSelected) {
      setRowChildVisible(!rowChildVisible);
    } else {
      setRowChildVisible(true);
    }
    setSelectedRow(row.id);

    handleRowClick && handleRowClick(e);
  };

  const calculateDollars = (row: any) => {
    let total = 0;
    const products = row?.products;
    if (row?.products?.length) {
      products?.forEach((s: any) => {
        total += Number(s?.quantity) * Number.parseFloat(s?.cost);
      });
    } else {
      total = Number(row?.cost);
    }

    const exchange = Number(exchangeRate);
    return total / exchange;
  };

  const calculateColons = (row: any) => {
    let total = 0;
    const products = row?.products;
    if (row?.products?.length) {
      products?.forEach((s: any) => {
        total += Number(s?.quantity) * Number.parseFloat(s?.cost);
      });
    }
    return total;
  };

  const calculateTaxes = (quantity: number, cost: number, tax: number) => {
    const subTotal = quantity * cost;
    return tax ? subTotal * (tax / 100) : 0;
  };

  const renderColumnValue = (row: any, headerName: any) => {
    const isDollarColumn = headerName === 'dollarCost';
    const isImp = headerName === 'imp';
    const isSubTotal = headerName === 'subtotal';
    const isTotal = headerName === 'total';
    if (isDollarColumn && formatCurrency) {
      return dolarFormat(calculateDollars(row));
    } else if (isImp) {
      const allTaxes = row.products.reduce((a: any, b: any) => {
        return a + calculateTaxes(b.quantity, b.cost, b.tax);
      }, 0);
      return colonFormat(allTaxes);
    } else if (isSubTotal) {
      return colonFormat(calculateColons(row));
    } else if (isTotal) {
      const subtotal = calculateColons(row);
      const allTaxes = row.products.reduce((a: any, b: any) => {
        return a + calculateTaxes(b.quantity, b.cost, b.tax);
      }, 0);
      return colonFormat(subtotal + allTaxes);
    }
    return row[headerName] || '-';
  };

  const renderSubColumnValue = (row: any, headerName: any) => {
    const isDollarColumn = headerName === 'dollarCost';
    const isCostColumn = headerName === 'cost';
    const isImp = headerName === 'imp';
    const isSubTotal = headerName === 'subtotal';
    const isTotal = headerName === 'total';
    if (isDollarColumn && formatCurrency) {
      return dolarFormat(Number(row?.cost / Number(exchangeRate)));
    } else if (isCostColumn && formatCurrency) {
      return colonFormat(Number(row?.cost));
    } else if (isImp) {
      const imp = calculateTaxes(
        Number(row?.quantity),
        Number(row?.cost),
        Number(row?.tax),
      );
      return imp > 0
        ? `${colonFormat(imp)} ${`(${row?.tax}%)`}`
        : appStrings.taxExempt;
    } else if (isSubTotal) {
      return colonFormat(Number(row?.quantity) * Number(row?.cost));
    } else if (isTotal) {
      const subtotal = Number(row?.quantity) * Number(row?.cost);
      const tax = calculateTaxes(
        Number(row?.quantity),
        Number(row?.cost),
        Number(row?.tax),
      );
      return colonFormat(subtotal + tax);
    }
    return row[headerName] || '-';
  };

  const checkRenderPagination = () =>
    usePagination &&
    props.items.length > itemsPerPage &&
    filteredCount > itemsPerPage;

  const TotalStats = () => {
    const data = props?.items === items ? props?.items : items;
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

  return (
    <>
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
              const hasProducts = row?.products?.length > 0;
              return (
                <React.Fragment key={`table-row-${row.id}`}>
                  <Tr
                    key={`table-row-${row.id}`}
                    className={`${
                      isSelected && hasProducts && row?.products?.length
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
                            hasProducts &&
                            row?.products?.length
                              ? styles.cursor_pointer
                              : ''
                          }`}
                        >
                          {hasProducts &&
                            row?.products?.length &&
                            isFirstColumn && (
                              <i
                                className={`${
                                  styles.itemArrow
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
                            {onClickAddProduct && (
                              <MenuItem
                                onClick={() =>
                                  onClickAddProduct(row.id.toString())
                                }
                              >
                                {appStrings?.addProduct} <Spacer /> <Plus />
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
                            {row.pdfURL && (
                              <MenuItem onClick={() => window.open(row.pdfURL)}>
                                {appStrings?.openPDF} <Spacer />
                                <FilePdf size={24} />
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    ) : null}
                  </Tr>
                  {rowChildVisible &&
                    isSelected &&
                    hasProducts &&
                    row?.products?.length &&
                    row?.products?.map((prod: any, i: number, arr: any) => {
                      let cssFormat = '';
                      const isLastRow = i === arr.length - 1;
                      cssFormat = isLastRow ? styles.bottomRoundBorder : '';
                      return (
                        <Tr
                          key={`table-row-${prod.id}`}
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
                                id={prod.id?.toString()}
                                className={`${styles.td}`}
                              >
                                {renderSubColumnValue(prod, header.name)}
                              </Td>
                            );
                          })}
                          {onClickEditProduct &&
                          onClickDeleteProduct &&
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
                                      onClickEditProduct(
                                        row.id?.toString(),
                                        prod.id?.toString(),
                                      )
                                    }
                                  >
                                    {appStrings?.edit} <Spacer /> <Pencil />
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() =>
                                      onClickDeleteProduct(
                                        row.id?.toString(),
                                        prod.id?.toString(),
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
            totalCount={items.length}
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

export default InvoiceTableView;
