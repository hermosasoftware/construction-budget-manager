import React, { useEffect, useState } from 'react';
import { Box, Divider, Heading, Text } from '@chakra-ui/react';
import { CaretLeft, FilePdf } from 'phosphor-react';
import * as yup from 'yup';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import BudgetActivity from './BudgetActivity/BudgetActivity';
import BudgetMaterial from './BudgetMaterial/BudgetMaterial';
import BudgetLabor from './BudgetLabor/BudgetLabor';
import BudgetSubcontract from './BudgetSubcontract/BudgetSubcontract';
import BudgetOther from './BudgetOther/BudgetOther';
import BudgetSummary from './BudgetSummary/BudgetSummary';
import Form from '../../../common/Form/Form';
import ExchangeInput from '../../../common/ExchangeInput/ExchangeInput';
import {
  updateProjectBudgetAdminFee,
  updateProjectBudgetExchange,
} from '../../../../services/ProjectBudgetService';
import { updateProject } from '../../../../services/ProjectService';
import { IProjectBudget } from '../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import { IProject } from '../../../../types/project';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import AdminFeeInput from '../../../common/AdminFeeInput';
import { listenBudgetMaterials } from '../../../../services/BudgetMaterialsService';
import { listenersList } from '../../../../services/herperService';
import { changeBudgetMaterials } from '../../../../redux/reducers/budgetMaterialsSlice';
import { isManagerOrAdmin } from '../../../../utils/permisions';

import styles from './Budget.module.css';

interface IBudgetView {
  projectId: string;
  project: IProject;
  setProject: Function;
}

