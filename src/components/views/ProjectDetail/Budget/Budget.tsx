import React, { useEffect, useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import { useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import BudgetMaterial from './BudgetMaterial/BudgetMaterial';
import BudgetLabor from './BudgetLabor/BudgetLabor';
import BudgetSubcontract from './BudgetSubcontract/BudgetSubcontract';
import BudgetSummary from './BudgetSummary/BudgetSummary';
import Form from '../../../common/Form/Form';
import ExchangeInput from '../../../common/ExchangeInput/ExchangeInput';
import {
  getProjectBudget,
  updateProjectBudgetExchange,
} from '../../../../services/ProjectBudgetService';
import { IProjectBudget } from '../../../../types/projectBudget';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import { IProject } from '../../../../types/project';
import { updateProject } from '../../../../services/ProjectService';
import styles from './Budget.module.css';

interface IBudgetView {
  projectId: string;
  project: IProject;
  setProject: Function;
}

const Budget: React.FC<IBudgetView> = props => {
  const { project, setProject } = props;
  const [selectedTab, setSelectedTab] = useState('summary');
  const [editExchange, setEditExchange] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(project?.budgetOpen);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [budget, setBudget] = useState<IProjectBudget>();

  const getBudget = async () => {
    const successCallback = (response: IProjectBudget) => setBudget(response);
    await getProjectBudget({ projectId, appStrings, successCallback });
  };

  const handleOnSubmit = async (projectBudget: IProjectBudget) => {
    const successCallback = () => {
      setEditExchange(false);
      getBudget();
    };
    const serviceCallParameters = {
      projectId,
      exchange: +projectBudget.exchange,
      appStrings,
      successCallback,
    };
    await updateProjectBudgetExchange(serviceCallParameters);
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

  const validationSchema = yup.object().shape({
    exchange: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getBudget();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (project) {
      setIsBudgetOpen(project.budgetOpen);
    }
  }, [project]);

  const contentToDisplay = (option: string) => {
    const contentOptions: any = {
      summary: <BudgetSummary budget={budget!} projectId={projectId} />,
      materials: (
        <BudgetMaterial
          projectId={projectId}
          isBudgetOpen={isBudgetOpen}
          getBudget={getBudget}
          budget={budget!}
        />
      ),
      labors: (
        <BudgetLabor
          projectId={projectId}
          isBudgetOpen={isBudgetOpen}
          getBudget={getBudget}
          budget={budget!}
        />
      ),
      subcontracts: (
        <BudgetSubcontract
          projectId={projectId}
          isBudgetOpen={isBudgetOpen}
          getBudget={getBudget}
          budget={budget!}
        />
      ),
    };
    return contentOptions[option];
  };

  return (
    <div className={styles.operations_container}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        <div className={styles.toolBar__container}>
          <TabGroup
            className={styles.tabs}
            tabs={[
              { id: 'summary', name: 'Summary', selected: true },
              { id: 'materials', name: appStrings.materials },
              { id: 'labors', name: 'Labors' },
              { id: 'subcontracts', name: 'Subcontracts' },
            ]}
            variant="rounded"
            onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
          />

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
              isDisabled={!isBudgetOpen}
            />
          </Form>
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
        {budget ? contentToDisplay(selectedTab) : null}
      </Box>
    </div>
  );
};

export default Budget;
