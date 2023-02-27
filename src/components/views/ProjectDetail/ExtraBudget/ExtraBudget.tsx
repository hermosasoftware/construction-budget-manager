import React, { useEffect, useState } from 'react';
import { Box, Divider, Text } from '@chakra-ui/react';
import * as yup from 'yup';
import { CaretLeft, FilePdf } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import BudgetMaterial from './BudgetMaterial/BudgetMaterial';
import BudgetLabor from './BudgetLabor/BudgetLabor';
import BudgetSubcontract from './BudgetSubcontract/BudgetSubcontract';
import BudgetOther from './BudgetOther/BudgetOther';
import BudgetSummary from './BudgetSummary/BudgetSummary';
import Form from '../../../common/Form/Form';
import ExchangeInput from '../../../common/ExchangeInput/ExchangeInput';
import { getProjectExtraBudget } from '../../../../services/ProjectExtraBudgetService';
import { IProjectExtraBudget } from '../../../../types/projectExtraBudget';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import {
  getExtraBudgetActivity,
  getExtraBudgetActivityById,
  updateExtraBudgetActivityAdminFee,
  updateExtraBudgetActivityExchange,
} from '../../../../services/ExtraBudgetActivityService';
import BudgetActivity from './BudgetActivity/BudgetActivity';
import ActivitySummary from './BudgetActivity/ActivitySummary/ActivitySummary';
import Button from '../../../common/Button/Button';
import AdminFeeInput from '../../../common/AdminFeeInput';

import styles from './ExtraBudget.module.css';

interface IExtraBudgetView {
  projectId: string;
}

