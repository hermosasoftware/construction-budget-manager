import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { FilePdf } from 'phosphor-react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { Input } from '../../../common/Form';
import { IProjectComparative } from '../../../../types/projectComparative';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { changeProjectComparatives } from '../../../../redux/reducers/projectComparativesSlice';
import { dolarFormat } from '../../../../utils/numbers';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import { updateBudgetActivityAdvance } from '../../../../services/BudgetActivityService';
import { updateExtraBudgetActivityAdvance } from '../../../../services/ExtraBudgetActivityService';
import SearchInput from '../../../common/SearchInput/SearchInput';

import styles from './ComparativeReport.module.css';

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

const ComparativeReport: React.FC<IComparativeReport> = props => {
  const [selectedItem, setSelectedItem] = useState<IProjectComparative>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const projectComparative = useAppSelector(
    state => state.projectComparatives.projectComparatives,
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
  const projectBudget = useAppSelector(
    state => state.projectBudget.projectBudget,
  );

  const tableHeader: TTableHeader[] = [
    { name: 'activity', value: appStrings.activity },
    {
      name: 'budget',
      value: appStrings.budget,
      isDollar: true,
      showTotal: true,
    },
    { name: 'advance', value: appStrings.advance, isGreen: true },
    {
      name: 'advanceAmount',
      value: appStrings.advanceAmount,
      isDollar: true,
      showTotal: true,
    },
    {
      name: 'accounting',
      value: appStrings.accounting,
      isDollar: true,
      showTotal: true,
    },
    {
      name: 'difference',
      value: appStrings.difference,
      isDollar: true,
      showTotal: true,
    },
  ];

  const loadComparativeList = () => {
    dispatch(
      changeProjectComparatives([
        ...processActivityList(budgetActivities),
        ...processActivityList(extraActivities, 'extra'),
      ]),
    );
  };

  const processActivityList = (
    activityList: IBudgetActivity[],
    type?: string,
  ) =>
    activityList?.map(data => {
      const relatedOrders = projectOrders?.filter(
        order => order?.activity === data?.id,
      );
      const budget =
        data?.sumMaterials /
        Number(type === 'extra' ? data?.exchange : projectBudget?.exchange);
      const advanceAmount = (data?.advance * budget) / 100;
      const accounting = relatedOrders?.reduce(
        (total, order) =>
          total +
            order?.products?.reduce(
              (subtotal, product) =>
                subtotal +
                product?.cost * product?.quantity +
                (product?.tax
                  ? product?.cost * product?.quantity * (product?.tax / 100)
                  : 0),
              0,
            ) /
              order?.exchange || 0,
        0,
      );
      return {
        id: data?.id,
        activity: data?.activity,
        isExtra: type === 'extra',
        budget,
        advance: data?.advance,
        advanceAmount,
        accounting,
        difference: advanceAmount - accounting,
      };
    });

  const formatTableData = () =>
    projectComparative.map(data => ({
      ...data,
      activity: `${data?.activity} ${
        data?.isExtra ? `(${appStrings?.extra})` : ''
      }`,
      budget: dolarFormat(data?.budget),
      advance: `${data?.advance} %`,
      advanceAmount: dolarFormat(data?.advanceAmount),
      accounting: dolarFormat(data?.accounting),
      difference: dolarFormat(data?.difference),
    }));

  const editButton = async (budgetActivityId: string) => {
    const element = projectComparative.find(
      data => data.id === budgetActivityId,
    );
    if (element) {
      setSelectedItem(element);
      setIsModalOpen(true);
    }
  };

  const handleSearch = async (event: { target: { value: string } }) =>
    setSearchTerm(event.target.value.toUpperCase());

  const handleOnSubmit = async (projectComparative: IProjectComparative) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      activityId: projectComparative.id,
      advance: +projectComparative.advance,
      appStrings,
      successCallback,
    };
    !projectComparative?.isExtra
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
    <div className={styles.operations_container}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        <Flex marginBottom="5px" className={styles.menu_container}>
          <SearchInput
            className={styles.search_button}
            placeholder="Search"
            onChange={handleSearch}
          />
          <div style={{ textAlign: 'end' }}>
            <Button
              onClick={() => {
                navigate(
                  `/project-detail/${projectId}/comparatives-pdf-preview/${JSON.stringify(
                    searchTerm,
                  )}`,
                );
              }}
              className={styles.pdf_button}
            >
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
                {appStrings.editElement}
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
                  placeholder={appStrings.advancePercentage}
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
          filter={value =>
            searchTerm === '' ||
            value.activity.toUpperCase().includes(searchTerm)
          }
          onClickEdit={id => editButton(id)}
          usePagination={!searchTerm?.length}
          showTotals
        />
        {!projectComparative.length ? <h1>{appStrings.noRecords}</h1> : null}
      </Box>
    </div>
  );
};

export default ComparativeReport;
