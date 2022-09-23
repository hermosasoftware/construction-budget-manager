import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';

interface IMaterialsTable {
  rowID?: string | number; // Just in case, remove if isn't needed
  data?: [];
}

export const MaterialsTable: React.FC<IMaterialsTable> = props => {
  return (
    <Table variant="striped" size="sm">
      <Thead>
        <Tr>
          <Th>Materials</Th>
          <Th>Quantity</Th>
          <Th>Unit</Th>
          <Th>Cost</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>LASTRE PARA SUSTITUICION</Td>
          <Td>6.9</Td>
          <Td>m3</Td>
          <Td>1200</Td>
        </Tr>
        <Tr>
          <Td>CONCRETO DE SELLO</Td>
          <Td>0,45</Td>
          <Td>m3</Td>
          <Td>1200</Td>
        </Tr>
        <Tr>
          <Td>CONCRETO DE SELLO</Td>
          <Td>0,45</Td>
          <Td>m3</Td>
          <Td>1200</Td>
        </Tr>
        <Tr>
          <Td>CONCRETO DE SELLO</Td>
          <Td>0,45</Td>
          <Td>m3</Td>
          <Td>1200</Td>
        </Tr>
      </Tbody>
    </Table>
  );
};
