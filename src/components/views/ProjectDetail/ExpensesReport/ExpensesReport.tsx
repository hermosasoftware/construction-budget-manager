import React, { useEffect, useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  createProjectExpense,
  deleteProjectExpense,
  getProjectExpenseById,
  getProjectExpenses,
  updateProjectExpense,
} from '../../../../services/ProjectExpensesService';
import { IProjectExpense } from '../../../../types/projectExpense';
import { useAppSelector } from '../../../../redux/hooks';
import { colonFormat } from '../../../../utils/numbers';

import styles from './ExpensesReport.module.css';
import { formatDate } from '../../../../utils/dates';
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
  date: new Date(),
};

const ExpensesReport: React.FC<IExpensesReport> = props => {
  const [tableData, setTableData] = useState<IProjectExpense[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectExpense>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'docNumber', value: appStrings.docNumber },
    { name: 'date', value: appStrings.date, isGreen: true },
    { name: 'owner', value: appStrings.owner },
    { name: 'work', value: appStrings.work },
    { name: 'amount', value: appStrings.amount, isGreen: true },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: formatDate(data.date, 'MM/DD/YYYY'),
      amount: colonFormat(data.amount),
    }));

  const getExpenses = async () => {
    const successCallback = (response: IProjectExpense[]) =>
      setTableData(response);
    await getProjectExpenses({ projectId, appStrings, successCallback });
  };

  const addItem = (item: IProjectExpense) => setTableData([item, ...tableData]);

  const updateItem = (item: IProjectExpense) => {
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

  const editButton = async (projectExpenseId: string) => {
    const successCallback = (response: IProjectExpense) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getProjectExpenseById({
      projectId,
      projectExpenseId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectExpense({
      projectId,
      projectExpenseId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectExpense: IProjectExpense) => {
    const successCallback = (item: IProjectExpense) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      projectExpense.id ? updateItem(item) : addItem(item);
    };
    const serviceCallParameters = {
      projectId,
      projectExpense: {
        ...projectExpense,
        docNumber: +projectExpense.docNumber,
        amount: +projectExpense.amount,
      },
      appStrings,
      successCallback,
    };
    projectExpense.id
      ? await updateProjectExpense(serviceCallParameters)
      : await createProjectExpense(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    docNumber: yup.number().positive().required(appStrings?.requiredField),
    name: yup.string().required(appStrings?.requiredField),
    owner: yup.string().required(appStrings?.requiredField),
    amount: yup.number().positive().required(appStrings?.requiredField),
    work: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getExpenses();
    return () => abortController.abort();
  }, []);

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
              {selectedItem.id ? appStrings.editExpense : appStrings.addExpense}
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
                placeholder={appStrings.expenseName}
              />
              <Input
                name="docNumber"
                type="number"
                label={appStrings.docNumber}
              />
              <Input
                name="owner"
                label={appStrings.owner}
                placeholder={appStrings.ownerName}
              />
              <Input name="amount" type="number" label={appStrings.amount} />
              <Input
                name="work"
                label={appStrings.work}
                placeholder={appStrings.workName}
              />
              <DatePicker name="date" label={appStrings.date}></DatePicker>
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
        </div>
      </Flex>
      <AlertDialog
        title={appStrings.deleteExpense}
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
        filter={value =>
          searchTerm === '' || value.name.toUpperCase().includes(searchTerm)
        }
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id: id });
          setIsAlertDialogOpen(true);
        }}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default ExpensesReport;
