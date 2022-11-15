import styles from './InitialPlan.module.css';
import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import * as yup from 'yup';
import { useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import MaterialPlan from './MaterialPlan/MaterialPlan';
import LaborPlan from './LaborPlan/LaborPlan';
import SubcontractPlan from './SubcontractPlan/SubcontractPlan';
import SummaryPlan from './SummaryPlan/SummaryPlan';
import Form from '../../../common/Form/Form';
import ExchangeInput from '../../../common/ExchangeInput/ExchangeInput';
import {
  getProjectBudget,
  updateProjectBudgetExchange,
} from '../../../../services/ProjectBudgetService';
import { IProjectBudget } from '../../../../types/projectBudget';

interface IInitialPlan {
  projectId: string;
}

const InitialPlan: React.FC<IInitialPlan> = props => {
  const [selectedTab, setSelectedTab] = useState('summary');
  const [editExchange, setEditExchange] = useState(false);
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
      exchange: projectBudget.exchange,
      appStrings,
      successCallback,
    };
    await updateProjectBudgetExchange(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    exchange: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getBudget();
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className={`${styles.operations_container}`}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        <div className={`${styles.toolBar__container}`}>
          <TabGroup
            className={`${styles.tabs}`}
            tabs={[
              { id: 'summary', name: 'Summary', selected: true },
              { id: 'materials', name: appStrings.materials },
              { id: 'labor', name: 'Labor' },
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
            ></ExchangeInput>
          </Form>
        </div>
        {budget ? (
          selectedTab === 'summary' ? (
            <SummaryPlan budget={budget} projectId={projectId}></SummaryPlan>
          ) : selectedTab === 'materials' ? (
            <MaterialPlan projectId={projectId}></MaterialPlan>
          ) : selectedTab === 'labor' ? (
            <LaborPlan projectId={projectId}></LaborPlan>
          ) : selectedTab === 'subcontracts' ? (
            <SubcontractPlan projectId={projectId}></SubcontractPlan>
          ) : null
        ) : null}
      </Box>
    </div>
  );
};

export default InitialPlan;
