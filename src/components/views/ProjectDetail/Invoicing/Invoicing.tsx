import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  addInvoiceProduct,
  createProjectInvoiceDetail,
  deleteInvoiceProduct,
  deleteProjectInvoiceDetail,
  getProjectInvoicing,
  updateInvoiceProduct,
  updateProjectInvoiceDetail,
} from '../../../../services/ProjectInvoiceService';
import {
  IInvoiceProduct,
  IProjectInvoiceDetail,
} from '../../../../types/projectInvoiceDetail';
import { useAppSelector } from '../../../../redux/hooks';
import styles from './Invoicing.module.css';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';
import { formatDate } from '../../../../utils/dates';
import { IProjectOrder } from '../../../../types/projectOrder';
import { getProjectOrders } from '../../../../services/ProjectOrderService';
import InvoiceTableView from '../../../layout/InvoiceTableView';
import { TTableHeader } from '../../../layout/InvoiceTableView/InvoiceTableView';
interface IInvoicing {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  order: 0,
  activity: '',
  invoice: '',
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

const initialSelectedProductData = {
  id: '',
  quantity: 1,
  description: '',
  tax: 0,
  cost: 0,
};

interface IInvoiceOrderDetail extends IProjectOrder {
  option: { value: string; label: string };
}

interface IInvoice extends IProjectInvoiceDetail {
  products?: any[];
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
  const [selectedProduct, setSelectedProduct] = useState<IInvoiceProduct>(
    initialSelectedProductData,
  );
  const [isProductAlertDialogOpen, setIsProductAlertDialogOpen] =
    useState(false);
  const [orders, setOrders] = useState<IProjectOrder[]>([]);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'invoice', value: appStrings.invoice },
    { name: 'order', value: appStrings.order },
    { name: 'date', value: appStrings.date },
    { name: 'activity', value: appStrings.activity },
    { name: 'description', value: appStrings.description },
    { name: 'quantity', value: appStrings.quantity, isGreen: true },
    { name: 'cost', value: appStrings.cost },
    { name: 'subtotal', value: appStrings.subtotal },
    { name: 'imp', value: appStrings.imp },
    { name: 'total', value: appStrings.total },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: formatDate(data.date, 'MM/DD/YYYY'),
    }));

  const getInvoicing = async () => {
    const successCallback = (response: IInvoice[]) => setTableData(response);
    await getProjectInvoicing({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IInvoice) => setTableData([item, ...tableData]);

  const updateItem = (item: IInvoice) => {
    const index = tableData.findIndex(e => e.id === item.id);
    const data = [...tableData];
    data.splice(index, 1, item);
    setTableData(data);
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

  const editButton = async (projectInvoiceDetailId: string) => {
    const invoice = tableData.find(e => e.id === projectInvoiceDetailId);
    const order = orders.find(e => e.order === invoice?.order);
    if (order) {
      const { id, ...rest } = order;
      const option = { value: order.id, label: String(order.order) };
      setSelectedOrder({
        ...selectedOrder,
        ...rest,
        option,
      });
      setSelectedItem({ ...invoice!, option });
    }

    setIsModalOpen(true);
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectInvoiceDetail({
      projectId,
      projectInvoiceDetailId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectInvoiceDetail: IInvoice) => {
    const successCallback = (item: IInvoice) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      projectInvoiceDetail.id ? updateItem(item) : addItem(item);
    };
    const { option, ...rest } = projectInvoiceDetail;
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...rest,
        order: +option.label,
      },
      appStrings,
      successCallback,
    };
    projectInvoiceDetail.id
      ? await updateProjectInvoiceDetail(serviceCallParameters)
      : await createProjectInvoiceDetail(serviceCallParameters);
  };

  const addProduct = async (invoiceId: string) => {
    setSelectedItem(tableData.find(m => m.id === invoiceId)!);
    setIsDetailModalOpen(true);
  };

  const editProduct = async (orderId: string, productId: string) => {
    const product = tableData
      .find(m => m?.id === orderId)
      ?.products?.find(s => s.id === productId);
    if (product) {
      const item = tableData.find(m => m.id === orderId);
      setSelectedItem(item!);
      setSelectedProduct(product);
      setIsDetailModalOpen(true);
    }
  };

  const delProduct = async (invoiceId: string, productId: string) => {
    setSelectedItem({ ...selectedItem, id: invoiceId });
    setSelectedProduct({
      ...selectedProduct,
      id: productId,
    });
    setIsProductAlertDialogOpen(true);
  };

  const onSubmitProduct = async (data: IInvoiceProduct) => {
    const product = {
      ...data,
      quantity: +data.quantity,
      cost: +data.cost,
    };
    const successAddCallback = (invoiceId: string, item: IInvoiceProduct) => {
      setTableData(
        tableData.map(m =>
          m?.id === invoiceId
            ? {
                ...m,
                products: m.products ? [...m.products, item] : [item],
              }
            : m,
        ),
      );
      setSelectedProduct(initialSelectedProductData);
      setSelectedItem(initialSelectedItemData);
      setIsDetailModalOpen(false);
    };

    const successUpdateCallback = (orderId: string, item: IInvoiceProduct) => {
      setTableData(
        tableData.map(m =>
          m?.id === orderId
            ? {
                ...m,
                products: m?.products?.map(s => (s.id === item.id ? item : s)),
              }
            : m,
        ),
      );
      setSelectedProduct(initialSelectedProductData);
      setIsDetailModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      invoiceId: selectedItem?.id,
      product,
      appStrings,
      successCallback: !product.id ? successAddCallback : successUpdateCallback,
    };
    !product.id
      ? await addInvoiceProduct(serviceCallParameters)
      : await updateInvoiceProduct(serviceCallParameters);
  };

  const deleteProduct = async () => {
    const successCallback = () => {
      setTableData(
        tableData.map(e =>
          e.id === selectedItem.id
            ? {
                ...e,
                products: e.products?.filter(s => s.id !== selectedProduct.id),
              }
            : e,
        ),
      );
      setSelectedItem(initialSelectedItemData);
      setSelectedProduct(initialSelectedProductData);
      setIsProductAlertDialogOpen(false);
    };
    await deleteInvoiceProduct({
      projectId,
      projectInvoiceId: selectedItem.id,
      invoiceProductId: selectedProduct.id,
      appStrings,
      successCallback,
    });
  };

  const validationSchema = yup.object().shape({
    option: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    invoice: yup.string().required(appStrings?.requiredField),
    activity: yup.string().required(appStrings?.requiredField),
  });
  const productValSchema = yup.object().shape({
    description: yup.string().required(appStrings?.requiredField),
    quantity: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
    tax: yup
      .number()
      .transform(value => (Number.isNaN(value) ? null : value))
      .nullable(),
  });

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
              setSelectedItem(initialSelectedItemData);
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
              <Input name="activity" label={appStrings.activity} />
              <DatePicker name="date" label={appStrings.date}></DatePicker>
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setSelectedOrder(initialSelectedOrderData);
              setSelectedProduct(initialSelectedProductData);
              setIsDetailModalOpen(false);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedProduct.id
                ? appStrings.editInvoiceDetail
                : appStrings.addInvoiceDetail}
            </Heading>
            <Form
              id="invoice-form"
              initialFormData={selectedProduct}
              validationSchema={productValSchema}
              validateOnChange
              validateOnBlur
              onSubmit={onSubmitProduct}
            >
              <Input name="description" label={appStrings.material} />
              <Input
                name="quantity"
                type="number"
                label={appStrings.quantity}
              />
              <Input name="cost" label={appStrings.cost} />
              <Input name="tax" type="number" label={appStrings.taxAmount} />
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
      <AlertDialog
        title={appStrings.deleteProduct}
        content={appStrings.deleteWarning}
        isOpen={isProductAlertDialogOpen}
        onClose={() => {
          setSelectedProduct(initialSelectedProductData);
          setIsProductAlertDialogOpen(false);
        }}
        onSubmit={() => deleteProduct()}
      />
      <InvoiceTableView
        headers={tableHeader}
        items={formatTableData()}
        filter={value =>
          searchTerm === '' ||
          value.invoice?.toString().toUpperCase().includes(searchTerm)
        }
        handleRowClick={() => {}}
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id: id });
          setIsAlertDialogOpen(true);
        }}
        onClickAddProduct={id => addProduct(id)}
        onClickEditProduct={(orderId, productId) =>
          editProduct(orderId, productId)
        }
        onClickDeleteProduct={(orderId, productId) =>
          delProduct(orderId, productId)
        }
        exchangeRate={Number('0.13')} //Modify with the exchange of the project when is done
        formatCurrency
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default Invoicing;
