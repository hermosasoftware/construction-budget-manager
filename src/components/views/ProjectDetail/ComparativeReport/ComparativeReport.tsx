import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { FilePdf } from 'phosphor-react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchFilter, {
  FilterOption,
  handleFilterSearch,
  Search,
} from '../../../common/SearchFilter/SearchFilter';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { Input } from '../../../common/Form';
import { IProjectComparative } from '../../../../types/projectComparative';
import { useAppSelector } from '../../../../redux/hooks';
import { dolarFormat } from '../../../../utils/numbers';
import styles from './ComparativeReport.module.css';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import { updateBudgetActivityAdvance } from '../../../../services/BudgetActivityService';
import { updateExtraBudgetActivityAdvance } from '../../../../services/ExtraBudgetActivityService';

interface IComparativeReport {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  activity: '',
  budget: 0,
  advance: 0,
  advanceAmount: 0,
  accounting: 0,
  difference: 0,
};

const initialSearchData = {
  selectedOption: { label: 'name', value: '' },
  searchTerm: '',
  firstDate: new Date(),
  secondDate: new Date(),
};

const ComparativeReport: React.FC<IComparativeReport> = props => {
  const [selectedItem, setSelectedItem] = useState<IProjectComparative>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [comparativeList, setcomparativeList] = useState<IProjectComparative[]>(
    [],
  );
  const budgetActivities = useAppSelector(
    state => state.budgetActivities.budgetActivities,
  );
  const extraActivities = useAppSelector(
    state => state.extraActivities.extraActivities,
  );
  const projectOrders = useAppSelector(
    state => state.projectOrders.projectOrders,
  );
  const navigate = useNavigate();
  const tableHeader: TTableHeader[] = [
    { name: 'activity', value: appStrings.description },
    { name: 'budget', value: appStrings.budget },
    { name: 'advance', value: appStrings.advance, isGreen: true },
    { name: 'advanceAmount', value: appStrings.advanceAmount },
    { name: 'accounting', value: appStrings.accounting },
    { name: 'difference', value: appStrings.difference },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'name', value: '', hasSuggestions: false },
  ];

  const loadComparativeList = () => {
    setcomparativeList([
      ...processActivityList(budgetActivities),
      ...processActivityList(extraActivities, 'extra'),
    ]);
  };

  const processActivityList = (
    activityList: IBudgetActivity[],
    type?: string,
  ) =>
    activityList.map(data => {
      const relatedOrders = projectOrders.filter(
        order => order.activity === data.id,
      );
      const advanceAmount = (data.advance * data.sumMaterials) / 100;
      const accounting = relatedOrders.reduce(
        (total, order) =>
          total +
          order.products.reduce(
            (subtotal, product) => subtotal + product.cost * product.quantity,
            0,
          ),
        0,
      );

      return {
        id: data.id,
        activity: data.activity,
        isExtra: type === 'extra',
        budget: data.sumMaterials,
        advance: data.advance,
        advanceAmount,
        accounting,
        difference: advanceAmount - accounting,
      };
    });

  const formatTableData = () =>
    comparativeList.map(data => ({
      ...data,
      activity: `${data.activity} ${data.isExtra ? '(Extra)' : ''}`,
      budget: dolarFormat(data.budget),
      advance: `${data.advance} %`,
      advanceAmount: dolarFormat(data.advanceAmount),
      accounting: dolarFormat(data.accounting),
      difference: dolarFormat(data.difference),
    }));

  const editButton = async (budgetActivityId: string) => {
    const element = comparativeList.find(data => data.id === budgetActivityId);
    if (element) {
      setSelectedItem(element);
      setIsModalOpen(true);
    }
  };

  const handleOnSubmit = async (projectComparative: IProjectComparative) => {
    const successCallback = (item: IProjectComparative) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      activityId: projectComparative.id,
      advance: projectComparative.advance,
      appStrings,
      successCallback,
    };
    projectComparative?.isExtra
      ? await updateBudgetActivityAdvance(serviceCallParameters)
      : await updateExtraBudgetActivityAdvance(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    advance: yup
      .number()
      .positive()
      .min(0)
      .max(100)
      .required(appStrings?.requiredField),
  });

  useEffect(
    () => loadComparativeList(),
    [budgetActivities, extraActivities, projectOrders],
  );

  return (
    <div className={`${styles.operations_container}`}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        <Flex marginBottom="5px" className={styles.menu_container}>
          <SearchFilter
            search={search}
            setSearch={setSearch}
            data={formatTableData()}
            options={filterOptions}
          />
          <div style={{ textAlign: 'end' }}>
            <Button onClick={() => {}} className={styles.pdf_button}>
              <FilePdf size={18} />
            </Button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setSelectedItem(initialSelectedItemData);
                setIsModalOpen(false);
              }}
            >
              <Heading as="h2" size="lg">
                {appStrings.addExpense}
              </Heading>
              <Form
                id="comparative-form"
                initialFormData={selectedItem}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={handleOnSubmit}
              >
                <Input
                  name="activity"
                  label={appStrings.activity}
                  placeholder={appStrings.activityName}
                  isDisabled
                />
                <Input
                  name="advance"
                  label={appStrings.advance}
                  placeholder={appStrings.expenseName}
                />
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
          items={formatTableData()}
          filter={value => handleFilterSearch(value, search)}
          onClickEdit={id => editButton(id)}
          usePagination={!search?.searchTerm?.length}
          showTotals
        />
        {!comparativeList.length ? <h1>{appStrings.noRecords}</h1> : null}
      </Box>
    </div>
  );
};

export default ComparativeReport;
