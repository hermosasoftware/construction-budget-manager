import React, { useEffect, useState } from 'react';
import { Box, Divider, Text } from '@chakra-ui/react';
import * as yup from 'yup';
import { CaretLeft, FilePdf } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import BudgetMaterial from './BudgetMaterial/BudgetMaterial';
import BudgetLabor from './BudgetLabor/BudgetLabor';
import BudgetSubcontract from './BudgetSubcontract/BudgetSubcontract';
import BudgetOther from './BudgetOther/BudgetOther';
import BudgetSummary from './BudgetSummary/BudgetSummary';
import Form from '../../../common/Form/Form';
import ExchangeInput from '../../../common/ExchangeInput/ExchangeInput';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import {
  updateExtraBudgetActivityAdminFee,
  updateExtraBudgetActivityExchange,
} from '../../../../services/ExtraBudgetActivityService';
import BudgetActivity from './BudgetActivity/BudgetActivity';
import ActivitySummary from './BudgetActivity/ActivitySummary/ActivitySummary';
import Button from '../../../common/Button/Button';
import AdminFeeInput from '../../../common/AdminFeeInput';
import { listenExtraMaterials } from '../../../../services/ExtraBudgetMaterialsService';
import { listenExtraLabors } from '../../../../services/ExtraBudgetLaborsService';
import { listenExtraSubcontracts } from '../../../../services/ExtraBudgetSubcontractsService';
import { listenExtraOthers } from '../../../../services/ExtraBudgetOthersService';
import { changeExtraMaterials } from '../../../../redux/reducers/extraMaterialsSlice';
import { changeExtraLabors } from '../../../../redux/reducers/extraLaborsSlice';
import { changeExtraSubcontracts } from '../../../../redux/reducers/extraSubcontractsSlice';
import { changeExtraOthers } from '../../../../redux/reducers/extraOthersSlice';
import { listenersList } from '../../../../services/herperService';

import styles from './ExtraBudget.module.css';

interface IExtraBudgetView {
  projectId: string;
}

const ExtraBudget: React.FC<IExtraBudgetView> = props => {
  const { projectId } = props;
  const [selectedTab, setSelectedTab] = useState('summary');
  const [selectedActivityTab, setSelectedActivityTab] = useState(false);
  const [editExchange, setEditExchange] = useState(false);
  const [editAdminFee, setEditAdminFee] = useState(false);
  const [activity, setActivity] = useState<IBudgetActivity>();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectExtraBudget = useAppSelector(
    state => state.projectExtraBudget.projectExtraBudget,
  );
  const extraActivities = useAppSelector(
    state => state.extraActivities.extraActivities,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const extraMaterialsListener = (activityId: string) => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: activityId,
        name: 'extraMaterials',
        stop: response,
      });
    };
    listenExtraMaterials({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const extraLaborsListener = (activityId: string) => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: activityId,
        name: 'extraLabors',
        stop: response,
      });
    };
    listenExtraLabors({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const extraSubcontractsListener = (activityId: string) => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: activityId,
        name: 'extraSubcontracts',
        stop: response,
      });
    };
    listenExtraSubcontracts({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const extraOthersListener = (activityId: string) => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: activityId,
        name: 'extraOthers',
        stop: response,
      });
    };
    listenExtraOthers({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const checkListeners = (activityId: string) => {
    const band = startListeners(activityId);
    !band && replaceListeners(activityId);
  };

  const startListeners = (activityId: string) => {
    if (
      !listenersList.some(
        listener =>
          listener.name === 'extraMaterials' ||
          listener.name === 'extraLabors' ||
          listener.name === 'extraSubcontracts' ||
          listener.name === 'extratOthers',
      )
    ) {
      extraMaterialsListener(activityId);
      extraLaborsListener(activityId);
      extraSubcontractsListener(activityId);
      extraOthersListener(activityId);
      return true;
    }
    return false;
  };

  const replaceListeners = (activityId: string) => {
    const listeners = [...listenersList];
    listeners.forEach(listener => {
      if (listener.id && listener.id !== activityId) {
        switch (listener.name) {
          case 'extraMaterials':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeExtraMaterials([]));
            extraMaterialsListener(activityId);
            break;
          case 'extraLabors':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeExtraLabors([]));
            extraLaborsListener(activityId);
            break;
          case 'extraSubcontracts':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeExtraSubcontracts([]));
            extraSubcontractsListener(activityId);
            break;
          case 'extraOthers':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeExtraOthers([]));
            extraOthersListener(activityId);
            break;
          default:
            break;
        }
      }
    });
  };

  const removeListenerItem = (id: string) => {
    const index = listenersList.findIndex(e => e.id === id);
    listenersList.splice(index, 1);
  };

  const handleOnSubmitExchange = async (
    extraBudgetActivity: IBudgetActivity,
  ) => {
    const successCallback = () => {
      setEditExchange(false);
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
    activity && checkListeners(activity.id);
  }, [activity]);

  useEffect(() => {
    activity && setActivity(extraActivities.find(a => a.id === activity.id));
  }, [extraActivities]);

  const contentToDisplay = (option: string) => {
    const contentOptions: any = activity
      ? {
          summary: (
            <ActivitySummary
              projectId={projectId}
              budget={projectExtraBudget!}
              activity={activity}
            />
          ),
          materials: (
            <BudgetMaterial
              projectId={projectId}
              budget={projectExtraBudget!}
              activity={activity}
            />
          ),
          labors: <BudgetLabor projectId={projectId} activity={activity} />,
          subcontracts: (
            <BudgetSubcontract projectId={projectId} activity={activity} />
          ),
          others: <BudgetOther projectId={projectId} activity={activity} />,
        }
      : {
          summary: (
            <BudgetSummary budget={projectExtraBudget!} projectId={projectId} />
          ),
          activity: (
            <BudgetActivity projectId={projectId} setActivity={setActivity} />
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
                    setSelectedActivityTab(true);
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
                {
                  id: 'summary',
                  name: appStrings.summary,
                  selected: !selectedActivityTab,
                },
                {
                  id: 'activity',
                  name: appStrings.activities,
                  selected: selectedActivityTab,
                },
              ]}
              variant="rounded"
              onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
            />
          )}
        </div>
        {projectExtraBudget ? contentToDisplay(selectedTab) : null}
      </Box>
    </div>
  );
};

export default ExtraBudget;
