import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@chakra-ui/react';
import { useAppSelector } from '../../../../../redux/hooks';
import BudgetReport from '../../../../reports/BudgetReport/BudgetReport';
import { getProjectById } from '../../../../../services/ProjectService';
import { getProjectBudget } from '../../../../../services/ProjectBudgetService';
import { getBudgetActivity } from '../../../../../services/BudgetActivityService';
import { getBudgetSubcontracts } from '../../../../../services/BudgetSubcontractsService';
import { getBudgetLabors } from '../../../../../services/BudgetLaborsService';
import { getBudgetMaterials } from '../../../../../services/BudgetMaterialsService';
import { getBudgetOthers } from '../../../../../services/BudgetOthersService';
import { IProject } from '../../../../../types/project';
import { IProjectBudget } from '../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import { IBudgetSubcontract } from '../../../../../types/budgetSubcontract';
import { IBudgetLabor } from '../../../../../types/budgetLabor';
import { IMaterialBreakdown } from '../../../../../types/collections';
import { IBudgetOther } from '../../../../../types/budgetOther';
import DownloadPDF from '../../../../common/PDF/DownloadPDF';

import styles from './BudgetPreview.module.css';

export default function ActivityPreview() {
  const projectId = useParams().projectId as string;
  const [project, setProject] = useState<IProject>();
  const [budget, setBudget] = useState<IProjectBudget>();
  const [activity, setActivity] = useState<IBudgetActivity[]>([]);
  const [noteValue, setNoteValue] = useState('');

  const appStrings = useAppSelector(state => state.settings.appStrings);

  const getProject = async () => {
    const successCallback = (response: IProject) => setProject(response);
    await getProjectById({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getBudget = async () => {
    const successCallback = (response: IProjectBudget) => setBudget(response);
    await getProjectBudget({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getActivity = async () => {
    const successCallback = (response: IBudgetActivity[]) => {
      const list = response.map(async element => {
        const materials = await getMaterials(element.id);
        const labors = await getLabors(element.id);
        const subcontracts = await getSubcontracts(element.id);
        const others = await getOthers(element.id);
        return { ...element, materials, labors, subcontracts, others };
      });
      Promise.all(list).then(a => setActivity(a));
    };
    await getBudgetActivity({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getMaterials = async (activityId: string) => {
    let list: IMaterialBreakdown[] = [];
    const successCallback = (response: IMaterialBreakdown[]) => {
      list = response;
    };

    await getBudgetMaterials({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const getLabors = async (activityId: string) => {
    let list: IBudgetLabor[] = [];
    const successCallback = (response: IBudgetLabor[]) => (list = response);
    await getBudgetLabors({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const getSubcontracts = async (activityId: string) => {
    let list: IBudgetSubcontract[] = [];
    const successCallback = (response: IBudgetSubcontract[]) =>
      (list = response);
    await getBudgetSubcontracts({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
    return list;
  };

  const getOthers = async (activityId: string) => {
    let list: IBudgetOther[] = [];
    const successCallback = (response: IBudgetOther[]) => (list = response);
    await getBudgetOthers({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
    return list;
  };

  useEffect(() => {
    let abortController = new AbortController();
    getProject();
    getBudget();
    getActivity();

    return () => abortController.abort();
  }, []);

  return (
    <>
      {project && budget && activity.length ? (
        <div className={`${styles.page_container}`}>
          <BudgetReport
            project={project}
            budget={budget}
            activity={activity}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            pdfMode={false}
          />
          <DownloadPDF fileName={`Budget-${project.name}`}>
            <BudgetReport
              project={project}
              budget={budget}
              activity={activity}
              noteValue={noteValue}
              setNoteValue={setNoteValue}
              pdfMode={true}
            />
          </DownloadPDF>
        </div>
      ) : (
        <Skeleton className={styles.page_container} height={'95%'} />
      )}
    </>
  );
}
