import styles from './Projects.module.css';
import { useEffect, useState } from 'react';
import { Box, Flex, Heading, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import SearchInput from '../../common/SearchInput/SearchInput';
import TabGroup from '../../common/TabGroup/TabGroup';
import Sidebar from '../../layout/Sidebar';
import TableView, { TTableHeader } from '../../common/TableView/TableView';
import Form, { Input, Select } from '../../common/Form';
import {
  createProject,
  getProjectById,
  getProjectsByStatus,
  updateProject,
} from '../../../services/ProjectService';
import { IProject } from '../../../types/project';
import { useAppSelector } from '../../../redux/hooks';

const tableHeader: TTableHeader[] = [
  { name: 'name', value: 'Name' },
  { name: 'client', value: 'Client', isGreen: true },
  { name: 'location', value: 'Location' },
];

const initialSelectedItemData = {
  id: '',
  name: '',
  client: '',
  location: '',
  status: 'active',
};

export default function Projects() {
  const [tableData, setTableData] = useState<IProject[]>([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedItem, setSelectedItem] = useState<IProject>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const projectId = row.id;
    navigate(`/project-detail/${projectId}`);
  };

  const editButton = async (id: string) => {
    const [errors, resProjects] = await getProjectById(id);
    if (!errors && resProjects) {
      setSelectedItem(resProjects);
      setIsModalOpen(true);
    }
  };

  const deleteButton = (id: string) => {};

  const handleOnUpdateSubmit = async (project: IProject) => {
    updateProject(project);
  };

  const handleOnCreateSubmit = async (project: IProject) => {
    createProject(project);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.Global?.requiredField),
    client: yup.string().required(appStrings?.Global?.requiredField),
    location: yup.string().required(appStrings?.Global?.requiredField),
    status: yup.string().required(appStrings?.Global?.requiredField),
  });

  useEffect(() => {
    !isModalOpen && setSelectedItem(initialSelectedItemData);
  }, [isModalOpen]);

  useEffect(() => {
    const getProjects = async (status: string) => {
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
    getProjects(selectedTab);
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
                <Heading as="h2" size="lg">
                  {selectedItem.id ? 'Edit Project' : 'Create Project'}
                </Heading>
                <Form
                  id="project-form"
                  initialFormData={selectedItem}
                  validationSchema={validationSchema}
                  validateOnChange
                  validateOnBlur
                  onSubmit={async data =>
                    data.id
                      ? await handleOnUpdateSubmit(data)
                      : await handleOnCreateSubmit(data)
                  }
                >
                  <Input name="name" label="name" placeholder="Project name" />
                  <Input
                    name="client"
                    label="client"
                    placeholder="Client name"
                  />
                  <Input
                    name="location"
                    label="location"
                    placeholder="Location description"
                  />
                  <Select
                    name="status"
                    label="Status"
                    options={[
                      { id: 'active', name: 'Active' },
                      { id: 'inactive', name: 'Inactive' },
                    ]}
                    containerStyle={{ width: '30%', alignSelf: 'start' }}
                  />
                  <br />
                  <Button width="full" type="submit">
                    Submit
                  </Button>
                </Form>
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
