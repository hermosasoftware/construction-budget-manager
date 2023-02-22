import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../../../../redux/hooks';
import ExtraReport from '../../../../../reports/ExtraReport/ExtraReport';
import { getProjectById } from '../../../../../../services/ProjectService';
import { getExtraBudgetActivityById } from '../../../../../../services/ExtraBudgetActivityService';
import { getExtraBudgetSubcontracts } from '../../../../../../services/ExtraBudgetSubcontractsService';
import { getExtraBudgetLabors } from '../../../../../../services/ExtraBudgetLaborsService';
import { getExtraBudgetMaterials } from '../../../../../../services/ExtraBudgetMaterialsService';
import { getExtraBudgetOthers } from '../../../../../../services/ExtraBudgetOthersService';
import { IProject } from '../../../../../../types/project';
import { IBudgetActivity } from '../../../../../../types/budgetActivity';
import { IBudgetSubcontract } from '../../../../../../types/budgetSubcontract';
import { IBudgetLabor } from '../../../../../../types/budgetLabor';
import { IMaterialBreakdown } from '../../../../../../types/collections';
import { IBudgetOther } from '../../../../../../types/budgetOther';
import DownloadPDF from '../../../../../common/PDF/DownloadPDF';

import styles from './ActivityPreview.module.css';

export default function ActivityPreview() {
  const projectId = useParams().projectId as string;
  const activityId = useParams().activityId as string;
  const [project, setProject] = useState<IProject>();
  const [activity, setActivity] = useState<IBudgetActivity>();
  const [materials, setMaterials] = useState<IMaterialBreakdown[]>([]);
  const [labors, setLabors] = useState<IBudgetLabor[]>([]);
  const [subcontracts, setSubcontracts] = useState<IBudgetSubcontract[]>([]);
  const [others, setOthers] = useState<IBudgetOther[]>([]);
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

  const getActivity = async () => {
    const successCallback = (response: IBudgetActivity) =>
      setActivity(response);
    await getExtraBudgetActivityById({
      projectId,
      extraBudgetActivityId: activityId,
      appStrings,
      successCallback,
    });
  };

  const getMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setMaterials(response);
    await getExtraBudgetMaterials({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const getLabors = async () => {
    const successCallback = (response: IBudgetLabor[]) => setLabors(response);
    await getExtraBudgetLabors({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const getSubcontracts = async () => {
    const successCallback = (response: IBudgetSubcontract[]) =>
      setSubcontracts(response);
    await getExtraBudgetSubcontracts({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  const getOthers = async () => {
    const successCallback = (response: IBudgetOther[]) => setOthers(response);
    await getExtraBudgetOthers({
      projectId,
      activityId,
      appStrings,
      successCallback,
    });
  };

  useEffect(() => {
    let abortController = new AbortController();

    getProject();
    getActivity();
    getMaterials();
    getLabors();
    getSubcontracts();
    getOthers();

    return () => abortController.abort();
  }, []);

  return (
    <>
      {project && activity && (
        <div className={`${styles.page_container}`}>
          <ExtraReport
            project={project}
            activity={activity}
            materials={materials}
            labors={labors}
            subcontracts={subcontracts}
            others={others}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            pdfMode={false}
          ></ExtraReport>
          <DownloadPDF fileName={`Extra-${activity.activity}-${project.name}`}>
            <ExtraReport
              project={project}
              activity={activity}
              materials={materials}
              labors={labors}
              subcontracts={subcontracts}
              others={others}
              noteValue={noteValue}
              setNoteValue={setNoteValue}
              pdfMode={true}
            ></ExtraReport>
          </DownloadPDF>
        </div>
      )}
    </>
  );
}
