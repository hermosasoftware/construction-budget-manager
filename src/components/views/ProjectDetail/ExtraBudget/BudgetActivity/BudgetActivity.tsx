import React, { useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../common/Button/Button';
import Modal from '../../../../common/Modal/Modal';
import SearchFilter, {
  FilterOption,
  handleFilterSearch,
  Search,
} from '../../../../common/SearchFilter/SearchFilter';
import TableView, {
  TTableHeader,
} from '../../../../common/TableView/TableView';
import {
  createExtraBudgetActivity,
  deleteExtraBudgetActivity,
  getExtraBudgetActivityById,
  updateExtraBudgetActivity,
} from '../../../../../services/ExtraBudgetActivityService';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Form, { DatePicker, Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat } from '../../../../../utils/numbers';
import { formatDate } from '../../../../../utils/dates';

import styles from './BudgetActivity.module.css';

interface IBudgetActivityView {
  projectId: string;
  setActivity: Function;
}

const initialSelectedItemData = {
  id: '',
  activity: '',
  advance: 0,
  exchange: 1,
  adminFee: 12,
  sumLabors: 0,
  sumMaterials: 0,
  sumSubcontracts: 0,
  sumOthers: 0,
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialSearchData = {
  selectedOption: { label: 'activity', value: '' },
  searchTerm: '',
  firstDate: new Date(),
  secondDate: new Date(),
};

const BudgetActivity: React.FC<IBudgetActivityView> = props => {
  const [selectedItem, setSelectedItem] = useState<IBudgetActivity>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const { projectId, setActivity } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const extraActivities = useAppSelector(
    state => state.extraActivities.extraActivities,
  );
  const navigate = useNavigate();

  const tableHeader: TTableHeader[] = [
    { name: 'activity', value: appStrings.name },
    { name: 'date', value: appStrings.date },
    { name: 'exchange', value: appStrings.exchange },
    { name: 'adminFee', value: appStrings.adminFee },
    {
      name: 'sumMaterials',
      value: appStrings.materials,
      isGreen: true,
      showTotal: true,
    },
    {
      name: 'sumLabors',
      value: appStrings.labors,
      isGreen: true,
      showTotal: true,
    },
    {
      name: 'sumSubcontracts',
      value: appStrings.subcontracts,
      isGreen: true,
      showTotal: true,
    },
    {
      name: 'sumOthers',
      value: appStrings.others,
      isGreen: true,
      showTotal: true,
    },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'activity', value: '', hasSuggestions: true },
    { name: 'date', value: new Date(), hasSuggestions: true },
    { name: 'adminFee', value: '', hasSuggestions: true },
  ];

  const formatTableData = () =>
    extraActivities.map(data => ({
      ...data,
      date: formatDate(new Date(data.date), 'MM/DD/YYYY'),
      exchange: colonFormat(Number(data.exchange)),
      adminFee: `${data.adminFee}%`,
      sumMaterials: colonFormat(data.sumMaterials),
      sumLabors: colonFormat(data.sumLabors),
      sumSubcontracts: colonFormat(data.sumSubcontracts),
      sumOthers: colonFormat(data.sumOthers),
    }));

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
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteExtraBudgetActivity({
      projectId,
      extraBudgetActivityId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const exportPDFButton = (id: string) => {
    const activity = extraActivities.find(e => e.id === id);
    activity &&
      navigate(`/project-detail/${projectId}/extra-pdf-preview/${activity.id}`);
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    navigate(
      `/project-detail/${projectId}/extras/summary?activityId=${row.id}`,
    );
  };

  const handleOnSubmit = async (extraBudgetActivity: IBudgetActivity) => {
    const successCallback = (item: IBudgetActivity) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      extraBudgetActivity: {
        ...extraBudgetActivity,
        exchange: Number(extraBudgetActivity.exchange),
        adminFee: Number(extraBudgetActivity.adminFee),
      },
      appStrings,
      successCallback,
    };
    extraBudgetActivity.id
      ? await updateExtraBudgetActivity(serviceCallParameters)
      : await createExtraBudgetActivity(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    activity: yup.string().required(appStrings?.requiredField),
    exchange: yup.number().positive().required(appStrings?.requiredField),
    adminFee: yup.number().min(0).max(100).required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
  });

  return (
    <div className={styles.operations_container}>
      <Flex marginBottom="5px" className={styles.menu_container}>
        <SearchFilter
          search={search}
          setSearch={setSearch}
          data={formatTableData()}
          options={filterOptions}
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
              <Input
                name="activity"
                label={appStrings.name}
                placeholder={appStrings.activityName}
              />
              <Input
                name="exchange"
                type="number"
                label={appStrings.currencyExchange}
              />
              <Input
                name="adminFee"
                type="number"
                label={appStrings.adminFee}
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
        filter={value => handleFilterSearch(value, search)}
        handleRowClick={handleRowClick}
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id: id });
          setIsAlertDialogOpen(true);
        }}
        onClickExportPDF={id => exportPDFButton(id)}
        usePagination={!search?.searchTerm?.length}
        showTotals
      />
      {!extraActivities.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetActivity;
