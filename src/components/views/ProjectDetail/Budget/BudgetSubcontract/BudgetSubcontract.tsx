import React, { useEffect, useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../../common/Button/Button';
import Modal from '../../../../common/Modal/Modal';
import SearchInput from '../../../../common/SearchInput/SearchInput';
import TableView, {
  TTableHeader,
} from '../../../../common/TableView/TableView';
import {
  createBudgetSubcontract,
  deleteBudgetSubcontract,
  getBudgetSubcontractById,
  getBudgetSubcontracts,
  updateBudgetSubcontract,
} from '../../../../../services/BudgetSubcontractsService';
import { IBudgetSubcontract } from '../../../../../types/budgetSubcontract';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Form, { Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetSubcontract.module.css';

interface IBudgetSubcontractView {
  projectId: string;
  isBudgetOpen: boolean;
  getBudget: Function;
  budget: IProjectBudget;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
};

const BudgetSubcontract: React.FC<IBudgetSubcontractView> = props => {
  const [tableData, setTableData] = useState<IBudgetSubcontract[]>([]);
  const [selectedItem, setSelectedItem] = useState<IBudgetSubcontract>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId, isBudgetOpen, getBudget, budget } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'dollars', value: appStrings.dollars, isGreen: true },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      cost: colonFormat(data.cost),
      subtotal: colonFormat(data.subtotal),
      dollars: dolarFormat(data.subtotal / budget.exchange),
    }));

  const getSubcontracts = async () => {
    const successCallback = (response: IBudgetSubcontract[]) =>
      setTableData(response);
    await getBudgetSubcontracts({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IBudgetSubcontract) =>
    setTableData([item, ...tableData]);

  const updateItem = (item: IBudgetSubcontract) => {
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

  const editButton = async (budgetSubcontractId: string) => {
    const successCallback = (response: IBudgetSubcontract) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getBudgetSubcontractById({
      projectId,
      budgetSubcontractId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
      getBudget();
    };
    await deleteBudgetSubcontract({
      projectId,
      budgetSubcontractId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (budgetSubcontract: IBudgetSubcontract) => {
    const successCallback = (item: IBudgetSubcontract) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      budgetSubcontract.id ? updateItem(item) : addItem(item);
      getBudget();
    };
    const serviceCallParameters = {
      projectId,
      budgetSubcontract: {
        ...budgetSubcontract,
        quantity: +budgetSubcontract.quantity,
        cost: +budgetSubcontract.cost,
        subtotal: budgetSubcontract.cost * budgetSubcontract.quantity,
      },
      appStrings,
      successCallback,
    };
    budgetSubcontract.id
      ? await updateBudgetSubcontract(serviceCallParameters)
      : await createBudgetSubcontract(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getSubcontracts();
    return () => abortController.abort();
  }, []);

  return (
    <div className={styles.operations_container}>
      <Flex marginBottom="5px">
        <SearchInput
          className={styles.search_button}
          placeholder="Search"
          onChange={handleSearch}
        />
        <div className={styles.form_container}>
          {isBudgetOpen && (
            <Button onClick={() => setIsModalOpen(true)}>+</Button>
          )}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setSelectedItem(initialSelectedItemData);
              setIsModalOpen(false);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedItem.id
                ? appStrings.editSubcontract
                : appStrings.addSubcontract}
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
                name="quantity"
                type="number"
                label={appStrings.quantity}
              />
              <Input name="cost" type="number" label={appStrings.cost} />
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
        </div>
      </Flex>
      <AlertDialog
        title={appStrings.deleteSubcontract}
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
        hideOptions={!isBudgetOpen}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetSubcontract;
