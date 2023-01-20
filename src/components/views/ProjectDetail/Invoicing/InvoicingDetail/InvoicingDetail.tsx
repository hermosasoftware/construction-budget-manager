import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useAppSelector } from '../../../../../redux/hooks';
import TableView, {
  TTableHeader,
} from '../../../../common/TableView/TableView';
import { IProjectInvoiceDetail } from '../../../../../types/projectInvoiceDetail';
import Counter from '../../../../common/Counter';
import {
  getProjectInvoiceProductsById,
  updateProjectInvoiceProductsById,
} from '../../../../../services/ProjectInvoiceService';
import { Formik, useFormikContext } from 'formik';
import * as yup from 'yup';
import styles from './InvoicingDetail.module.css';

interface IInvoicingDetail {
  isOpen: boolean;
  item: IProjectInvoiceDetail;
  onClose: () => void;
  updateStatus: (invoiceDetail: any[], InvoiceId: string) => void;
  projectId: string;
}

const InvoicingDetail = (props: IInvoicingDetail) => {
  const { isOpen, item, onClose, projectId, updateStatus } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [tableData, setTableData] = useState<any[]>([]);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const tableHeader: TTableHeader[] = [
    { name: 'description', value: appStrings.description },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'activity', value: appStrings.activity },
    { name: 'delivered', value: appStrings.delivered },
    { name: 'incoming', value: 'Incoming' },
  ];

  const formatDataTable = (
    setFieldValue: Function,
    errors: any,
    touched: any,
  ) =>
    tableData.map((e: any) => {
      const max = e.quantity - e.delivered;
      return {
        ...e,
        incoming: (
          <Counter
            min={0}
            max={max}
            id={e.id}
            isDisabled={max === 0}
            errors={errors}
            touched={touched}
            handleOnChange={(newValue: number) => setFieldValue(e.id, newValue)}
          />
        ),
      };
    });

  const initialValues = tableData.reduce((a, b) => ({ ...a, [b.id]: 0 }), {});

  const validationSchema = yup.object().shape(
    tableData.reduce((a, b) => {
      const min = 0;
      const max = b.quantity - b.delivered;
      return max > 0
        ? {
            ...a,
            [b.id]: yup
              .number()
              .min(min)
              .max(max)
              .required(appStrings.requiredField),
          }
        : a;
    }, {}),
  );

  const fetchMaterials = () => {
    const successCallback = (data: any[]) => setTableData(data);
    const serviceCallParameters = {
      projectId,
      projectInvoiceId: item.id,
      appStrings,
      successCallback,
    };
    getProjectInvoiceProductsById(serviceCallParameters);
  };

  const handleSubmitInvoicingDetails = (values: any) => {
    let data = { ...values };
    tableData.forEach((e: any) => {
      data[e.id] = e.delivered + data[e.id];
    });
    const successCallback = (data: any[]) => {
      onClose();
      updateStatus(data, item.id);
    };
    const serviceCallParameters = {
      projectId,
      projectInvoiceId: item.id,
      deliveredMaterial: data,
      appStrings,
      successCallback,
    };
    updateProjectInvoiceProductsById(serviceCallParameters);
  };

  useEffect(() => {
    if (isOpen) fetchMaterials();
  }, [isOpen]);

  const FormObserver: React.FC = () => {
    const { isValid, setFieldValue, isSubmitting, dirty } = useFormikContext();
    useEffect(() => {
      setDisableSubmit(!isValid);
    }, [isValid]);

    useEffect(() => {
      if (!dirty) {
        tableData.forEach(e => {
          setFieldValue(e.id, 0);
        });
      }
    }, []);

    useEffect(() => {
      setDisableSubmit(isSubmitting);
    }, [isSubmitting]);

    return null;
  };

  return (
    <>
      <Modal isCentered isOpen={isOpen} size={'5xl'} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.500"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent>
          <ModalHeader>{`Order Number: ${item.order}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={values => handleSubmitInvoicingDetails(values)}
            >
              {({ handleSubmit, errors, touched, setFieldValue }) => {
                return (
                  <form id="test-id" onSubmit={handleSubmit}>
                    <FormObserver />
                    <TableView
                      headers={tableHeader}
                      items={formatDataTable(setFieldValue, errors, touched)}
                    />
                  </form>
                );
              }}
            </Formik>
          </ModalBody>
          <ModalFooter>
            <div className={styles.optionContainer}>
              {!item.completed && (
                <Button type="submit" form={'test-id'} disabled={disableSubmit}>
                  {appStrings.submit}
                </Button>
              )}

              <Button onClick={onClose}>
                {!item.completed ? appStrings.cancel : appStrings.close}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default InvoicingDetail;