const ExtraBudget: React.FC<IExtraBudgetView> = props => {
  const { projectId } = props;
  const [selectedTab, setSelectedTab] = useState('summary');
  const [editExchange, setEditExchange] = useState(false);
  const [editAdminFee, setEditAdminFee] = useState(false);
  const [budget, setBudget] = useState<IProjectExtraBudget>();
  const [activityList, setActivityList] = useState<IBudgetActivity[]>([]);
  const [activity, setActivity] = useState<IBudgetActivity>();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const navigate = useNavigate();

  const getExtraBudget = async () => {
    const successCallback = (response: IProjectExtraBudget) =>
      setBudget(response);

    await getProjectExtraBudget({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getActivities = async () => {
    const successCallback = (response: IBudgetActivity[]) =>
      setActivityList(response);
    await getExtraBudgetActivity({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getActivity = async (extraBudgetActivityId: string) => {
    const successCallback = (response: IBudgetActivity) => {
      setActivity(response);
      const index = activityList.findIndex(e => e.id === response.id);
      const data = [...activityList];
      data.splice(index, 1, response);
      setActivityList(data);
    };
    await getExtraBudgetActivityById({
      projectId,
      extraBudgetActivityId,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmitExchange = async (
    extraBudgetActivity: IBudgetActivity,
  ) => {
    const successCallback = () => {
      setEditExchange(false);
      getActivity(extraBudgetActivity.id);
    };

    await updateExtraBudgetActivityExchange({
      projectId,
      extraBudgetActivityId: extraBudgetActivity.id,
      exchange: Number(extraBudgetActivity.exchange),
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmitAdminFee = async (
    extraBudgetActivity: IBudgetActivity,
  ) => {
    const successCallback = () => {
      setEditAdminFee(false);
      getActivity(extraBudgetActivity.id);
    };
    const serviceCallParameters = {
      projectId,
      extraBudgetActivityId: extraBudgetActivity.id,
      adminFee: Number(extraBudgetActivity.adminFee),
      appStrings,
      successCallback,
    };
    await updateExtraBudgetActivityAdminFee(serviceCallParameters);
  };

  const validationSchemaExchange = yup.object().shape({
    exchange: yup.number().positive().required(appStrings?.requiredField),
  });

  const validationSchemaAdminFee = yup.object().shape({
    adminFee: yup.number().min(0).max(100).required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getExtraBudget();
    getActivities();
    return () => abortController.abort();
  }, []);

  const contentToDisplay = (option: string) => {
    const contentOptions: any = activity
      ? {
          summary: (
            <ActivitySummary
              projectId={projectId}
              budget={budget!}
              activity={activity}
            />
          ),
          materials: (
            <BudgetMaterial
              projectId={projectId}
              getExtraBudget={getExtraBudget}
              budget={budget!}
              getActivity={getActivity}
              activity={activity}
            />
          ),
          labors: (
            <BudgetLabor
              projectId={projectId}
              getExtraBudget={getExtraBudget}
              budget={budget!}
              getActivity={getActivity}
              activity={activity}
            />
          ),
          subcontracts: (
            <BudgetSubcontract
              projectId={projectId}
              getExtraBudget={getExtraBudget}
              budget={budget!}
              getActivity={getActivity}
              activity={activity}
            />
          ),
          others: (
            <BudgetOther
              projectId={projectId}
              getExtraBudget={getExtraBudget}
              budget={budget!}
              getActivity={getActivity}
              activity={activity}
            />
          ),
        }
      : {
          summary: (
            <BudgetSummary
              budget={budget!}
              activityList={activityList}
              projectId={projectId}
            />
          ),
          activity: (
            <BudgetActivity
              projectId={projectId}
              getExtraBudget={getExtraBudget}
              budget={budget!}
              activityList={activityList}
              setActivity={setActivity}
            />
          ),
        };
    return contentOptions[option];
  };

  return (
    <div className={styles.operations_container}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        <div className={styles.toolBar__container}>
          {activity ? (
            <>
              <div className={styles.tab__container}>
                <Button
                  onClick={() => {
                    setActivity(undefined);
                  }}
                  variant={'ghost'}
                >
                  <CaretLeft size={24} /> <Text>{activity.activity}</Text>
                </Button>
                <Divider orientation="vertical" />
                <TabGroup
                  className={styles.tabs}
                  tabs={[
                    {
                      id: 'summary',
                      name: appStrings.summary,
                      selected: true,
                    },
                    { id: 'materials', name: appStrings.materials },
                    { id: 'labors', name: appStrings.labors },
                    { id: 'subcontracts', name: appStrings.subcontracts },
                    { id: 'others', name: appStrings.others },
                  ]}
                  variant="rounded"
                  onSelectedTabChange={activeTabs =>
                    setSelectedTab(activeTabs[0])
                  }
                />
              </div>
              <Form
                id="exchange-form"
                initialFormData={activity}
                validationSchema={validationSchemaExchange}
                validateOnBlur
                style={{ alignItems: 'end', flex: 1 }}
                onSubmit={handleOnSubmitExchange}
              >
                <ExchangeInput
                  editExchange={editExchange}
                  onClick={() => setEditExchange(true)}
                />
              </Form>
              <Form
                id="adminfee-form"
                initialFormData={activity}
                validationSchema={validationSchemaAdminFee}
                validateOnBlur
                style={{ alignItems: 'end', marginLeft: '10px' }}
                onSubmit={handleOnSubmitAdminFee}
              >
                <AdminFeeInput
                  editAdminFee={editAdminFee}
                  onClick={() => setEditAdminFee(true)}
                />
              </Form>
              <Button
                onClick={() => {
                  navigate(
                    `/project-detail/${projectId}/extra-pdf-preview/${activity.id}`,
                  );
                }}
                className={styles.pdf_button}
              >
                <FilePdf size={24} />
              </Button>
            </>
          ) : (
            <TabGroup
              className={styles.tabs}
              tabs={[
                { id: 'summary', name: appStrings.summary, selected: true },
                { id: 'activity', name: appStrings.activities },
              ]}
              variant="rounded"
              onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
            />
          )}
        </div>
        {budget ? contentToDisplay(selectedTab) : null}
      </Box>
    </div>
  );
};

export default ExtraBudget;
