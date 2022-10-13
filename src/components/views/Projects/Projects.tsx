import styles from './Projects.module.css';
import { useCallback, useEffect, useState } from 'react';
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
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const toast = useToast();
  const navigate = useNavigate();
  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'client', value: appStrings.client, isGreen: true },
    { name: 'location', value: appStrings.location },
  ];

  const getProjects = useCallback(
    async (status: string) => {
      const [errors, response] = await getProjectsByStatus(status);
      if (!errors) {
        setTableData(response);
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
    },
    [toast],
  );

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const projectId = row.id;
    navigate(`/project-detail/${projectId}`);
  };

  const editButton = async (id: string) => {
    const [errors, response] = await getProjectById(id);
    if (!errors && response) {
      setSelectedItem(response);
      setIsModalOpen(true);
    }
  };

  const deleteButton = (id: string) => {};

  const handleOnSubmit = async (project: IProject) => {
    project.id ? await updateProject(project) : await createProject(project);
    setSelectedItem(initialSelectedItemData);
    setIsModalOpen(false);
    getProjects(selectedTab);
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
    let abortController = new AbortController();

    getProjects(selectedTab);
    return () => {
      abortController.abort();
    };
  }, [getProjects, selectedTab, toast]);

  return (
    <>
      <Sidebar />
      <div className={`${styles.projects_container}`}>
        <Box p={5} borderWidth="1px">
          <h1 className={`${styles.title}`}>{appStrings.projectsManagement}</h1>
        </Box>
        <TabGroup
          className={`${styles.tabs}`}
          tabs={[
            { id: 'active', name: appStrings.activeProjects, selected: true },
            { id: 'inactive', name: appStrings.inactiveProjects },
          ]}
          onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
        />
        <div className={`${styles.operations_container}`}>
          <Flex marginBottom="5px">
            <SearchInput
              style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
              placeholder={appStrings.search}
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
                  onSubmit={handleOnSubmit}
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
          {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
        </div>
      </div>
    </>
  );
}
