import React, { useEffect, useState } from 'react';
import { Box, Divider, Text } from '@chakra-ui/react';
import * as yup from 'yup';
import { CaretLeft, MagicWand } from 'phosphor-react';
import { useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import BudgetMaterial from './BudgetMaterial/BudgetMaterial';
import BudgetLabor from './BudgetLabor/BudgetLabor';
import BudgetSubcontract from './BudgetSubcontract/BudgetSubcontract';
import BudgetSummary from './BudgetSummary/BudgetSummary';
import Form from '../../../common/Form/Form';
import ExchangeInput from '../../../common/ExchangeInput/ExchangeInput';
import BigButton from '../../../common/BigButton/BigButton';
import {
  copyBudgetToExtraBudget,
  getProjectExtraBudget,
  updateProjectExtraBudgetExchange,
} from '../../../../services/ProjectExtraBudgetService';
import { IProjectBudget } from '../../../../types/projectBudget';

import styles from './ExtraBudget.module.css';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import { getExtraBudgetActivityById } from '../../../../services/ExtraBudgetActivityService';
import BudgetActivity from './BudgetActivity/BudgetActivity';
import ActivitySummary from './BudgetActivity/ActivitySummary/ActivitySummary';
import Button from '../../../common/Button/Button';

interface IExtraBudgetView {
  projectId: string;
}

const ExtraBudget: React.FC<IExtraBudgetView> = props => {
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [selectedTab, setSelectedTab] = useState('summary');
  const [editExchange, setEditExchange] = useState(false);
  const [budget, setBudget] = useState<IProjectBudget>();
  const [activity, setActivity] = useState<IBudgetActivity>();
  const [budgetFlag, setbudgetFlag] = useState(false);

  const getExtraBudget = async () => {
    const successCallback = (response: IProjectBudget) => {
      setBudget(response);
      setbudgetFlag(true);
    };
    await getProjectExtraBudget({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getActivity = async (extraBudgetActivityId: string) => {
    const successCallback = (response: IBudgetActivity) =>
      setActivity(response);
    await getExtraBudgetActivityById({
      projectId,
      extraBudgetActivityId,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectBudget: IProjectBudget) => {
    const successCallback = () => {
      setEditExchange(false);
      getExtraBudget();
    };

    await updateProjectExtraBudgetExchange({
      projectId,
      exchange: +projectBudget.exchange,
      appStrings,
      successCallback,
    });
  };

  const handleCopyBudget = async () => {
    const successCallback = () => {
      setEditExchange(false);
      getExtraBudget();
    };
    await copyBudgetToExtraBudget({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const validationSchema = yup.object().shape({
    exchange: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getExtraBudget();
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
        }
      : {
          summary: <BudgetSummary budget={budget!} projectId={projectId} />,
          activity: (
            <BudgetActivity
              projectId={projectId}
              getExtraBudget={getExtraBudget}
              budget={budget!}
              setActivity={setActivity}
            />
          ),
        };
    return contentOptions[option];
  };

  return (
    <div className={styles.operations_container}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        {budget ? (
          <>
            <div className={styles.toolBar__container}>
              {activity ? (
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
                    ]}
                    variant="rounded"
                    onSelectedTabChange={activeTabs =>
                      setSelectedTab(activeTabs[0])
                    }
                  />
                </div>
              ) : (
                <TabGroup
                  className={styles.tabs}
                  tabs={[
                    { id: 'summary', name: appStrings.summary, selected: true },
                    { id: 'activity', name: appStrings.activities },
                  ]}
                  variant="rounded"
                  onSelectedTabChange={activeTabs =>
                    setSelectedTab(activeTabs[0])
                  }
                />
              )}
              <Form
                id="exchange-form"
                initialFormData={budget}
                validationSchema={validationSchema}
                validateOnBlur
                style={{ alignItems: 'end', flex: 1 }}
                onSubmit={handleOnSubmit}
              >
                <ExchangeInput
                  editExchange={editExchange}
                  onClick={() => setEditExchange(true)}
                />
              </Form>
            </div>
            {contentToDisplay(selectedTab)}
          </>
        ) : budgetFlag ? (
          <BigButton
            title={appStrings.copyBudget}
            onClick={handleCopyBudget}
            illustration={
              <MagicWand color="var(--chakra-colors-purple-500)" size={50} />
            }
          />
        ) : null}
      </Box>
    </div>
  );
};

export default ExtraBudget;
