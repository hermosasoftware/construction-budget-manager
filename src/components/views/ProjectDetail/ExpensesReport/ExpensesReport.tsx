import React, { useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchFilter, {
  FilterOption,
  handleFilterSearch,
  Search,
} from '../../../common/SearchFilter/SearchFilter';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  createProjectExpense,
  deleteProjectExpense,
  getProjectExpenseById,
  updateProjectExpense,
} from '../../../../services/ProjectExpensesService';
import { IProjectExpense } from '../../../../types/projectExpense';
import { useAppSelector } from '../../../../redux/hooks';
import { colonFormat } from '../../../../utils/numbers';
import { formatDate } from '../../../../utils/dates';

import styles from './ExpensesReport.module.css';

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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialSearchData = {
  selectedOption: { label: 'name', value: '' },
  searchTerm: '',
  firstDate: new Date(),
  secondDate: new Date(),
};

const ExpensesReport: React.FC<IExpensesReport> = props => {
  const [selectedItem, setSelectedItem] = useState<IProjectExpense>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectExpenses = useAppSelector(
    state => state.projectExpenses.projectExpenses,
  );

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'docNumber', value: appStrings.docNumber },
    { name: 'date', value: appStrings.date, isGreen: true },
    { name: 'owner', value: appStrings.owner },
    { name: 'work', value: appStrings.work },
    { name: 'amount', value: appStrings.amount, isGreen: true },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'name', value: '', hasSuggestions: false },
    { name: 'docNumber', value: '', hasSuggestions: false },
    { name: 'date', value: new Date(), hasSuggestions: true },
    { name: 'owner', value: '', hasSuggestions: true },
    { name: 'work', value: '', hasSuggestions: true },
  ];

  const formatTableData = () =>
    projectExpenses.map(data => ({
      ...data,
      date: formatDate(new Date(data.date), 'MM/DD/YYYY'),
      amount: colonFormat(data.amount),
    }));

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

  return (
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
            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setSelectedItem(initialSelectedItemData);
                setIsModalOpen(false);
              }}
            >
              <Heading as="h2" size="lg">
                {selectedItem.id
                  ? appStrings.editExpense
                  : appStrings.addExpense}
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
          filter={value => handleFilterSearch(value, search)}
          onClickEdit={id => editButton(id)}
          onClickDelete={id => {
            setSelectedItem({ ...selectedItem, id: id });
            setIsAlertDialogOpen(true);
          }}
        />
        {!projectExpenses.length ? <h1>{appStrings.noRecords}</h1> : null}
      </Box>
    </div>
  );
};

export default ExpensesReport;
