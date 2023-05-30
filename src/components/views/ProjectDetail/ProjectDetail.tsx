import { useEffect, useState } from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import TabGroup from '../../common/TabGroup/TabGroup';
import { IProject } from '../../../types/project';
import ExpensesReport from './ExpensesReport/ExpensesReport';
import Orders from './Orders';
import Invoicing from './Invoicing';
import Budget from './Budget/Budget';
import ExtraBudget from './ExtraBudget/ExtraBudget';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { listenersList } from '../../../services/herperService';
import { listenProjectExpenses } from '../../../services/ProjectExpensesService';
import { changeProjectExpenses } from '../../../redux/reducers/projectExpensesSlice';
import { listenProjectInvoices } from '../../../services/ProjectInvoiceService';
import { changeProjectInvoices } from '../../../redux/reducers/projectInvoicesSlice';
import { changeProjectOrders } from '../../../redux/reducers/projectOrdersSlice';
import { listenProjectExtraBudget } from '../../../services/ProjectExtraBudgetService';
import { listenProjectBudget } from '../../../services/ProjectBudgetService';
import { listenProjectOrders } from '../../../services/ProjectOrderService';
import { listenBudgetActivities } from '../../../services/BudgetActivityService';
import { listenBudgetLabors } from '../../../services/BudgetLaborsService';
import { listenBudgetSubcontracts } from '../../../services/BudgetSubcontractsService';
import { listenExtraActivities } from '../../../services/ExtraBudgetActivityService';
import { listenBudgetOthers } from '../../../services/BudgetOthersService';
import { clearProjectBudget } from '../../../redux/reducers/projectBudgetSlice';
import { clearProjectExtraBudget } from '../../../redux/reducers/projectExtraBudgetSlice';
import { changeBudgetOthers } from '../../../redux/reducers/budgetOthersSlice';
import { changeBudgetSubcontracts } from '../../../redux/reducers/budgetSubcontractsSlice';
import { changeBudgetLabors } from '../../../redux/reducers/budgetLaborsSlice';
import { changeBudgetActivities } from '../../../redux/reducers/budgetActivitiesSlice';
import { changeExtraActivities } from '../../../redux/reducers/extraActivitiesSlice';
import { xml2json } from '../../../utils/xml2json';

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
  const projects = useAppSelector(state => state.projects.projects);
  const dispatch = useAppDispatch();

  const getProjectbyId = async () => {
    const elem = projects.find(project => project.id === projectId)!;
    setProject(elem);
  };

  const projectBudgetListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'projectBudget',
        stop: response,
      });
    };
    listenProjectBudget({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const projectExtraBudgetListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'projectExtraBudget',
        stop: response,
      });
    };
    listenProjectExtraBudget({
      projectId,
      appStrings,
      successCallback,
    });
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

  const budgetActivitiesListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'budgetActivities',
        stop: response,
      });
    };
    listenBudgetActivities({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const budgetLaborsListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'budgetLabors',
        stop: response,
      });
    };
    listenBudgetLabors({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const budgetSubcontractsListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'budgetSubcontracts',
        stop: response,
      });
    };
    listenBudgetSubcontracts({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const budgetOthersListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'budgetOthers',
        stop: response,
      });
    };
    listenBudgetOthers({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const extraActivitiesListener = () => {
    const successCallback = (response: Function) => {
      listenersList.push({
        id: projectId,
        name: 'extraActivities',
        stop: response,
      });
    };
    listenExtraActivities({
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
          listener.name === 'projectBudget' ||
          listener.name === 'projectExtraBudget' ||
          listener.name === 'projectOrders' ||
          listener.name === 'projectInvoices' ||
          listener.name === 'projectExpenses' ||
          listener.name === 'budgetActivities' ||
          listener.name === 'budgetLabors' ||
          listener.name === 'budgetSubcontracts' ||
          listener.name === 'budgetOthers' ||
          listener.name === 'extraActivities',
      )
    ) {
      projectBudgetListener();
      projectExtraBudgetListener();
      projectOrdersListener();
      projectInvoicesListener();
      projectExpensesListener();
      budgetActivitiesListener();
      budgetLaborsListener();
      budgetSubcontractsListener();
      budgetOthersListener();
      extraActivitiesListener();
      return true;
    }
    return false;
  };

  const replaceListeners = () => {
    const listeners = [...listenersList];
    listeners.forEach(listener => {
      if (listener.id && listener.id !== projectId) {
        switch (listener.name) {
          case 'projectBudget':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(clearProjectBudget());
            projectBudgetListener();
            break;
          case 'projectExtraBudget':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(clearProjectExtraBudget());
            projectExtraBudgetListener();
            break;
          case 'projectOrders':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeProjectOrders([]));
            projectOrdersListener();
            break;
          case 'projectInvoices':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeProjectInvoices([]));
            projectInvoicesListener();
            break;
          case 'projectExpenses':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeProjectExpenses([]));
            projectExpensesListener();
            break;
          case 'budgetActivities':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeBudgetActivities([]));
            budgetActivitiesListener();
            break;
          case 'budgetLabors':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeBudgetLabors([]));
            budgetLaborsListener();
            break;
          case 'budgetSubcontracts':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeBudgetSubcontracts([]));
            budgetSubcontractsListener();
            break;
          case 'budgetOthers':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeBudgetOthers([]));
            budgetOthersListener();
            break;
          case 'extraActivities':
            listener.stop();
            removeListenerItem(listener.id);
            dispatch(changeExtraActivities([]));
            extraActivitiesListener();
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

  useEffect(() => {
    getProjectbyId();
    checkListeners();
  }, []);

  const Header = () => {
    const textColor = useColorModeValue('teal.500', 'teal.300');
    const textColorRed = useColorModeValue('red.400', 'red.100');
    const accentColor = useColorModeValue('teal.100', 'teal.700');
    const accentColorRed = useColorModeValue('red.100', 'red.500');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.300');

    return (
      <Box borderBottomWidth="1px" px={4} py={3}>
        <Flex className="header" justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {project?.name}
          </Text>
          <Box
            bg={project?.status === 'active' ? accentColor : accentColorRed}
            px={3}
            py={1}
            borderRadius="md"
          >
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={project?.status === 'active' ? textColor : textColorRed}
            >
              {project?.status === 'active'
                ? appStrings.active
                : appStrings.inactive}
            </Text>
          </Box>
        </Flex>
        <Flex justify="space-between" align="center" mt={2}>
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            {`${appStrings.client}: ${project?.client}`}
          </Text>
          <Text fontSize="sm" fontWeight="medium" color={secondaryTextColor}>
            {`${appStrings.location}: ${project?.location}`}
          </Text>
        </Flex>
      </Box>
    );
  };

  return (
    <div className={`container ${styles.projects_container}`}>
      {/* <Box p={5} borderWidth="1px">
        <Flex className="header">
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
      </Box> */}
      <Header></Header>

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
  );
}
