import styles from './Projects.module.css';
import { useEffect, useState } from 'react';
import { Box, Flex, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import SearchInput from '../../common/SearchInput/SearchInput';
import TabGroup from '../../common/TabGroup/TabGroup';
import Sidebar from '../../layout/Sidebar';
import TableView, { TTableHeader } from '../../common/TableView/TableView';
import { getProjectsByStatus } from '../../../services/ProjectService';
import { IProject } from '../../../types/project';

const tableHeader: TTableHeader[] = [
  { name: 'name', value: 'Name' },
  { name: 'client', value: 'Client', isGreen: true },
  { name: 'location', value: 'Location' },
];

export default function Projects() {
  const [tableData, setTableData] = useState<IProject[]>([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const projectId = row.id;
    navigate(`/project-detail/${projectId}`);
  };

  const editButton = (id: string) => {
    setIsModalOpen(true);
  };

  const deleteButton = (id: string) => {};

  useEffect(() => {
    const getProjects = async (status: boolean) => {
      const [errors, resProjects] = await getProjectsByStatus(status);
      if (!errors) {
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
    selectedTab === 'active' ? getProjects(true) : getProjects(false);
  }, [selectedTab, toast]);

  return (
    <>
      <Sidebar />
      <div className={`${styles.projects_container}`}>
        <Box p={5} borderWidth="1px">
          <h1 className={`${styles.title}`}>Projects Management</h1>
        </Box>
        <TabGroup
          className={`${styles.tabs}`}
          tabs={[
            { id: 'active', name: 'Active Projects', selected: true },
            { id: 'inactive', name: 'Inactive Projects' },
          ]}
          onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
        />
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
            handleRowClick={handleRowClick}
            onClickEdit={id => editButton(id)}
            onClickDelete={id => deleteButton(id)}
          />
          {!tableData.length ? <h1>No records found</h1> : null}
        </div>
      </div>
    </>
  );
}
