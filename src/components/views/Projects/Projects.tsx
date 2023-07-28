import { useEffect, useState } from 'react';
import { Box, Text, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import SearchFilter from '../../common/SearchFilter';
import {
  Search,
  FilterOption,
  handleFilterSearch,
} from '../../common/SearchFilter/SearchFilter';
import TabGroup from '../../common/TabGroup/TabGroup';
import TableView, { TTableHeader } from '../../common/TableView/TableView';
import Form, { Input, Select } from '../../common/Form';
import AlertDialog from '../../common/AlertDialog/AlertDialog';
import {
  createProject,
  deleteProject,
  getProjectById,
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialSearchData = {
  selectedOption: { label: 'name', value: '' },
  searchTerm: '',
  firstDate: new Date(),
  secondDate: new Date(),
};

export default function Projects() {
  const [selectedTab, setSelectedTab] = useState('active');
  const [selectedItem, setSelectedItem] = useState<IProject>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projects = useAppSelector(state => state.projects.projects);
  const navigate = useNavigate();

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'client', value: appStrings.client, isGreen: true },
    { name: 'location', value: appStrings.location },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'name', value: '', hasSuggestions: true },
    { name: 'client', value: '', hasSuggestions: true },
    { name: 'location', value: '', hasSuggestions: true },
  ];

  const formatTableData = () => {
    return projects.filter(project => project.status === selectedTab);
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
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
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

  const Header = () => {
    const textColor = useColorModeValue('teal.500', 'teal.300');

    return (
      <Box borderBottomWidth="1px" px={5} py={3}>
        <Flex className="header" justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color={textColor} align="left">
            {appStrings.projectsManagement}
          </Text>
        </Flex>
      </Box>
    );
  };

  useEffect(() => {
    !isModalOpen && setSelectedItem(initialSelectedItemData);
  }, [isModalOpen]);

  return (
    <div className={`container ${styles.projects_container}`}>
      <Header />
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
            <SearchFilter
              search={search}
              setSearch={setSearch}
              data={formatTableData()}
              options={filterOptions}
            />
            <div style={{ textAlign: 'end' }}>
              <Button onClick={() => setIsModalOpen(true)}>+</Button>
              <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
            items={formatTableData()}
            filter={value => handleFilterSearch(value, search)}
            handleRowClick={handleRowClick}
            onClickEdit={id => editButton(id)}
            onClickDelete={id => {
              setSelectedItem({ ...selectedItem, id: id });
              setIsAlertDialogOpen(true);
            }}
          />
          {!projects.length ? <h1>{appStrings.noRecords}</h1> : null}
        </Box>
      </div>
    </div>
  );
}
