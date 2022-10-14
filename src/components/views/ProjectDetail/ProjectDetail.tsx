import styles from './ProjectDetail.module.css';
import { useEffect, useState } from 'react';
import { Box, Flex, useToast } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import TabGroup from '../../common/TabGroup/TabGroup';
import { getProjectById } from '../../../services/ProjectService';
import { IProject } from '../../../types/project';
import ExpensesReport from './ExpensesReport/ExpensesReport';
import MaterialsDelivered from './MaterialsDelivered/MaterialsDelivered';
import InitialPlan from './InitialPlan/InitialPlan';
import Sidebar from '../../layout/Sidebar';
import { useAppSelector } from '../../../redux/hooks';

export default function Projects() {
  const [selectedTab, setSelectedTab] = useState('initial');
  const [project, setProject] = useState<IProject>();
  const projectId = useParams().id as string;
  const toast = useToast();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  useEffect(() => {
    let abortController = new AbortController();
    const getProjectbyId = async () => {
      const response = await getProjectById({ projectId, toast, appStrings });
      if (response) setProject(response);
    };
    getProjectbyId();
    return () => {
      abortController.abort();
    };
  }, [projectId, toast, appStrings]);

  return (
    <>
      <Sidebar />
      <div className={`${styles.projects_container}`}>
        <Box p={5} borderWidth="1px">
          <Flex>
            <h1 className={`${styles.title}`}>
              {`${appStrings.project}: ${project?.name}`}
            </h1>
            <h1 className={`${styles.title}`}>
              {`${appStrings.client}: ${project?.client}`}
            </h1>
            <h1 className={`${styles.title}`}>
              {`${appStrings.location}: ${project?.location}`}
            </h1>
            <h1 className={`${styles.title}`}>
              {`${appStrings.status}: ${
                project?.status ? appStrings.active : appStrings.inactive
              }`}
            </h1>
          </Flex>
        </Box>

        <TabGroup
          className={`${styles.tabs}`}
          tabs={[
            { id: 'initial', name: appStrings.initialPlanning, selected: true },
            { id: 'delivered', name: appStrings.materialDelivered },
            { id: 'expenses', name: appStrings.expensesReport },
          ]}
          onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
        />
        {selectedTab === 'initial' ? (
          <InitialPlan projectId={projectId}></InitialPlan>
        ) : selectedTab === 'delivered' ? (
          <MaterialsDelivered projectId={projectId}></MaterialsDelivered>
        ) : selectedTab === 'expenses' ? (
          <ExpensesReport projectId={projectId}></ExpensesReport>
        ) : null}
      </div>
    </>
  );
}
