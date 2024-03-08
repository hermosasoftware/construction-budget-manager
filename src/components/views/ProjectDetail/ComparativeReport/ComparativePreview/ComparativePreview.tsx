import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Skeleton } from '@chakra-ui/react';
import { ArrowLeft } from 'phosphor-react';
import { useAppSelector } from '../../../../../redux/hooks';
import { getProjectById } from '../../../../../services/ProjectService';
import { IProject } from '../../../../../types/project';
import DownloadPDF from '../../../../common/PDF/DownloadPDF';
import ComparativeReportPDF from '../../../../reports/ComparativeReport/ComparativeReportPDF';

import styles from './ComparativePreview.module.css';

export default function ComparativePreview() {
  const projectId = useParams().projectId as string;
  const searchTerm = useParams().search as string;
  const navigate = useNavigate();
  const [project, setProject] = useState<IProject>();
  const [noteValue, setNoteValue] = useState('');

  const appStrings = useAppSelector(state => state.settings.appStrings);
  const comparatives = useAppSelector(
    state => state.projectComparatives.projectComparatives,
  );

  const getProject = async () => {
    const successCallback = (response: IProject) => setProject(response);
    await getProjectById({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const filterComparatives = () =>
    comparatives.filter(
      value =>
        searchTerm === '""' ||
        value.activity.toUpperCase().includes(searchTerm),
    );

  useEffect(() => {
    let abortController = new AbortController();
    getProject();

    return () => abortController.abort();
  }, []);

  const PDFToolbar = () => (
    <div className={styles.toolbar_container}>
      <Button
        className={styles.toolbar_button}
        onClick={() => navigate(-1)}
        variant="unstyled"
        title={appStrings?.back}
      >
        <ArrowLeft size={22} />
      </Button>
      <div>
        <DownloadPDF fileName={`Budget-${project?.name}`}>
          <ComparativeReportPDF
            project={project!}
            comparatives={filterComparatives()!}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            pdfMode={true}
          />
        </DownloadPDF>
      </div>
    </div>
  );

  return (
    <>
      {project && comparatives ? (
        <div className={`${styles.page_container}`}>
          <PDFToolbar />
          <ComparativeReportPDF
            project={project}
            comparatives={filterComparatives()}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            pdfMode={false}
          />
        </div>
      ) : (
        <Skeleton className={styles.page_container} height={'95%'} />
      )}
    </>
  );
}