const Budget: React.FC<IBudgetView> = props => {
  const { projectId, project, setProject } = props;
  const selectedTab = useParams().tab as string;
  const [searchParams] = useSearchParams();
  const budgetActivities = useAppSelector(
    state => state.budgetActivities.budgetActivities,
  );
  const [activity, setActivity] = useState<IBudgetActivity>(
    budgetActivities.find(row => row.id === searchParams.get('activityId'))!,
  );
  const [editExchange, setEditExchange] = useState(false);
  const [editAdminFee, setEditAdminFee] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(project?.budgetOpen);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectBudget = useAppSelector(
    state => state.projectBudget.projectBudget,
  );
  const sessionUser = useAppSelector(state => state.session.user);
  const [hasExtraPrivilegies, setHasExtraPrivilegies] = useState(
    isManagerOrAdmin(sessionUser!),
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const budgetMaterialsListener = (activityId: string) => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: activityId,
        name: 'budgetMaterials',
        stop: response,
      });
    };
    listenBudgetMaterials({
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
    if (!listenersList.some(listener => listener.name === 'budgetMaterials')) {
      budgetMaterialsListener(activityId);
      return true;
    }
    return false;
  };

  const replaceListeners = (activityId: string) => {
    const listeners = [...listenersList];
    listeners.forEach(listener => {
      if (listener.id && listener.id !== activityId) {
        switch (listener.name) {
          case 'budgetMaterials':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeBudgetMaterials([]));
            budgetMaterialsListener(activityId);
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

  const handleOnSubmitExchange = async (projectBudget: IProjectBudget) => {
    const successCallback = () => {
      setEditExchange(false);
    };
    const serviceCallParameters = {
      projectId,
      exchange: +projectBudget.exchange,
      appStrings,
      successCallback,
    };
    await updateProjectBudgetExchange(serviceCallParameters);
  };

  const handleOnSubmitAdminFee = async (projectBudget: IProjectBudget) => {
    const successCallback = () => {
      setEditAdminFee(false);
    };
    const serviceCallParameters = {
      projectId,
      adminFee: +projectBudget.adminFee,
      appStrings,
      successCallback,
    };
    await updateProjectBudgetAdminFee(serviceCallParameters);
  };

  const handleCloseBudget = () => {
    const successCallback = () => {
      setProject({ ...project, budgetOpen: false });
      setIsBudgetOpen(false);
      setIsModalOpen(false);
    };
    const errorCallBack = () => setIsModalOpen(false);
    const serviceCallParams = {
      project: { ...project, budgetOpen: false },
      appStrings,
      successCallback,
      errorCallBack,
    };
    updateProject(serviceCallParams);
  };

  const validationSchemaExchange = yup.object().shape({
    exchange: yup.number().positive().required(appStrings?.requiredField),
  });

  const validationSchemaAdminFee = yup.object().shape({
    adminFee: yup.number().min(0).max(100).required(appStrings?.requiredField),
  });

  useEffect(() => {
    if (project) {
      setIsBudgetOpen(project.budgetOpen);
    }
  }, [project]);
  useEffect(
    () => setHasExtraPrivilegies(isManagerOrAdmin(sessionUser!)),
    [sessionUser],
  );

  useEffect(() => {
    activity && checkListeners(activity.id);
  }, [activity]);

  const contentToDisplay = (option: string) => {
    const contentOptions: any = activity
      ? {
          materials: (
            <BudgetMaterial
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              hasExtraPrivilegies={hasExtraPrivilegies}
              budget={projectBudget!}
              activity={activity}
            />
          ),
        }
      : {
          summary: (
            <BudgetSummary budget={projectBudget!} projectId={projectId} />
          ),
          activity: (
            <BudgetActivity
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              hasExtraPrivilegies={hasExtraPrivilegies}
              budget={projectBudget!}
              setActivity={setActivity}
            />
          ),
          labors: (
            <BudgetLabor
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              hasExtraPrivilegies={hasExtraPrivilegies}
              budget={projectBudget!}
            />
          ),
          subcontracts: (
            <BudgetSubcontract
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              hasExtraPrivilegies={hasExtraPrivilegies}
              budget={projectBudget!}
            />
          ),
          others: (
            <BudgetOther
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              hasExtraPrivilegies={hasExtraPrivilegies}
              budget={projectBudget!}
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
            <div className={styles.tab__container}>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <CaretLeft size={24} /> <Text>{activity.activity}</Text>
              </Button>
              <Divider orientation="vertical" />
              <TabGroup
                className={styles.tabs}
                tabs={[
                  {
                    id: 'materials',
                    name: appStrings.materials,
                    selected: true,
                  },
                ]}
                variant="rounded"
              />
            </div>
          ) : (
            <TabGroup
              className={styles.tabs}
              tabs={[
                {
                  id: 'summary',
                  name: appStrings.summary,
                  selected: selectedTab === 'summary',
                },
                {
                  id: 'activity',
                  name: appStrings.activities,
                  selected: selectedTab === 'activity',
                },
                {
                  id: 'labors',
                  name: appStrings.labors,
                  selected: selectedTab === 'labors',
                },
                {
                  id: 'subcontracts',
                  name: appStrings.subcontracts,
                  selected: selectedTab === 'subcontracts',
                },
                {
                  id: 'others',
                  name: appStrings.others,
                  selected: selectedTab === 'others',
                },
              ]}
              variant="rounded"
              onSelectedTabChange={activeTabs =>
                activeTabs[0] !== selectedTab &&
                navigate(`/project-detail/${projectId}/budget/${activeTabs[0]}`)
              }
            />
          )}
          <div className={styles.operators__container}>
            <Form
              id="exchange-form"
              initialFormData={projectBudget}
              validationSchema={validationSchemaExchange}
              validateOnBlur
              style={{ alignItems: 'end', flex: 1 }}
              onSubmit={handleOnSubmitExchange}
            >
              <ExchangeInput
                editExchange={editExchange}
                onClick={() => setEditExchange(true)}
                isDisabled={!isBudgetOpen && !hasExtraPrivilegies}
              />
            </Form>
            <Form
              id="adminfee-form"
              initialFormData={projectBudget}
              validationSchema={validationSchemaAdminFee}
              validateOnBlur
              style={{ alignItems: 'end' }}
              onSubmit={handleOnSubmitAdminFee}
            >
              <AdminFeeInput
                editAdminFee={editAdminFee}
                onClick={() => setEditAdminFee(true)}
                isDisabled={!isBudgetOpen && !hasExtraPrivilegies}
              />
            </Form>
            {
              <Button
                onClick={() => {
                  navigate(`/project-detail/${projectId}/budget-pdf-preview`);
                }}
                className={styles.close_budget}
              >
                <FilePdf size={24} />
              </Button>
            }
            <Button
              onClick={() => {
                setIsModalOpen(true);
              }}
              disabled={!isBudgetOpen && !hasExtraPrivilegies}
              className={styles.close_budget}
            >
              {`${
                isBudgetOpen
                  ? appStrings.closeBudget
                  : hasExtraPrivilegies
                  ? appStrings.openBudget
                  : appStrings.budgetClosed
              }`}
            </Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <Heading as="h2" size="lg">
                {isBudgetOpen
                  ? appStrings.closingBudget
                  : appStrings.openingBudget}
              </Heading>
              <div>
                {isBudgetOpen
                  ? appStrings.closingBudgetWarning
                  : appStrings.openingBudgetWarning}
                <div className={styles.buttons_container}>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className={styles.close_budget}
                  >
                    {appStrings.cancel}
                  </Button>
                  <Button
                    onClick={() => handleCloseBudget()}
                    className={`${styles.close_budget} ${styles.button_danger}`}
                  >
                    {isBudgetOpen
                      ? appStrings.closeBudget
                      : appStrings.openBudget}
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
        {projectBudget ? contentToDisplay(selectedTab) : null}
      </Box>
    </div>
  );
};

export default Budget;
