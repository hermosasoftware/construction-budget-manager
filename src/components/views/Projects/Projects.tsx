import { useEffect, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import SearchInput from '../../common/SearchInput/SearchInput';
import TabGroup from '../../common/TabGroup/TabGroup';
import Sidebar from '../../layout/Sidebar';
import TableView, { TTableHeader } from '../../common/TableView/TableView';
import Form, { Input, Select } from '../../common/Form';
import AlertDialog from '../../common/AlertDialog/AlertDialog';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectsByStatus,
  updateProject,
} from '../../../services/ProjectService';
import { IProject } from '../../../types/project';
import { useAppSelector } from '../../../redux/hooks';

import styles from './Projects.module.css';

const initialSelectedItemData = {
  id: '',
  name: '',
  client: '',
  location: '',
  status: 'active',
  budgetOpen: true,
};

export default function Projects() {
  const [tableData, setTableData] = useState<IProject[]>([]);
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedItem, setSelectedItem] = useState<IProject>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const navigate = useNavigate();
  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'client', value: appStrings.client, isGreen: true },
    { name: 'location', value: appStrings.location },
  ];

  const getProjects = async (status: string) => {
    const successCallback = (response: IProject[]) => setTableData(response);
    await getProjectsByStatus({ status, appStrings, successCallback });
  };

  const addItem = (item: IProject) => setTableData([item, ...tableData]);

  const updateItem = (item: IProject) => {
    const index = tableData.findIndex(e => e.id === item.id);
    const data = [...tableData];
    data.splice(index, 1, item);
    setTableData(data);
  };

  const removeItem = (id: string) => {
    const index = tableData.findIndex(e => e.id === id);
    const data = [...tableData];
    data.splice(index, 1);
    setTableData(data);
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const projectId = row.id;
    navigate(`/project-detail/${projectId}`);
  };

  const editButton = async (projectId: string) => {
    const successCallback = (response: IProject) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getProjectById({ projectId, appStrings, successCallback });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteProject({
      projectId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (project: IProject) => {
    const successCallback = (item: IProject) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      project.id
        ? selectedTab === item.status
          ? updateItem(item)
          : removeItem(item.id)
        : selectedTab === item.status && addItem(item);
    };
    const serviceCallParameters = { project, appStrings, successCallback };
    project.id
      ? await updateProject(serviceCallParameters)
      : await createProject(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    client: yup.string().required(appStrings?.requiredField),
    location: yup.string().required(appStrings?.requiredField),
    status: yup.string().required(appStrings?.requiredField),
  });

  useEffect(() => {
    !isModalOpen && setSelectedItem(initialSelectedItemData);
  }, [isModalOpen]);

  useEffect(() => {
    let abortController = new AbortController();
    getProjects(selectedTab);
    return () => abortController.abort();
  }, [selectedTab]);

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
          <Box p={5} borderWidth="1px" borderRadius={12}>
            <Flex marginBottom="5px">
              <SearchInput
                style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
                placeholder={appStrings.search}
                onChange={handleSearch}
              ></SearchInput>
              <div style={{ textAlign: 'end' }}>
                <Button onClick={() => setIsModalOpen(true)}>+</Button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                >
                  <Heading as="h2" size="lg">
                    {selectedItem.id
                      ? appStrings.editProject
                      : appStrings.createProject}
                  </Heading>
                  <Form
                    id="project-form"
                    initialFormData={selectedItem}
                    validationSchema={validationSchema}
                    validateOnChange
                    validateOnBlur
                    onSubmit={handleOnSubmit}
                  >
                    <Input
                      name="name"
                      label={appStrings.name}
                      placeholder={appStrings.projectName}
                    />
                    <Input
                      name="client"
                      label={appStrings.client}
                      placeholder={appStrings.clientName}
                    />
                    <Input
                      name="location"
                      label={appStrings.location}
                      placeholder={appStrings.locationDescription}
                    />
                    <Select
                      name="status"
                      label={appStrings.status}
                      options={[
                        { id: 'active', name: appStrings.active },
                        { id: 'inactive', name: appStrings.inactive },
                      ]}
                      containerStyle={{ width: '30%', alignSelf: 'start' }}
                    />
                    <br />
                    <Button width="full" type="submit">
                      {appStrings.submit}
                    </Button>
                  </Form>
                </Modal>
              </div>
            </Flex>
            <AlertDialog
              title={appStrings.deleteProject}
              content={appStrings.deleteWarning}
              isOpen={isAlertDialogOpen}
              onClose={() => {
                setSelectedItem(initialSelectedItemData);
                setIsAlertDialogOpen(false);
              }}
              onSubmit={() => deleteButton()}
            />
            <TableView
              headers={tableHeader}
              items={tableData}
              filter={value =>
                searchTerm === '' ||
                value.name.toUpperCase().includes(searchTerm)
              }
              handleRowClick={handleRowClick}
              onClickEdit={id => editButton(id)}
              onClickDelete={id => {
                setSelectedItem({ ...selectedItem, id: id });
                setIsAlertDialogOpen(true);
              }}
            />
            {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
          </Box>
        </div>
      </div>
    </>
  );
}
