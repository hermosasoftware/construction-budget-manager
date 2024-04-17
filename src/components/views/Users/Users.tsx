import { useEffect, useState } from 'react';
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
  role: '',
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
  const [selectedItem, setSelectedItem] = useState<IUser>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [users, setUsers] = useState<IUser[]>([]);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'lastName', value: appStrings.lastName },
    { name: 'email', value: appStrings.email },
    { name: 'role', value: appStrings.role, isGreen: true },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'name', value: '', hasSuggestions: true },
    { name: 'lastName', value: '', hasSuggestions: true },
    { name: 'role', value: '', hasSuggestions: true },
  ];

  const editButton = async (userId: string) => {
    const successCallback = (response: IUser) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getUserById({ userId, appStrings, successCallback });
  };

  const handleOnSubmit = async (user: IUser) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = { user, appStrings, successCallback };
    user.id
      ? await updateUser(serviceCallParameters)
      : await createUser(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    lastName: yup.string().required(appStrings?.requiredField),
    email: yup.string().required(appStrings?.requiredField),
    role: yup.string().required(appStrings?.requiredField),
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

  useEffect(() => {
    const successCallback = (users: IUser[]) => setUsers(users);
    getAllUsers({ appStrings, successCallback });
  }, []);

  return (
    <div className={`container ${styles.users_container}`}>
      <Header />
      <div className={`${styles.operations_container}`}>
        <Box p={5} borderWidth="1px" borderRadius={12}>
          <Flex marginBottom="5px" className={styles.menu_container}>
            <SearchFilter
              search={search}
              setSearch={setSearch}
              data={users}
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
                    placeholder={appStrings.userName}
                  />
                  <Input
                    name="lastName"
                    label={appStrings.client}
                    placeholder={appStrings.clientName}
                  />
                  <Input
                    name="email"
                    label={appStrings.email}
                    placeholder={appStrings.emailDescription}
                  />
                  <Select
                    name="role"
                    label={appStrings.role}
                    options={[
                      { id: 'employee', name: appStrings.employee },
                      { id: 'admin', name: appStrings.admin },
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
          <TableView
            headers={tableHeader}
            items={users}
            filter={value => handleFilterSearch(value, search)}
            onClickEdit={id => editButton(id)}
            usePagination={!search?.searchTerm?.length}
          />
          {!users.length ? <h1>{appStrings.noRecords}</h1> : null}
        </Box>
      </div>
    </div>
  );
}
