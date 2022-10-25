import styles from './InitialPlan.module.css';
import React, { useState } from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import TabGroup from '../../../common/TabGroup/TabGroup';
import MaterialPlan from './MaterialPlan/MaterialPlan';
import LaborPlan from './LaborPlan/LaborPlan';
import SubcontractPlan from './SubcontractPlan/SubcontractPlan';
import SummaryPlan from './SummaryPlan/SummaryPlan';
import { Box } from '@chakra-ui/react';

interface IInitialPlan {
  projectId: string;
}

const InitialPlan: React.FC<IInitialPlan> = props => {
  const [selectedTab, setSelectedTab] = useState('summary');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  return (
    <div className={`${styles.operations_container}`}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
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
        {selectedTab === 'summary' ? (
          <SummaryPlan projectId={projectId}></SummaryPlan>
        ) : selectedTab === 'materials' ? (
          <MaterialPlan projectId={projectId}></MaterialPlan>
        ) : selectedTab === 'labor' ? (
          <LaborPlan projectId={projectId}></LaborPlan>
        ) : selectedTab === 'subcontracts' ? (
          <SubcontractPlan projectId={projectId}></SubcontractPlan>
        ) : null}
      </Box>
    </div>
  );
};

export default InitialPlan;
