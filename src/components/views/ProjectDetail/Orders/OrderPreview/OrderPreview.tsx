import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Skeleton } from '@chakra-ui/react';
import { ArrowLeft } from 'phosphor-react';
import { useAppSelector } from '../../../../../redux/hooks';
import OrderReport from '../../../../reports/OrderReport/OrderReport';
import { getProjectById } from '../../../../../services/ProjectService';
import { getProjectOrderById } from '../../../../../services/ProjectOrderService';
import { IProjectOrder } from '../../../../../types/projectOrder';
import { IProject } from '../../../../../types/project';
import DownloadPDF from '../../../../common/PDF/DownloadPDF';

import styles from './OrderPreview.module.css';

export default function OrderPreview() {
  const projectId = useParams().projectId as string;
  const projectOrderId = useParams().orderId as string;
  const activity = useParams().activity as string;
  const navigate = useNavigate();
  const [order, setOrder] = useState<IProjectOrder>();
  const [project, setProject] = useState<IProject>();
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
  const getProjectOrder = async () => {
    const successCallback = (response: IProjectOrder) => {
      setOrder({ ...response, activity });
    };
    await getProjectOrderById({
      projectId,
      projectOrderId,
      appStrings,
      successCallback,
    });
  };

  useEffect(() => {
    let abortController = new AbortController();

    getProject();
    getProjectOrder();

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
      <DownloadPDF fileName={`Orden-${order?.order}-${project?.name}`}>
        <OrderReport
          project={project!}
          order={order!}
          noteValue={noteValue}
          setNoteValue={setNoteValue}
          pdfMode={true}
        ></OrderReport>
      </DownloadPDF>
    </div>
  );

  return (
    <>
      {project && order ? (
        <div className={`${styles.page_container}`}>
          <PDFToolbar />
          <OrderReport
            project={project}
            order={order}
            noteValue={noteValue}
            setNoteValue={setNoteValue}
            pdfMode={false}
          ></OrderReport>
        </div>
      ) : (
        <Skeleton className={styles.page_container} height={'95%'} />
      )}
    </>
  );
}
