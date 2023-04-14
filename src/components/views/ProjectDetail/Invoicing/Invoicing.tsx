import { Box, Flex, FormLabel, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { FilePdf } from 'phosphor-react';
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
  updateInvoiceProduct,
  updateProjectInvoiceDetail,
} from '../../../../services/ProjectInvoiceService';
import {
  IInvoiceProduct,
  IProjectInvoiceDetail,
} from '../../../../types/projectInvoiceDetail';
import { IActivity } from '../../../../types/activity';
import { useAppSelector } from '../../../../redux/hooks';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';
import { formatDate } from '../../../../utils/dates';
import { IOrderProduct, IProjectOrder } from '../../../../types/projectOrder';
import InvoiceTableView from '../../../layout/InvoiceTableView';
import { TTableHeader } from '../../../layout/InvoiceTableView/InvoiceTableView';
import FileUploader, {
  EFileTypes,
} from '../../../common/FileUploader/FileUploader';

import styles from './Invoicing.module.css';
interface IInvoicing {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  order: 0,
  activity: '',
  invoice: '',
  date: new Date(),
  products: [],
  option: { value: '', label: '' },
  pdfURL: '',
  pdfFile: undefined,
  updatedAt: new Date(),
};

const initialSelectedOrderData = {
  id: '',
  order: 1,
  proforma: '',
  date: new Date(),
  deliverDate: new Date(),
  activity: '',
  sentStatus: false,
  cost: 0,
  products: [],
  option: { value: '', label: '' },
  updatedAt: new Date(),
};

const initialSelectedProductData = {
  id: '',
  quantity: 1,
  description: { value: '', label: '' },
  tax: 0,
  cost: 0,
};

interface IInvoiceOrderDetail extends IProjectOrder {
  option: { value: string; label: string };
}

interface IInvoice extends IProjectInvoiceDetail {
  option: { value: string; label: string };
}

interface IInvProd extends Omit<IInvoiceProduct, 'description'> {
  description: { value: string; label: string };
}

