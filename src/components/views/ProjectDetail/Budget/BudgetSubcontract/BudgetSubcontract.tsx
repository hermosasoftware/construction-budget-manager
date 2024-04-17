import React, { useState } from 'react';
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
  isAdminUser: boolean;
  budget: IProjectBudget;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BudgetSubcontract: React.FC<IBudgetSubcontractView> = props => {
  const { projectId, isBudgetOpen, isAdminUser, budget } = props;
  const [selectedItem, setSelectedItem] = useState<IBudgetSubcontract>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const budgetSubcontracts = useAppSelector(
    state => state.budgetSubcontracts.budgetSubcontracts,
  );

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true, showTotal: true },
    {
      name: 'subtotal',
      value: appStrings.subtotal,
      isGreen: true,
      showTotal: true,
    },
    {
      name: 'dollars',
      value: appStrings.dollars,
      isGreen: true,
      showTotal: true,
    },
  ];

  const formatTableData = () =>
    budgetSubcontracts.map(data => ({
      ...data,
      cost: colonFormat(data.cost),
      subtotal: colonFormat(data.subtotal),
      dollars: dolarFormat(data.subtotal / budget.exchange),
    }));

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
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
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

  return (
    <div className={styles.operations_container}>
      <Flex marginBottom="5px">
        <SearchInput
          className={styles.search_button}
          placeholder="Search"
          onChange={handleSearch}
        />
        <div className={styles.form_container}>
          {(isBudgetOpen || isAdminUser) && (
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
                placeholder={appStrings.subcontractName}
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
        hideOptions={!isBudgetOpen || !isAdminUser}
        usePagination={!searchTerm?.length}
        showTotals
      />
      {!budgetSubcontracts.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetSubcontract;
