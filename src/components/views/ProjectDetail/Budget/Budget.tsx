import React, { useEffect, useState } from 'react';
import { Box, Divider, Heading, Text } from '@chakra-ui/react';
import { CaretLeft, FilePdf } from 'phosphor-react';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../redux/hooks';
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
import { getBudgetActivityById } from '../../../../services/BudgetActivityService';
import { updateProject } from '../../../../services/ProjectService';
import { IProjectBudget } from '../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../types/budgetActivity';
import { IProject } from '../../../../types/project';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import AdminFeeInput from '../../../common/AdminFeeInput';

import styles from './Budget.module.css';

interface IBudgetView {
  projectId: string;
  project: IProject;
  setProject: Function;
}

const Budget: React.FC<IBudgetView> = props => {
  const { projectId, project, setProject } = props;
  const [activity, setActivity] = useState<IBudgetActivity>();
  const [selectedActivityTab, setSelectedActivityTab] = useState(false);
  const [selectedTab, setSelectedTab] = useState('summary');
  const [editExchange, setEditExchange] = useState(false);
  const [editAdminFee, setEditAdminFee] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(project?.budgetOpen);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectBudget = useAppSelector(
    state => state.projectBudget.projectBudget,
  );
  const navigate = useNavigate();

  const getActivity = async (budgetActivityId: string) => {
    const successCallback = (response: IBudgetActivity) =>
      setActivity(response);
    await getBudgetActivityById({
      projectId,
      budgetActivityId,
      appStrings,
      successCallback,
    });
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

  const contentToDisplay = (option: string) => {
    const contentOptions: any = activity
      ? {
          materials: (
            <BudgetMaterial
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              budget={projectBudget!}
              getActivity={getActivity}
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
              budget={projectBudget!}
              setActivity={setActivity}
            />
          ),
          labors: (
            <BudgetLabor
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              budget={projectBudget!}
            />
          ),
          subcontracts: (
            <BudgetSubcontract
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
              budget={projectBudget!}
            />
          ),
          others: (
            <BudgetOther
              projectId={projectId}
              isBudgetOpen={isBudgetOpen}
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
                    id: 'materials',
                    name: appStrings.materials,
                    selected: true,
                  },
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
                { id: 'labors', name: appStrings.labors },
                { id: 'subcontracts', name: appStrings.subcontracts },
                { id: 'others', name: appStrings.others },
              ]}
              variant="rounded"
              onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
            />
          )}
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
              isDisabled={!isBudgetOpen}
            />
          </Form>
          <Form
            id="adminfee-form"
            initialFormData={projectBudget}
            validationSchema={validationSchemaAdminFee}
            validateOnBlur
            style={{ alignItems: 'end', marginLeft: '10px' }}
            onSubmit={handleOnSubmitAdminFee}
          >
            <AdminFeeInput
              editAdminFee={editAdminFee}
              onClick={() => setEditAdminFee(true)}
              isDisabled={!isBudgetOpen}
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
            disabled={!isBudgetOpen}
            className={styles.close_budget}
          >
            {`${
              isBudgetOpen ? appStrings.closeBudget : appStrings.budgetClosed
            }`}
          </Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Heading as="h2" size="lg">
              {appStrings.closingBudget}
            </Heading>
            <div>
              {appStrings.closingBudgetWarning}
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
                  {appStrings.closeBudget}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
        {projectBudget ? contentToDisplay(selectedTab) : null}
      </Box>
    </div>
  );
};

export default Budget;
