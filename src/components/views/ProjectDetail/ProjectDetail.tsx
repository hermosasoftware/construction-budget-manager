import { useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import TabGroup from '../../common/TabGroup/TabGroup';
import { getProjectById } from '../../../services/ProjectService';
import { IProject } from '../../../types/project';
import ExpensesReport from './ExpensesReport/ExpensesReport';
import Invoicing from './Invoicing';
import Budget from './Budget/Budget';
import ExtraBudget from './ExtraBudget/ExtraBudget';
import Sidebar from '../../layout/Sidebar';
import { useAppSelector } from '../../../redux/hooks';
import styles from './ProjectDetail.module.css';

const defaultProjectData = {
  id: '',
  name: '',
  client: '',
  location: '',
  status: 'active',
  budgetOpen: true,
};

export default function Projects() {
  const [selectedTab, setSelectedTab] = useState('budget');
  const [project, setProject] = useState<IProject>(defaultProjectData);
  const projectId = useParams().id as string;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  useEffect(() => {
    let abortController = new AbortController();
    const getProjectbyId = async () => {
      const successCallback = (response: IProject) => setProject(response);
      await getProjectById({ projectId, appStrings, successCallback });
    };
    getProjectbyId();
    return () => abortController.abort();
  }, [projectId]);

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
            { id: 'budget', name: appStrings.budget, selected: true },
            {
              id: 'extras',
              name: appStrings.extras,
              isDisable: project?.budgetOpen,
            },
            {
              id: 'invoicing',
              name: appStrings.invoicing,
              isDisable: project?.budgetOpen,
            },
            {
              id: 'expenses',
              name: appStrings.expensesReport,
              isDisable: project?.budgetOpen,
            },
          ]}
          onSelectedTabChange={activeTabs => setSelectedTab(activeTabs[0])}
        />
        {selectedTab === 'budget' ? (
          <Budget
            projectId={projectId}
            project={project}
            setProject={setProject}
          />
        ) : selectedTab === 'extras' ? (
          <ExtraBudget projectId={projectId} />
        ) : selectedTab === 'invoicing' ? (
          <Invoicing projectId={projectId} />
        ) : selectedTab === 'expenses' ? (
          <ExpensesReport projectId={projectId} />
        ) : null}
      </div>
    </>
  );
}
