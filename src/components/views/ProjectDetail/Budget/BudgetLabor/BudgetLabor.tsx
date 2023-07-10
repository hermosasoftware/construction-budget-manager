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
  createBudgetLabor,
  deleteBudgetLabor,
  getBudgetLaborById,
  updateBudgetLabor,
} from '../../../../../services/BudgetLaborsService';
import { IBudgetLabor } from '../../../../../types/budgetLabor';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Form, { Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetLabor.module.css';

interface IBudgetLaborView {
  projectId: string;
  isBudgetOpen: boolean;
  budget: IProjectBudget;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  unit: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BudgetLabor: React.FC<IBudgetLaborView> = props => {
  const { projectId, isBudgetOpen, budget } = props;
  const [selectedItem, setSelectedItem] = useState<IBudgetLabor>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const budgetLabors = useAppSelector(state => state.budgetLabors.budgetLabors);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'dollars', value: appStrings.dollars, isGreen: true },
  ];

  const formatTableData = () =>
    budgetLabors.map(data => ({
      ...data,
      cost: colonFormat(data.cost),
      subtotal: colonFormat(data.subtotal),
      dollars: dolarFormat(data.subtotal / budget.exchange),
    }));

  const editButton = async (budgetLaborId: string) => {
    const successCallback = (response: IBudgetLabor) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getBudgetLaborById({
      projectId,
      budgetLaborId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteBudgetLabor({
      projectId,
      budgetLaborId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (budgetLabor: IBudgetLabor) => {
    const successCallback = (item: IBudgetLabor) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      budgetLabor: {
        ...budgetLabor,
        quantity: +budgetLabor.quantity,
        cost: +budgetLabor.cost,
        subtotal: budgetLabor.cost * budgetLabor.quantity,
      },
      appStrings,
      successCallback,
    };
    budgetLabor.id
      ? await updateBudgetLabor(serviceCallParameters)
      : await createBudgetLabor(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    unit: yup.string().required(appStrings?.requiredField),
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
              {selectedItem.id ? appStrings.editLabor : appStrings.addLabor}
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
                placeholder={appStrings.laborName}
              />
              <Input
                name="unit"
                label="Unit"
                placeholder={appStrings.metricUnit}
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
        title={appStrings.deleteLabor}
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
      {!budgetLabors.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetLabor;
