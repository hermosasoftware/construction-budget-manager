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
  createBudgetOther,
  deleteBudgetOther,
  getBudgetOtherById,
  getBudgetOthers,
  updateBudgetOther,
} from '../../../../../services/BudgetOthersService';
import { IBudgetOther } from '../../../../../types/budgetOther';
import { IProjectBudget } from '../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Form, { Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetOther.module.css';

interface IBudgetOtherView {
  projectId: string;
  isBudgetOpen: boolean;
  getBudget: Function;
  budget: IProjectBudget;
  getActivity: Function;
  activity: IBudgetActivity;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
};

const BudgetOther: React.FC<IBudgetOtherView> = props => {
  const { projectId, isBudgetOpen, getBudget, budget, getActivity, activity } =
    props;
  const [tableData, setTableData] = useState<IBudgetOther[]>([]);
  const [selectedItem, setSelectedItem] = useState<IBudgetOther>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const getOthers = async () => {
    const successCallback = (response: IBudgetOther[]) =>
      setTableData(response);
    await getBudgetOthers({
      projectId,
      activityId: activity.id,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IBudgetOther) => setTableData([item, ...tableData]);

  const updateItem = (item: IBudgetOther) => {
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

  const editButton = async (budgetOtherId: string) => {
    const successCallback = (response: IBudgetOther) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getBudgetOtherById({
      projectId,
      activityId: activity.id,
      budgetOtherId,
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
      getActivity(activity.id);
    };
    await deleteBudgetOther({
      projectId,
      activityId: activity.id,
      budgetOtherId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (budgetOther: IBudgetOther) => {
    const successCallback = (item: IBudgetOther) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      budgetOther.id ? updateItem(item) : addItem(item);
      getBudget();
      getActivity(activity.id);
    };
    const serviceCallParameters = {
      projectId,
      activityId: activity.id,
      budgetOther: {
        ...budgetOther,
        quantity: +budgetOther.quantity,
        cost: +budgetOther.cost,
        subtotal: budgetOther.cost * budgetOther.quantity,
      },
      appStrings,
      successCallback,
    };
    budgetOther.id
      ? await updateBudgetOther(serviceCallParameters)
      : await createBudgetOther(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getOthers();
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
              {selectedItem.id ? appStrings.editOther : appStrings.addOther}
            </Heading>
            <Form
              id="other-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input name="name" label={appStrings.name} />
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
        title={appStrings.deleteOther}
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

export default BudgetOther;
