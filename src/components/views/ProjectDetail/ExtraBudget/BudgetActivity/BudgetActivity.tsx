import React, { useEffect, useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../common/Button/Button';
import Modal from '../../../../common/Modal/Modal';
import SearchInput from '../../../../common/SearchInput/SearchInput';
import TableView, {
  TTableHeader,
} from '../../../../common/TableView/TableView';
import {
  createExtraBudgetActivity,
  deleteExtraBudgetActivity,
  getExtraBudgetActivityById,
  getExtraBudgetActivity,
  updateExtraBudgetActivity,
} from '../../../../../services/ExtraBudgetActivityService';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Form, { DatePicker, Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat } from '../../../../../utils/numbers';

import styles from './BudgetActivity.module.css';

interface IBudgetActivityView {
  projectId: string;
  getExtraBudget: Function;
  budget: IProjectBudget;
  setActivity: Function;
}

const initialSelectedItemData = {
  id: '',
  activity: '',
  sumLabors: 0,
  sumMaterials: 0,
  sumSubcontracts: 0,
  date: new Date(),
};

const BudgetActivity: React.FC<IBudgetActivityView> = props => {
  const [tableData, setTableData] = useState<IBudgetActivity[]>([]);
  const [selectedItem, setSelectedItem] = useState<IBudgetActivity>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId, getExtraBudget, budget, setActivity } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const navigate = useNavigate();
  const tableHeader: TTableHeader[] = [
    { name: 'activity', value: appStrings.name },
    { name: 'date', value: appStrings.date },
    { name: 'sumMaterials', value: appStrings.materials, isGreen: true },
    { name: 'sumLabors', value: appStrings.labors, isGreen: true },
    {
      name: 'sumSubcontracts',
      value: appStrings.subcontracts,
      isGreen: true,
    },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: data.date.toDateString(),
      sumMaterials: colonFormat(data.sumMaterials),
      sumLabors: colonFormat(data.sumLabors),
      sumSubcontracts: colonFormat(data.sumSubcontracts),
    }));

  const getActivities = async () => {
    const successCallback = (response: IBudgetActivity[]) =>
      setTableData(response);
    await getExtraBudgetActivity({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IBudgetActivity) => setTableData([item, ...tableData]);

  const updateItem = (item: IBudgetActivity) => {
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

  const editButton = async (extraBudgetActivityId: string) => {
    const successCallback = (response: IBudgetActivity) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getExtraBudgetActivityById({
      projectId,
      extraBudgetActivityId,
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
    };
    await deleteExtraBudgetActivity({
      projectId,
      extraBudgetActivityId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const exportPDFButton = (id: string) => {
    const activity = tableData.find(e => e.id === id);
    activity &&
      navigate(`/project-detail/${projectId}/extra-pdf-preview/${activity.id}`);
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const projectId = row.id;
    const activity = tableData.find(row => row.id === projectId);
    setActivity(activity);
  };

  const handleOnSubmit = async (extraBudgetActivity: IBudgetActivity) => {
    const successCallback = (item: IBudgetActivity) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      extraBudgetActivity.id ? updateItem(item) : addItem(item);
      getExtraBudget();
    };
    const serviceCallParameters = {
      projectId,
      extraBudgetActivity,
      appStrings,
      successCallback,
    };
    extraBudgetActivity.id
      ? await updateExtraBudgetActivity(serviceCallParameters)
      : await createExtraBudgetActivity(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    activity: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getActivities();
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
              {selectedItem.id
                ? appStrings.editActivity
                : appStrings.addActivity}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input name="activity" label={appStrings.name} />
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
        title={appStrings.deleteActivity}
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
          searchTerm === '' || value.activity.toUpperCase().includes(searchTerm)
        }
        handleRowClick={handleRowClick}
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id: id });
          setIsAlertDialogOpen(true);
        }}
        onClickExportPDF={id => exportPDFButton(id)}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetActivity;
