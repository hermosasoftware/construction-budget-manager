import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import * as yup from 'yup';
import { MagicWand } from 'phosphor-react';
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

interface IExtraBudgetView {
  projectId: string;
}

const ExtraBudget: React.FC<IExtraBudgetView> = props => {
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [selectedTab, setSelectedTab] = useState('summary');
  const [editExchange, setEditExchange] = useState(false);
  const [budget, setBudget] = useState<IProjectBudget>();
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

  const handleOnSubmit = async (projectBudget: IProjectBudget) => {
    const successCallback = () => {
      setEditExchange(false);
      getExtraBudget();
    };

    await updateProjectExtraBudgetExchange({
      projectId,
      exchange: projectBudget.exchange,
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
    const contentOptions: any = {
      summary: <BudgetSummary budget={budget!} projectId={projectId} />,
      materials: <BudgetMaterial projectId={projectId} />,
      labors: <BudgetLabor projectId={projectId} />,
      subcontracts: <BudgetSubcontract projectId={projectId} />,
    };
    return contentOptions[option];
  };

  return (
    <div className={styles.operations_container}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        {budget ? (
          <>
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
                onSelectedTabChange={activeTabs =>
                  setSelectedTab(activeTabs[0])
                }
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