const Invoicing: React.FC<IInvoicing> = props => {
  const [selectedItem, setSelectedItem] = useState<IInvoice>(
    initialSelectedItemData,
  );
  const [selectedOrder, setSelectedOrder] = useState<IInvoiceOrderDetail>(
    initialSelectedOrderData,
  );
  const [selectedProduct, setSelectedProduct] = useState<IInvProd>(
    initialSelectedProductData,
  );
  const [isProductAlertDialogOpen, setIsProductAlertDialogOpen] =
    useState(false);

  const [allActivities, setAllActivities] = useState<IActivity[]>([]);

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectInvoices = useAppSelector(
    state => state.projectInvoices.projectInvoices,
  );
  const orders = useAppSelector(state => state.projectOrders.projectOrders);
  const budgetActivities = useAppSelector(
    state => state.budgetActivities.budgetActivities,
  );
  const extraActivities = useAppSelector(
    state => state.extraActivities.extraActivities,
  );

  const tableHeader: TTableHeader[] = [
    { name: 'invoice', value: appStrings.invoice },
    { name: 'order', value: appStrings.order },
    { name: 'date', value: appStrings.date },
    { name: 'activity', value: appStrings.activity },
    { name: 'description', value: appStrings.description },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'imp', value: appStrings.imp, isGreen: true },
    { name: 'total', value: appStrings.total, isGreen: true },
  ];

  const formatTableData = () =>
    projectInvoices.map(data => ({
      ...data,
      date: formatDate(new Date(data.date), 'MM/DD/YYYY'),
    }));

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const getActivityById = (id?: string): IActivity =>
    allActivities.find(e => e.id === id)!;

  const editButton = async (projectInvoiceDetailId: string) => {
    const invoice = projectInvoices.find(e => e.id === projectInvoiceDetailId);
    const order = orders.find(e => e.order === invoice?.order);
    if (order) {
      const { id, ...rest } = order;
      const option = { value: id, label: String(order.order) };
      setSelectedOrder({
        ...selectedOrder,
        ...rest,
        id,
        option,
      });
      setSelectedItem({
        ...invoice!,
        date: new Date(invoice!.date),
        option,
      });
    }

    setIsModalOpen(true);
  };

  const deleteButton = async () => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
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
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setIsModalOpen(false);
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
    const item = projectInvoices.find(m => m.id === invoiceId) as IInvoice;
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const editProduct = async (orderId: string, productId: string) => {
    const product = projectInvoices
      .find(m => m?.id === orderId)
      ?.products?.find(s => s.id === productId);
    if (product) {
      const item = projectInvoices.find(m => m.id === orderId) as IInvoice;
      setSelectedItem(item);
      setSelectedProduct({
        ...product,
        description: { value: product.id, label: product.description },
      });
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

  const onSubmitProduct = async (data: IInvProd) => {
    const product = {
      ...data,
      description: data.description.label,
      quantity: +data.quantity,
      cost: +data.cost,
      tax: +data.tax,
    };
    const successAddCallback = () => {
      setSelectedProduct(initialSelectedProductData);
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setIsDetailModalOpen(false);
    };

    const successUpdateCallback = () => {
      setSelectedProduct(initialSelectedProductData);
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
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
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
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
    description: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    quantity: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
    tax: yup.number().min(0).max(100).required(appStrings.required),
  });

  const handleSearchSelect = (v: any) => {
    const order = orders.find(e => e.id === v);
    if (order) {
      const { id, ...rest } = order;
      const option = { value: order.id, label: String(order.order) };
      const orderActivity = getActivityById(rest.activity);
      setSelectedOrder({
        ...selectedOrder,
        ...rest,
        option,
      });
      setSelectedItem({
        ...selectedItem,
        option,
        activity: orderActivity.activity,
      });
    }
  };

  const handleSearchProduct = (v: any) => {
    const products: IOrderProduct[] = [];
    orders.forEach(e => {
      products.push(...e.products);
    });
    const product = products.find(e => e.id === v);
    if (product) {
      const { id, ...rest } = product;
      const description = {
        value: product.id,
        label: String(product.description),
      };
      setSelectedProduct({
        ...selectedProduct,
        ...rest,
        description,
      });
    }
  };

  const getOrdersProducts = (invoice: IInvoice) => {
    const products: IOrderProduct[] = [];
    orders
      .filter(e => e.order === invoice.order)
      .forEach(e => {
        products.push(...e.products);
      });
    const filterIsUsed = (e: IOrderProduct) => {
      const isUsed = invoice.products?.some(p => {
        return p.description === e.description;
      });
      return !isUsed;
    };
    return products
      .filter(filterIsUsed)
      .map(e => ({ value: e.id, label: e.description }));
  };

  const ProductSearchSelect = () => {
    const options = getOrdersProducts(selectedItem);
    const hasNoProducts = !options?.length;
    return (
      <SearchSelect
        name="description"
        label={appStrings.product}
        placeholder={appStrings.product}
        helperText={
          hasNoProducts && !selectedProduct.id ? appStrings.noProducts : ''
        }
        isDisabled={!!selectedProduct.id || hasNoProducts}
        options={options}
        value={selectedProduct.description}
        onChange={item => {
          handleSearchProduct(item?.value?.value);
        }}
      />
    );
  };

  useEffect(() => {
    const extrasAct = extraActivities.map(activity => ({
      ...activity,
      isExtra: true,
    }));
    setAllActivities([...budgetActivities, ...extrasAct]);
  }, [budgetActivities, extraActivities]);

  return (
    <div className={`${styles.operations_container}`}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
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
                {selectedItem.id
                  ? appStrings.editInvoice
                  : appStrings.addInvoice}
              </Heading>
              <Form
                id="invoice-form"
                initialFormData={selectedItem}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={handleOnSubmit}
              >
                <SearchSelect
                  name="option"
                  label={appStrings.order}
                  placeholder={appStrings.selectOrder}
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
                <Input
                  name="invoice"
                  type="number"
                  label={appStrings.invoice}
                  placeholder={appStrings.invoiceNumber}
                />
                <Input name="activity" label={appStrings.activity} isDisabled />
                <DatePicker name="date" label={appStrings.date}></DatePicker>
                <div className={styles.fileUpload_container}>
                  <FileUploader
                    name="pdfFile"
                    label={appStrings.uploadPDF}
                    buttonLabel={appStrings.selectFile}
                    acceptedFiles={[EFileTypes.pdf]}
                  ></FileUploader>
                  {selectedItem.pdfURL && (
                    <div style={{ width: '40%' }}>
                      <FormLabel>{appStrings.CurrentPDF}</FormLabel>
                      <Button
                        onClick={() => {
                          window.open(selectedItem.pdfURL);
                        }}
                        style={{ height: '40px', width: '100%' }}
                        rightIcon={<FilePdf size={24} />}
                      >
                        {appStrings.open}
                      </Button>
                    </div>
                  )}
                </div>

                <br />
                <Button width="full" type="submit">
                  {appStrings.submit}
                </Button>
              </Form>
            </Modal>
            <Modal
              isOpen={isDetailModalOpen}
              onClose={() => {
                setSelectedItem(initialSelectedItemData);
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
                id="product-form"
                initialFormData={selectedProduct}
                validationSchema={productValSchema}
                validateOnChange
                validateOnBlur
                onSubmit={onSubmitProduct}
              >
                <ProductSearchSelect />
                <Input
                  name="quantity"
                  type="number"
                  label={appStrings.quantity}
                />
                <Input name="cost" type="number" label={appStrings.cost} />
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
            setSelectedOrder(initialSelectedOrderData);
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
          formatCurrency
        />
        {!projectInvoices.length ? <h1>{appStrings.noRecords}</h1> : null}
      </Box>
    </div>
  );
};

export default Invoicing;
