import styles from './InitialPlan.module.css';
import { Flex, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import { getProjectMaterialsPlan } from '../../../../services/ProjectMaterialsPlanService';
import { IProjectMaterialPlan } from '../../../../types/projectMaterialPlan';

interface IInitialPlan {
  projectId: string;
}

const InitialPlan: React.FC<IInitialPlan> = props => {
  const [tableHeader, setTableHeader] = useState<TTableHeader[]>([]);
  const [tableData, setTableData] = useState<IProjectMaterialPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const toast = useToast();

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const editButton = (id: string) => {
    setIsModalOpen(true);
  };

  const deleteButton = (id: string) => {};

  useEffect(() => {
    let abortController = new AbortController();
    const getMaterialsPlan = async () => {
      const [errors, resProjects] = await getProjectMaterialsPlan(projectId);
      if (!errors) {
        setTableHeader([
          { name: 'name', value: 'Name' },
          { name: 'unit', value: 'Unit' },
          { name: 'quantity', value: 'Quantity' },
          { name: 'cost', value: 'Cost', isGreen: true },
          { name: 'subtotal', value: 'SubTotal', isGreen: true },
        ]);
        setTableData(resProjects);
      } else {
        toast({
          title: 'Error al extraer la informacion',
          description: errors + '',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    };
    getMaterialsPlan();
    return () => {
      abortController.abort();
    };
  }, [projectId, toast]);

  return (
    <div className={`${styles.operations_container}`}>
      <Flex marginBottom="5px">
        <SearchInput
          style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
          placeholder="Search"
          onChange={handleSearch}
        ></SearchInput>
        <div style={{ textAlign: 'end' }}>
          <Button onClick={() => setIsModalOpen(true)}>+</Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div>Modal Test</div>
          </Modal>
        </div>
      </Flex>
      <TableView
        headers={tableHeader}
        items={tableData}
        filter={value =>
          searchTerm === '' || value.name.toUpperCase().includes(searchTerm)
        }
        onClickEdit={id => editButton(id)}
        onClickDelete={id => deleteButton(id)}
      />
      {!tableData.length ? <h1>No records found</h1> : null}
    </div>
  );
};

export default InitialPlan;
