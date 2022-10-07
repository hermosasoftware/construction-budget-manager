import styles from './ExpensesReport.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Heading, useToast } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { Input } from '../../../common/Form';
import {
  createProjectExpense,
  getProjectExpenseById,
  getProjectExpenses,
  updateProjectExpense,
} from '../../../../services/ProjectExpensesService';
import { IProjectExpense } from '../../../../types/projectExpense';
import { useAppSelector } from '../../../../redux/hooks';

interface IExpensesReport {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  docNumber: 0,
  name: '',
  owner: '',
  amount: 0,
  work: '',
  date: '',
};

const ExpensesReport: React.FC<IExpensesReport> = props => {
  const [tableHeader, setTableHeader] = useState<TTableHeader[]>([]);
  const [tableData, setTableData] = useState<IProjectExpense[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectExpense>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const toast = useToast();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const getExpenses = useCallback(async () => {
    const [errors, resProjects] = await getProjectExpenses(projectId);
    if (!errors) {
      setTableHeader([
        { name: 'name', value: 'Name' },
        { name: 'docNumber', value: 'Doc Number' },
        { name: 'date', value: 'Date', isGreen: true },
        { name: 'owner', value: 'Owner' },
        { name: 'work', value: 'Work' },
        { name: 'amount', value: 'Amount', isGreen: true },
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
  }, [projectId, toast]);

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const editButton = async (id: string) => {
    const [errors, resProjects] = await getProjectExpenseById(projectId, id);
    if (!errors && resProjects) {
      setSelectedItem(resProjects);
      setIsModalOpen(true);
    }
  };

  const deleteButton = (id: string) => {};

  const handleOnSubmit = async (projectExpense: IProjectExpense) => {
    projectExpense.id
      ? await updateProjectExpense(projectId, projectExpense)
      : await createProjectExpense(projectId, projectExpense);
    setSelectedItem(initialSelectedItemData);
    setIsModalOpen(false);
    getExpenses();
  };

  const validationSchema = yup.object().shape({
    docNumber: yup
      .number()
      .positive()
      .required(appStrings?.Global?.requiredField),
    name: yup.string().required(appStrings?.Global?.requiredField),
    owner: yup.string().required(appStrings?.Global?.requiredField),
    amount: yup.number().positive().required(appStrings?.Global?.requiredField),
    work: yup.string().required(appStrings?.Global?.requiredField),
    date: yup.date().required(appStrings?.Global?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();

    getExpenses();
    return () => {
      abortController.abort();
    };
  }, [getExpenses, projectId, toast]);

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
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setSelectedItem(initialSelectedItemData);
              setIsModalOpen(false);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedItem.id ? 'Edit Expense' : 'Create Expense'}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input name="name" label="Name" />
              <Input name="docNumber" type="number" label="Doc Number" />
              <Input name="owner" label="Owner" />
              <Input name="amount" type="number" label="Amount" />
              <Input name="work" label="Work" />
              <Input name="date" type="date" label="Date" />

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
        onClickEdit={id => editButton(id)}
        onClickDelete={id => deleteButton(id)}
      />
      {!tableData.length ? <h1>No records found</h1> : null}
    </div>
  );
};

export default ExpensesReport;
