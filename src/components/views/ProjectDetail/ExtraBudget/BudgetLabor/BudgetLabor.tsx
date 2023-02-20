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
  createExtraBudgetLabor,
  deleteExtraBudgetLabor,
  getExtraBudgetLaborById,
  getExtraBudgetLabors,
  updateExtraBudgetLabor,
} from '../../../../../services/ExtraBudgetLaborsService';
import { IBudgetLabor } from '../../../../../types/budgetLabor';
import { IProjectBudget } from '../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Form, { Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetLabor.module.css';

interface IBudgetLaborView {
  projectId: string;
  getExtraBudget: Function;
  budget: IProjectBudget;
  getActivity: Function;
  activity: IBudgetActivity;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  unit: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
};

const BudgetLabor: React.FC<IBudgetLaborView> = props => {
  const { projectId, getExtraBudget, budget, getActivity, activity } = props;
  const [tableData, setTableData] = useState<IBudgetLabor[]>([]);
  const [selectedItem, setSelectedItem] = useState<IBudgetLabor>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
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
      dollars: dolarFormat(data.subtotal / Number(activity.exchange)),
    }));

  const getLabors = async () => {
    const successCallback = (response: IBudgetLabor[]) =>
      setTableData(response);
    await getExtraBudgetLabors({
      projectId,
      activityId: activity.id,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IBudgetLabor) => setTableData([item, ...tableData]);

  const updateItem = (item: IBudgetLabor) => {
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

  const editButton = async (extraBudgetLaborId: string) => {
    const successCallback = (response: IBudgetLabor) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getExtraBudgetLaborById({
      projectId,
      activityId: activity.id,
      extraBudgetLaborId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
      getExtraBudget();
      getActivity(activity.id);
    };
    await deleteExtraBudgetLabor({
      projectId,
      activityId: activity.id,
      extraBudgetLaborId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (extraBudgetLabor: IBudgetLabor) => {
    const successCallback = (item: IBudgetLabor) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      extraBudgetLabor.id ? updateItem(item) : addItem(item);
      getExtraBudget();
      getActivity(activity.id);
    };
    const serviceCallParameters = {
      projectId,
      activityId: activity.id,
      extraBudgetLabor: {
        ...extraBudgetLabor,
        quantity: +extraBudgetLabor.quantity,
        cost: +extraBudgetLabor.cost,
        subtotal: extraBudgetLabor.cost * extraBudgetLabor.quantity,
      },
      appStrings,
      successCallback,
    };
    extraBudgetLabor.id
      ? await updateExtraBudgetLabor(serviceCallParameters)
      : await createExtraBudgetLabor(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    unit: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getLabors();
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
          <Button onClick={() => setIsModalOpen(true)}>+</Button>
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
                placeholder={appStrings.projectName}
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
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetLabor;
