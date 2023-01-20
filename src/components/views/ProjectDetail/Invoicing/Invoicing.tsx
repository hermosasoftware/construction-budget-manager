import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  createProjectInvoice,
  deleteProjectInvoice,
  getProjectInvoiceDetailById,
  getProjectInvoicing,
  updateProjectInvoice,
} from '../../../../services/ProjectInvoiceService';
import { IProjectInvoiceDetail } from '../../../../types/projectInvoiceDetail';
import { useAppSelector } from '../../../../redux/hooks';
import { colonFormat } from '../../../../utils/numbers';
import { formatDate } from '../../../../utils/dates';
import { Pencil, Trash } from 'phosphor-react';
import InvoicingDetail from './InvoicingDetail';
import { IProjectOrder } from '../../../../types/projectOrder';
import { getProjectOrders } from '../../../../services/ProjectOrderService';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';
import styles from './Invoicing.module.css';
interface IInvoicing {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  order: 0,
  cost: 0,
  invoice: '',
  completed: false,
  date: new Date(),
  option: { value: '', label: '' },
};
const initialSelectedOrderData = {
  id: '',
  order: 1,
  proforma: '',
  date: new Date(),
  cost: 0,
  products: [],
  option: { value: '', label: '' },
};

interface IInvoiceOrderDetail extends IProjectOrder {
  option: { value: string; label: string };
}

interface IInvoice extends IProjectInvoiceDetail {
  option: { value: string; label: string };
}

const Invoicing: React.FC<IInvoicing> = props => {
  const [tableData, setTableData] = useState<IInvoice[]>([]);
  const [selectedItem, setSelectedItem] = useState<IInvoice>(
    initialSelectedItemData,
  );
  const [selectedOrder, setSelectedOrder] = useState<IInvoiceOrderDetail>(
    initialSelectedOrderData,
  );
  const [orders, setOrders] = useState<IProjectOrder[]>([]);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'invoice', value: appStrings.invoice },
    { name: 'order', value: appStrings.order },
    { name: 'completed', value: 'Status', isGreen: true },
    { name: 'date', value: appStrings.date },
  ];

  const getOrders = async () => {
    const successCallback = (response: IProjectOrder[]) => {
      setOrders(response);
    };
    await getProjectOrders({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: formatDate(data.date, 'MM/DD/YYYY'),
      cost: colonFormat(data.cost),
      completed: data.completed ? appStrings.completed : appStrings.incomplete,
    }));

  const getInvoicing = async () => {
    const successCallback = (response: IInvoice[]) => setTableData(response);
    await getProjectInvoicing({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const removeItem = (id: string) => {
    const index = tableData.findIndex(e => e.id === id);
    const data = [...tableData];
    data.splice(index, 1);
    setTableData(data);
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectInvoice({
      projectId,
      projectInvoiceDetailId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectInvoice: IInvoice) => {
    const products = orders.find(
      e => e.id === projectInvoice?.option.value,
    )?.products;
    const successCallback = (item: IProjectInvoiceDetail) => {
      setSelectedItem(initialSelectedItemData);
    };
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...projectInvoice,
        order: +projectInvoice?.option.label,
        products,
      },
      appStrings,
      successCallback,
    };
    projectInvoice.id
      ? await updateProjectInvoice(serviceCallParameters)
      : await createProjectInvoice(serviceCallParameters);
  };

  const handleSearchSelect = (v: any) => {
    const order = orders.find(e => e.id === v);
    if (order) {
      const { id, ...rest } = order;
      const option = { value: order.id, label: String(order.order) };
      setSelectedOrder({
        ...selectedOrder,
        ...rest,
        option,
      });
      setSelectedItem({ ...selectedItem, option });
    }
  };

  const updateStatus = async (invoiceDetails: any[], invoiceId: string) => {
    const isComplete = invoiceDetails.every(
      (e: any) => e.quantity === e.delivered,
    );
    const successCallback = (item: IProjectInvoiceDetail) => {
      setSelectedItem(initialSelectedItemData);
      setTableData(
        tableData.map((e: any) => {
          return e.id === invoiceId ? { ...e, completed: isComplete } : e;
        }),
      );
    };
    const projectInvoice = tableData.find((e: IInvoice) => e.id === invoiceId)!;
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...projectInvoice,
        completed: isComplete,
      },
      appStrings,
      successCallback,
    };

    await updateProjectInvoice(serviceCallParameters);
  };

  const customOptions = [
    {
      action: (id: string) => {
        setSelectedItem(tableData.find(e => e.id === id)!);
        setIsInvoiceModalOpen(true);
      },
      name: 'View',
      icon: <Pencil />,
    },
    {
      action: (id: string) => {
        setSelectedItem({ ...selectedItem, id: id });
        setIsAlertDialogOpen(true);
      },
      name: 'Delete',
      icon: <Trash />,
    },
  ];

  const validationSchema = yup.object().shape({
    option: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    invoice: yup.string().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getInvoicing();
    getOrders();
    return () => abortController.abort();
  }, []);

  return (
    <div className={`${styles.operations_container}`}>
      <Flex marginBottom="5px">
        <SearchInput
          style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
          placeholder="Search"
          onChange={handleSearch}
        ></SearchInput>
        <div style={{ textAlign: 'end' }}>
          <Button onClick={() => setIsModalOpen(true)}>+</Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setSelectedOrder(initialSelectedOrderData);
              setIsModalOpen(false);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedItem.id ? appStrings.editInvoice : appStrings.addInvoice}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <SearchSelect
                name="option"
                label={appStrings.order}
                placeholder={appStrings.orderId}
                isDisabled={!!selectedOrder.id}
                options={orders.map(o => ({
                  value: o.id,
                  label: String(o.order),
                }))}
                value={selectedOrder.option}
                onChange={item => {
                  handleSearchSelect(item?.value?.value);
                }}
              />
              <Input name="invoice" type="number" label={appStrings.invoice} />
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
        </div>
      </Flex>
      <AlertDialog
        title={appStrings.deleteInvoice}
        content={appStrings.deleteWarning}
        isOpen={isAlertDialogOpen}
        onClose={() => {
          setSelectedItem(initialSelectedItemData);
          setIsAlertDialogOpen(false);
        }}
        onSubmit={() => deleteButton()}
      />
      <InvoicingDetail
        isOpen={isInvoiceModalOpen}
        item={selectedItem}
        onClose={() => setIsInvoiceModalOpen(false)}
        updateStatus={updateStatus}
        projectId={projectId}
      />
      <TableView
        headers={tableHeader}
        items={formatTableData()}
        filter={value =>
          searchTerm === '' || value.invoice.toUpperCase().includes(searchTerm)
        }
        customOptions={customOptions}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default Invoicing;
