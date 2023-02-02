import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const [order, setOrder] = useState<IProjectOrder>();
  const [project, setProject] = useState<IProject>();

  const appStrings = useAppSelector(state => state.settings.appStrings);

  useEffect(() => {
    let abortController = new AbortController();

    const getProject = async () => {
      const successCallback = (response: IProject) => setProject(response);
      await getProjectById({
        projectId,
        appStrings,
        successCallback,
      });
    };
    const getProjectOrder = async () => {
      const successCallback = (response: IProjectOrder) => setOrder(response);
      await getProjectOrderById({
        projectId,
        projectOrderId,
        appStrings,
        successCallback,
      });
    };

    getProject();
    getProjectOrder();

    return () => abortController.abort();
  }, []);

  return (
    <>
      {project && order && (
        <div className={`${styles.page_container}`}>
          <OrderReport
            project={project}
            order={order}
            pdfMode={false}
          ></OrderReport>
          <DownloadPDF fileName={`Orden-${order.order}-${project.name}`}>
            <OrderReport
              project={project}
              order={order}
              pdfMode={true}
            ></OrderReport>
          </DownloadPDF>
        </div>
      )}
    </>
  );
}
