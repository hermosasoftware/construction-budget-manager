import { useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import TabGroup from '../../common/TabGroup/TabGroup';
import { getProjectById } from '../../../services/ProjectService';
import { IProject } from '../../../types/project';
import ExpensesReport from './ExpensesReport/ExpensesReport';
import Orders from './Orders';
import Invoicing from './Invoicing';
import Budget from './Budget/Budget';
import ExtraBudget from './ExtraBudget/ExtraBudget';
import Sidebar from '../../layout/Sidebar';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { listenersList } from '../../../services/herperService';
import { listenProjectExpenses } from '../../../services/ProjectExpensesService';
import { changeProjectExpenses } from '../../../redux/reducers/projectExpensesSlice';
import { listenProjectInvoices } from '../../../services/ProjectInvoiceService';
import { changeProjectInvoices } from '../../../redux/reducers/projectInvoicesSlice';
import { changeProjectOrders } from '../../../redux/reducers/projectOrdersSlice';
import { listenProjectOrders } from '../../../services/ProjectOrderService';

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
  const dispatch = useAppDispatch();

  const getProjectbyId = async () => {
    const successCallback = (response: IProject) => setProject(response);
    await getProjectById({ projectId, appStrings, successCallback });
  };

  const projectOrdersListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'projectOrders',
        stop: response,
      });
    };
    listenProjectOrders({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const projectInvoicesListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'projectInvoices',
        stop: response,
      });
    };
    listenProjectInvoices({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const projectExpensesListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'projectExpenses',
        stop: response,
      });
    };
    listenProjectExpenses({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const checkListeners = () => {
    const band = startListeners();
    !band && replaceListeners();
  };

  const startListeners = () => {
    if (
      !listenersList.some(
        listener =>
          listener.name === 'projectOrders' ||
          listener.name === 'projectInvoices' ||
          listener.name === 'projectExpenses',
      )
    ) {
      projectOrdersListener();
      projectInvoicesListener();
      projectExpensesListener();
      return true;
    }
    return false;
  };

  const replaceListeners = () => {
    const listeners = [...listenersList];
    listeners.forEach(listener => {
      if (listener.id && listener.id !== projectId) {
        if (listener.name === 'projectOrders') {
          listener.stop();
          removeListenerItem(listener.id);
          dispatch(changeProjectOrders([]));

          projectOrdersListener();
        } else if (listener.name === 'projectInvoices') {
          listener.stop();
          removeListenerItem(listener.id);
          dispatch(changeProjectInvoices([]));

          projectInvoicesListener();
        } else if (listener.name === 'projectExpenses') {
          listener.stop();
          removeListenerItem(listener.id);
          dispatch(changeProjectExpenses([]));

          projectExpensesListener();
        }
      }
    });
  };

  const removeListenerItem = (id: string) => {
    const index = listenersList.findIndex(e => e.id === id);
    listenersList.splice(index, 1);
  };

  useEffect(() => {
    getProjectbyId();
    checkListeners();
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
              id: 'orders',
              name: appStrings.orders,
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
        ) : selectedTab === 'orders' ? (
          <Orders projectId={projectId} />
        ) : selectedTab === 'invoicing' ? (
          <Invoicing projectId={projectId} />
        ) : selectedTab === 'expenses' ? (
          <ExpensesReport projectId={projectId} />
        ) : null}
      </div>
    </>
  );
}
