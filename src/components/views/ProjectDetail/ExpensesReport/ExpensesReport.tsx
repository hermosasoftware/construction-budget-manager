import styles from './ExpensesReport.module.css';
import React, { useEffect, useState } from 'react';
import { Flex, Heading, useToast } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { DatePicker, Input } from '../../../common/Form';
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
  date: new Date(),
};

const ExpensesReport: React.FC<IExpensesReport> = props => {
  const [tableData, setTableData] = useState<IProjectExpense[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectExpense>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const toast = useToast();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'docNumber', value: appStrings.docNumber },
    { name: 'date', value: appStrings.date, isGreen: true },
    { name: 'owner', value: appStrings.owner },
    { name: 'work', value: appStrings.work },
    { name: 'amount', value: appStrings.amount, isGreen: true },
  ];

  const getExpenses = async () => {
    const response = await getProjectExpenses({ projectId, toast, appStrings });
    setTableData(response);
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const editButton = async (projectExpenseId: string) => {
    const response = await getProjectExpenseById({
      projectId,
      projectExpenseId,
      toast,
      appStrings,
    });
    if (response) {
      setSelectedItem(response);
      setIsModalOpen(true);
    }
  };

  const deleteButton = (id: string) => {};

  const handleOnSubmit = async (projectExpense: IProjectExpense) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      getExpenses();
    };
    projectExpense.id
      ? await updateProjectExpense({
          projectId,
          projectExpense,
          toast,
          appStrings,
          successCallback,
        })
      : await createProjectExpense({
          projectId,
          projectExpense,
          toast,
          appStrings,
          successCallback,
        });
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
    return () => {
      abortController.abort();
    };
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
              {selectedItem.id
                ? appStrings.editExpense
                : appStrings.createExpense}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input name="name" label={appStrings.name} />
              <Input
                name="docNumber"
                type="number"
                label={appStrings.docNumber}
              />
              <Input name="owner" label={appStrings.owner} />
              <Input name="amount" type="number" label={appStrings.amount} />
              <Input name="work" label={appStrings.work} />
              <DatePicker name="date" label={appStrings.date}></DatePicker>
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
        items={tableData.map(item => ({
          ...item,
          date: item.date.toDateString(),
        }))}
        filter={value =>
          searchTerm === '' || value.name.toUpperCase().includes(searchTerm)
        }
        onClickEdit={id => editButton(id)}
        onClickDelete={id => deleteButton(id)}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default ExpensesReport;
