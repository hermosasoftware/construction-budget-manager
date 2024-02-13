import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Skeleton } from '@chakra-ui/react';
import { ArrowLeft } from 'phosphor-react';
import { useAppSelector } from '../../../../../redux/hooks';
import { getProjectById } from '../../../../../services/ProjectService';
import {
  Search,
  handleFilterSearch,
} from '../../../../common/SearchFilter/SearchFilter';
import { IProject } from '../../../../../types/project';
import DownloadPDF from '../../../../common/PDF/DownloadPDF';
import ExpenseReport from '../../../../reports/ExpenseReport/ExpensesReportPDF';

import styles from './ExpensesPreview.module.css';

export default function ExpensesPreview() {
  const projectId = useParams().projectId as string;
  const search = JSON.parse(useParams().search as string) as Search;
  const navigate = useNavigate();
  const [project, setProject] = useState<IProject>();
  const [noteValue, setNoteValue] = useState('');

  const appStrings = useAppSelector(state => state.settings.appStrings);
  const expenses = useAppSelector(
    state => state.projectExpenses.projectExpenses,
  );

  const getProject = async () => {
    const successCallback = (response: IProject) => setProject(response);
    await getProjectById({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const filterExpenses = () =>
    expenses.filter(value => handleFilterSearch(value, search));

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
          <ExpenseReport
            project={project!}
            expenses={filterExpenses()!}
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
      {project && expenses ? (
        <div className={`${styles.page_container}`}>
          <PDFToolbar />
          <ExpenseReport
            project={project}
            expenses={filterExpenses()}
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
