import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
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
  createBudgetActivity,
  deleteBudgetActivity,
  getBudgetActivityById,
  updateBudgetActivity,
} from '../../../../../services/BudgetActivityService';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Form, { DatePicker, Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';
import { formatDate } from '../../../../../utils/dates';

import styles from './BudgetActivity.module.css';

interface IBudgetActivityView {
  projectId: string;
  isBudgetOpen: boolean;
  hasHighPrivilegies: boolean;
  budget: IProjectBudget;
  setActivity: Function;
}

const initialSelectedItemData = {
  id: '',
  activity: '',
  advance: 0,
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
  const { projectId, isBudgetOpen, hasHighPrivilegies, budget, setActivity } =
    props;
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const budgetActivities = useAppSelector(
    state => state.budgetActivities.budgetActivities,
  );

  const tableHeader: TTableHeader[] = [
    { name: 'activity', value: appStrings.name },
    { name: 'date', value: appStrings.date },
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

  const filterOptions: FilterOption[] = [
    { name: 'activity', value: '', hasSuggestions: true },
    { name: 'date', value: new Date(), hasSuggestions: true },
  ];

  const formatTableData = () =>
    budgetActivities.map(data => ({
      ...data,
      date: formatDate(new Date(data.date), 'MM/DD/YYYY'),
      subtotal: colonFormat(data.sumMaterials),
      dollars: dolarFormat(data.sumMaterials / budget.exchange),
    }));

  const editButton = async (budgetActivityId: string) => {
    const successCallback = (response: IBudgetActivity) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getBudgetActivityById({
      projectId,
      budgetActivityId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteBudgetActivity({
      projectId,
      budgetActivityId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    navigate(
      `/project-detail/${projectId}/budget/materials?activityId=${row.id}`,
    );
  };

  const handleOnSubmit = async (budgetActivity: IBudgetActivity) => {
    const successCallback = (item: IBudgetActivity) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      budgetActivity,
      appStrings,
      successCallback,
    };
    budgetActivity.id
      ? await updateBudgetActivity(serviceCallParameters)
      : await createBudgetActivity(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    activity: yup.string().required(appStrings?.requiredField),
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
          {(isBudgetOpen || hasHighPrivilegies) && (
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
        hideOptions={!isBudgetOpen && !hasHighPrivilegies}
        usePagination={!search?.searchTerm?.length}
        showTotals
      />
      {!budgetActivities.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetActivity;
