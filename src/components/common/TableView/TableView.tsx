import React, { useMemo } from 'react';
import { Box, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { DotsThreeOutlineVertical } from 'phosphor-react';
import { TObject } from '../../../types/global';

import styles from './TableView.module.css';

export type TTableHeader<T = TObject> = {
  name: keyof TTableItem<T>;
  value: string | number;
  isGreen?: boolean;
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
}

const TableView = <T extends TObject>(props: ITableProps<T>) => {
  const { headers, filter, boxStyle } = props;

  const items = useMemo(() => {
    return !filter ? props.items : props.items?.filter(filter);
  }, [props.items, filter]);

  return (
    <Box className={styles.table_container} style={{ ...(boxStyle ?? null) }}>
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
            <Tr key={`table-row-${row.id}`}>
              {headers?.map(header => (
                <Td
                  key={`table-row-header-${header.name as string}`}
                  className={`${styles.td} ${
                    header.isGreen
                      ? styles.column_color__green
                      : styles.column_color__black
                  } ${header.name === 'name' ? styles.column_bold_text : ''}`}
                >
                  {row[header.name]}
                </Td>
              ))}
              <Td>
                <DotsThreeOutlineVertical
                  className={styles.cursor_pointer}
                  weight="fill"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TableView;
