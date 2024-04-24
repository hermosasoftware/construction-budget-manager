import { useEffect, useMemo, useState } from 'react';
import { Box, Text, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import SearchFilter from '../../common/SearchFilter';
import {
  Search,
  FilterOption,
  handleFilterSearch,
} from '../../common/SearchFilter/SearchFilter';
import TableView, { TTableHeader } from '../../common/TableView/TableView';
import Form, { Input, Select } from '../../common/Form';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../../../services/UserService';
import { IUser } from '../../../types/user';
import { useAppSelector } from '../../../redux/hooks';

import styles from './Users.module.css';

const initialSelectedItemData = {
  id: '',
  uid: '',
  name: '',
  lastName: '',
  email: '',
  role: 'employee',
  status: true,
  password: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialSearchData = {
  selectedOption: { label: 'name', value: '' },
  searchTerm: '',
  firstDate: new Date(),
  secondDate: new Date(),
};

export default function Users() {
  const [selectedItem, setSelectedItem] = useState<
    IUser & { password?: string }
  >(initialSelectedItemData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [tableData, setTableData] = useState<IUser[]>([]);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'lastName', value: appStrings.lastName },
    { name: 'email', value: appStrings.email },
    { name: 'role', value: appStrings.role, isGreen: true },
    { name: 'status', value: appStrings.status, isGreen: true },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'name', value: '', hasSuggestions: true },
    { name: 'lastName', value: '', hasSuggestions: true },
    { name: 'role', value: '', hasSuggestions: true },
    { name: 'status', value: '', hasSuggestions: true },
  ];

  const roleOptions = [
    { id: 'employee', name: appStrings.employee },
    { id: 'manager', name: appStrings.manager },
    { id: 'admin', name: appStrings.admin },
  ];

  const statusOptions = [
    { id: 'active', name: appStrings.active },
    { id: 'inactive', name: appStrings.inactive },
  ];

  const formatedTableData = useMemo(
    () =>
      tableData.map(data => ({
        ...data,
        status: data.status ? appStrings.active : appStrings.inactive,
      })),
    [tableData],
  );

  const getUsers = () => {
    const successCallback = (users: IUser[]) => setTableData(users);
    getAllUsers({ appStrings, successCallback });
  };

  const editButton = async (userId: string) => {
    const successCallback = (response: IUser) => {
      setSelectedItem({
        ...response,
        status: response.status ? 'active' : 'inactive',
      });
      setIsModalOpen(true);
    };
    await getUserById({ userId, appStrings, successCallback });
  };

  const handleOnSubmit = async (data: any) => {
    const { password, status, ...user } = data;
    const successCallback = (data: IUser) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      user.id ? updateItem(data) : addItem(data);
    };
    const serviceCallParameters = {
      user: { ...user, status: status === 'active' },
      password,
      appStrings,
      successCallback,
    };
    user.id
      ? await updateUser(serviceCallParameters)
      : await createUser(serviceCallParameters);
  };

  const addItem = (item: IUser) => setTableData([item, ...tableData]);

  const updateItem = (item: IUser) => {
    const index = tableData.findIndex(e => e.id === item.id);
    const data = [...tableData];
    data.splice(index, 1, item);
    setTableData(data);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    lastName: yup.string().required(appStrings?.requiredField),
    email: yup
      .string()
      .email(appStrings?.validEmailRequired)
      .required(appStrings?.requiredField),
    role: yup.string().required(appStrings?.requiredField),
    password: !!selectedItem.id
      ? yup.string()
      : yup.string().required(appStrings?.requiredField),
  });

  const Header = () => {
    const textColor = useColorModeValue('teal.500', 'teal.300');

    return (
      <Box borderBottomWidth="1px" px={5} py={3}>
        <Flex className="header" justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color={textColor} align="left">
            {appStrings.usersManagement}
          </Text>
        </Flex>
      </Box>
    );
  };

  useEffect(() => {
    !isModalOpen && setSelectedItem(initialSelectedItemData);
  }, [isModalOpen]);

  useEffect(() => getUsers(), []);

  return (
    <div className={`container ${styles.users_container}`}>
      <Header />
      <div className={`${styles.operations_container}`}>
        <Box p={5} borderWidth="1px" borderRadius={12}>
          <Flex marginBottom="5px" className={styles.menu_container}>
            <SearchFilter
              search={search}
              setSearch={setSearch}
              data={formatedTableData}
              options={filterOptions}
            />
            <div style={{ textAlign: 'end', flex: 1 }}>
              <Button onClick={() => setIsModalOpen(true)}>+</Button>
              <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Heading as="h2" size="lg">
                  {selectedItem.id
                    ? appStrings.editUser
                    : appStrings.createUser}
                </Heading>
                <Form
                  id="user-form"
                  initialFormData={selectedItem}
                  validationSchema={validationSchema}
                  validateOnChange
                  validateOnBlur
                  onSubmit={handleOnSubmit}
                >
                  <Input
                    name="name"
                    label={appStrings.name}
                    placeholder={appStrings.nameDescription}
                  />
                  <Input
                    name="lastName"
                    label={appStrings.lastName}
                    placeholder={appStrings.lastNameDescription}
                  />
                  <Input
                    name="email"
                    label={appStrings.email}
                    placeholder={appStrings.emailExample}
                    isDisabled={!!selectedItem.id}
                  />
                  <Select
                    name="role"
                    label={appStrings.role}
                    options={roleOptions}
                  />
                  <Select
                    name="status"
                    label={appStrings.status}
                    options={statusOptions}
                  />
                  {!selectedItem.id && (
                    <Input
                      name="password"
                      type="password"
                      label={appStrings.password}
                      placeholder={appStrings.passwordDescription}
                    />
                  )}
                  <br />
                  <Button width="full" type="submit">
                    {appStrings.submit}
                  </Button>
                </Form>
              </Modal>
            </div>
          </Flex>
          <TableView
            headers={tableHeader}
            items={formatedTableData}
            filter={value => handleFilterSearch(value, search)}
            onClickEdit={id => editButton(id)}
            usePagination={!search?.searchTerm?.length}
          />
          {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
        </Box>
      </div>
    </div>
  );
}
