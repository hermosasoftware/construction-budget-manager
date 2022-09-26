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

export default function Projects() {
  const [selectedTab, setSelectedTab] = useState('initial');
  const [project, setProject] = useState<IProject>();
  const projectId = useParams().id as string;
  const toast = useToast();

  useEffect(() => {
    let abortController = new AbortController();
    const getProjectbyId = async () => {
      const [errors, resProject] = await getProjectById(projectId);
      if (!errors && resProject) {
        setProject(resProject);
      } else {
        toast({
          title: 'Error al extraer la informacion',
          description: errors + '',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    };
    getProjectbyId();
    return () => {
      abortController.abort();
    };
  }, [projectId, toast]);

  return (
    <div className={`${styles.projects_container}`}>
      <Box p={5} borderWidth="1px">
        <Flex>
          <h1 className={`${styles.title}`}>Project: {project?.name}</h1>
          <h1 className={`${styles.title}`}>Client: {project?.client}</h1>
          <h1 className={`${styles.title}`}>Location: {project?.location}</h1>
          <h1 className={`${styles.title}`}>
            Status: {project?.status ? 'Active' : 'Inactive'}
          </h1>
        </Flex>
      </Box>

      <TabGroup
        className={`${styles.tabs}`}
        tabs={[
          { id: 'initial', name: 'Initial Planning', selected: true },
          { id: 'delivered', name: 'Materials Delivered' },
          { id: 'expenses', name: 'Expenses Report' },
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
  );
}
