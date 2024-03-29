import { Box, Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchFilter, {
  FilterOption,
  handleFilterSearch,
  Search,
} from '../../../common/SearchFilter/SearchFilter';
import Form, {
  AutoComplete,
  DatePicker,
  Input,
  Select,
} from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  addOrderProduct,
  createProjectOrder,
  deleteOrderProduct,
  deleteProjectOrder,
  getProjectOrderById,
  updateOrderProduct,
  updateProjectOrder,
} from '../../../../services/ProjectOrderService';
import { IOrderProduct, IProjectOrder } from '../../../../types/projectOrder';
import { IActivity } from '../../../../types/activity';
import { useAppSelector } from '../../../../redux/hooks';
import OrdersTableView, {
  TTableHeader,
} from '../../../layout/OrdersTableView/OrdersTableView';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';
import { formatDate } from '../../../../utils/dates';
import { debounceLoader } from '../../../../utils/common';
import TabGroup from '../../../common/TabGroup/TabGroup';
import { getDollarExchange } from '../../../../providers/CurrencyProvicer';

import styles from './Orders.module.css';

interface IOrdersView {
  projectId: string;
}

interface IOrder extends Omit<IProjectOrder, 'activity'> {
  activity: { value: string; label: string };
}

const initialSelectedOrderData = {
  id: '',
  order: 1,
  proforma: '',
  activity: { value: '', label: '' },
  supplier: '',
  date: new Date(),
  deliverDate: new Date(),
  sentStatus: false,
  cost: 0,
  exchange: 0,
  products: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialSelectedProductData = {
  id: '',
  quantity: 1,
  description: '',
  cost: 0,
  tax: 0,
  materialRef: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const initialMaterialRefData = {
  materialId: '',
  subMaterialId: '',
  isExtraMaterial: false,
  isSubMaterial: false,
};

const initialSearchData = {
  selectedOption: { label: 'order', value: '' },
  searchTerm: '',
  firstDate: new Date(),
  secondDate: new Date(),
};

const Orders: React.FC<IOrdersView> = props => {
  const { projectId } = props;
  const [selectedOrder, setSelectedOrder] = useState<IOrder>(
    initialSelectedOrderData,
  );
  const [selectedProduct, setSelectedProduct] = useState<IOrderProduct>(
    initialSelectedProductData,
  );
  const [exchange, setExchange] = useState(0);
  const selectedTab = useParams().tab as string;
  const [allActivities, setAllActivities] = useState<IActivity[]>([]);
  const [materialRef, setMaterialRef] = useState(initialMaterialRefData);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isProductAlertDialogOpen, setIsProductAlertDialogOpen] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [search, setSearch] = useState<Search>(initialSearchData);
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectOrders = useAppSelector(
    state => state.projectOrders.projectOrders,
  );
  const budgetActivities = useAppSelector(
    state => state.budgetActivities.budgetActivities,
  );
  const extraActivities = useAppSelector(
    state => state.extraActivities.extraActivities,
  );
  const navigate = useNavigate();

  const tableHeader: TTableHeader[] = [
    { name: 'order', value: appStrings.order },
    { name: 'proforma', value: appStrings.proforma },
    { name: 'date', value: 'Creation Date' },
    { name: 'deliverDate', value: 'Deliver Date' },
    { name: 'activity', value: appStrings.activity },
    { name: 'supplier', value: appStrings.supplier },
    { name: 'description', value: appStrings.description },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost },
    {
      name: 'subtotal',
      value: appStrings.subtotal,
      isGreen: true,
      showTotal: true,
    },
    { name: 'imp', value: appStrings.imp, isGreen: true, showTotal: true },
    { name: 'total', value: appStrings.total, isGreen: true, showTotal: true },
    {
      name: 'dollarCost',
      value: appStrings.dollars,
      isGreen: true,
      showTotal: true,
    },
  ];

  const filterOptions: FilterOption[] = [
    { name: 'order', value: '', hasSuggestions: false },
    { name: 'proforma', value: '', hasSuggestions: false },
    { name: 'date', value: new Date(), hasSuggestions: true },
    { name: 'deliverDate', value: new Date(), hasSuggestions: true },
    { name: 'activity', value: '', hasSuggestions: true },
    { name: 'supplier', value: '', hasSuggestions: true },
  ];

  const orderStatus: Array<{ id: string; name: string }> = [
    { id: 'pending', name: appStrings?.pending },
    { id: 'sent', name: appStrings?.sent },
  ];

  const formatTableData = () => {
    const showOnlySent = selectedTab === 'sent';
    return projectOrders
      .filter(e => (showOnlySent ? e.sentStatus : !e.sentStatus))
      .map(data => {
        const a = getActivityById(data.activity);
        return {
          ...data,
          date: formatDate(new Date(data.date), 'MM/DD/YYYY'),
          deliverDate: formatDate(new Date(data.deliverDate), 'MM/DD/YYYY'),
          activity: a?.isExtra
            ? `${a?.activity} (${appStrings.extra})`
            : a?.activity,
        };
      });
  };

  const getSuggestions = () => {
    let products: any[] = [];
    projectOrders.forEach(d => {
      const p = d.products?.map(p => ({ value: p.description }));
      products = [...products, ...p];
    });
    return products;
  };

  const getActivityById = (id?: string): IActivity =>
    allActivities.find(e => e.id === id)!;

  const getFormattedActivity = (id?: string) => {
    const activity = getActivityById(id);
    return { value: activity?.id, label: activity?.activity };
  };

  const handleOnChangeActivity = (e: any) => {
    setSelectedOrder({ ...selectedOrder, activity: e.value });
  };

  const editButton = async (projectOrderId: string) => {
    const successCallback = (response: IProjectOrder) => {
      const parsedOrder = {
        ...response,
        activity: getFormattedActivity(response?.activity),
        sentStatus: response?.sentStatus ? 'sent' : 'pending',
      };
      setSelectedOrder(parsedOrder);
      setIsModalOpen(true);
    };
    await getProjectOrderById({
      projectId,
      projectOrderId,
      appStrings,
      successCallback,
    });
  };

  const exportPDFButton = (id: string) => {
    const order = projectOrders.find(e => e.id === id);
    const activity = getActivityById(order?.activity);
    order &&
      navigate(
        `/project-detail/${projectId}/order-pdf-preview/${order.id}/${
          activity.activity
        }${activity.isExtra ? ' (Extra)' : ''}`,
      );
  };

  const dollarExchange = () => {
    const successCallback = (data: any) => setExchange(data);
    getDollarExchange({ appStrings, successCallback });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      setSelectedOrder(initialSelectedOrderData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectOrder({
      projectId,
      projectOrderId: selectedOrder.id,
      appStrings,
      successCallback,
    });
  };

  const addProduct = async (productId: string) => {
    const order = projectOrders.find(m => m.id === productId)!;
    const parsedOrder = {
      ...order,
      date: new Date(order?.date),
      deliverDate: new Date(order?.deliverDate),
      activity: getFormattedActivity(order?.activity),
    };
    setSelectedOrder(parsedOrder);
    setIsProductModalOpen(true);
  };

  const editProduct = async (orderId: string, productId: string) => {
    const product = projectOrders
      .find(m => m?.id === orderId)
      ?.products?.find(s => s.id === productId);
    if (product) {
      const order = projectOrders.find(m => m.id === orderId)!;
      const parsedOrder = {
        ...order,
        date: new Date(order?.date),
        deliverDate: new Date(order?.deliverDate),
        activity: getFormattedActivity(order?.activity),
      };
      setSelectedOrder(parsedOrder);
      setSelectedProduct(product);
      setIsProductModalOpen(true);
    }
  };

  const delProduct = async (orderId: string, productId: string) => {
    setSelectedOrder({ ...selectedOrder, id: orderId });
    setSelectedProduct({
      ...selectedProduct,
      id: productId,
    });
    setIsProductAlertDialogOpen(true);
  };

  const deleteProduct = async () => {
    const successCallback = () => {
      setSelectedOrder(initialSelectedOrderData);
      setSelectedProduct(initialSelectedProductData);
      setIsProductAlertDialogOpen(false);
    };
    await deleteOrderProduct({
      projectId,
      projectOrderId: selectedOrder.id,
      orderProductId: selectedProduct.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectOrder: IOrder) => {
    const { activity, sentStatus, ...rest } = projectOrder;
    const isSent = sentStatus === 'sent';
    const successCallback = () => {
      setSelectedOrder(initialSelectedOrderData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      projectOrder: {
        ...rest,
        order: +rest.order,
        exchange: +rest.exchange,
        activity: activity.value,
        sentStatus: isSent,
      },
      appStrings,
      successCallback,
    };
    projectOrder.id
      ? await updateProjectOrder(serviceCallParameters)
      : await createProjectOrder(serviceCallParameters);
  };

  const onSubmitProduct = async (data: IOrderProduct) => {
    const { description, ...rest } = data;
    const product = {
      ...rest,
      description,
      quantity: +rest.quantity,
      cost: +rest.cost,
      tax: +rest.tax,
    };
    const successAddCallback = () => {
      setSelectedProduct(initialSelectedProductData);
      setMaterialRef(initialMaterialRefData);
      setIsProductModalOpen(false);
    };

    const successUpdateCallback = () => {
      setSelectedProduct(initialSelectedProductData);
      setMaterialRef(initialMaterialRefData);
      setIsProductModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      orderId: selectedOrder?.id,
      product: { ...product, cost: +product.cost, quantity: +product.quantity },
      materialRef,
      appStrings,
      successCallback: !product.id ? successAddCallback : successUpdateCallback,
    };
    !product.id
      ? await addOrderProduct(serviceCallParameters)
      : await updateOrderProduct(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    order: yup
      .number()
      .positive()
      .required(appStrings?.requiredField)
      .test(
        'order',
        appStrings?.valueAlreadyExists,
        val => !!selectedOrder.id || !projectOrders.find(a => a.order === val),
      ),
    proforma: yup
      .string()
      .required(appStrings?.requiredField)
      .test(
        'proforma',
        appStrings?.valueAlreadyExists,
        val =>
          !!selectedOrder.id || !projectOrders.find(a => a.proforma === val),
      ),
    activity: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    supplier: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
    deliverDate: yup.date().required(appStrings?.requiredField),
    exchange: yup.number().min(0).required(appStrings?.requiredField),
  });

  const productValSchema = yup.object().shape({
    description: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().min(0).required(appStrings?.requiredField),
    cost: yup.number().min(0).required(appStrings?.requiredField),
    tax: yup.number().min(0).max(100).required(appStrings.required),
  });

  const formatActOptions = () =>
    allActivities.map(e => ({
      label: !e.isExtra ? e.activity : `${e.activity} (${appStrings.extra})`,
      value: e.id,
    }));

  useEffect(() => dollarExchange(), []);

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
        <div className={styles.tabsContainer}>
          <TabGroup
            className={styles.tabs}
            tabs={[
              {
                id: 'pending',
                name: appStrings.pending,
                selected: selectedTab === 'pending',
              },
              {
                id: 'sent',
                name: appStrings.sent,
                selected: selectedTab === 'sent',
              },
            ]}
            variant="rounded"
            onSelectedTabChange={activeTabs =>
              activeTabs[0] !== selectedTab &&
              navigate(`/project-detail/${projectId}/orders/${activeTabs[0]}`)
            }
          />
        </div>
        <Flex marginBottom="5px" className={styles.p_10}>
          <SearchFilter
            search={search}
            setSearch={setSearch}
            data={formatTableData()}
            options={filterOptions}
          />
          <div style={{ textAlign: 'end' }}>
            <Button
              onClick={() => {
                projectOrders.length
                  ? setSelectedOrder({
                      ...initialSelectedOrderData,
                      order: projectOrders[0].order + 1,
                      exchange: exchange,
                    })
                  : setSelectedOrder(initialSelectedOrderData);
                setIsModalOpen(true);
              }}
            >
              +
            </Button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setSelectedOrder(initialSelectedOrderData);
                setIsModalOpen(false);
              }}
            >
              <Heading as="h2" size="lg">
                {selectedOrder.id ? appStrings.editOrder : appStrings.addOrder}
              </Heading>
              <Form
                id="order-form"
                initialFormData={selectedOrder}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onFormDataChange={data =>
                  debounceLoader(() =>
                    setSelectedOrder({ ...selectedOrder, ...data }),
                  )
                }
                onSubmit={handleOnSubmit}
              >
                <Input name="order" type="number" label={appStrings.order} />
                <SearchSelect
                  name="activity"
                  label={appStrings.activity}
                  placeholder={appStrings.activity}
                  isDisabled={!!selectedOrder.id}
                  options={formatActOptions()}
                  value={selectedOrder.activity}
                  onChange={item => handleOnChangeActivity(item)}
                />
                <Input
                  name="supplier"
                  label={appStrings.supplier}
                  placeholder={appStrings.productSupplier}
                />
                <Input
                  name="proforma"
                  type="number"
                  label={appStrings.proforma}
                  placeholder={appStrings.proformaNumber}
                />
                <Input
                  name="exchange"
                  type="number"
                  label={appStrings.currencyExchange}
                  placeholder={appStrings.dollarExchange}
                  helperText={appStrings.currencyUpToDate}
                />
                <DatePicker name="date" label={appStrings.creationDate} />
                <DatePicker name="deliverDate" label={appStrings.deliverDate} />
                <Select
                  name="sentStatus"
                  options={orderStatus}
                  label={appStrings.status}
                />
                <br />
                <Button width="full" type="submit">
                  {appStrings.submit}
                </Button>
              </Form>
            </Modal>
            <Modal
              isOpen={isProductModalOpen}
              onClose={() => {
                setSelectedOrder(initialSelectedOrderData);
                setSelectedProduct(initialSelectedProductData);
                setIsProductModalOpen(false);
              }}
            >
              <Heading as="h2" size="lg">
                {selectedProduct.id
                  ? appStrings.editProduct
                  : appStrings.addProduct}
              </Heading>
              <Form
                id="product-form"
                initialFormData={selectedProduct}
                validationSchema={productValSchema}
                validateOnChange
                validateOnBlur
                onFormDataChange={data =>
                  debounceLoader(() =>
                    setSelectedProduct({ ...selectedProduct, ...data }),
                  )
                }
                onSubmit={onSubmitProduct}
              >
                <AutoComplete
                  name="description"
                  label={appStrings.material}
                  suggestions={getSuggestions()}
                  placeholder={appStrings.materialName}
                />
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
          title={appStrings.deleteOrder}
          content={appStrings.deleteWarning}
          isOpen={isAlertDialogOpen}
          onClose={() => {
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
            setMaterialRef(initialMaterialRefData);
            setIsProductAlertDialogOpen(false);
          }}
          onSubmit={() => deleteProduct()}
        />

        <OrdersTableView
          headers={tableHeader}
          items={formatTableData()}
          filter={value => handleFilterSearch(value, search)}
          handleRowClick={() => {}}
          onClickEdit={id => editButton(id)}
          onClickDelete={id => {
            setSelectedOrder({ ...selectedOrder, id });
            setIsAlertDialogOpen(true);
          }}
          onClickExportPDF={id => exportPDFButton(id)}
          onClickAddProduct={id => addProduct(id)}
          onClickEditProduct={(orderId, productId) =>
            editProduct(orderId, productId)
          }
          onClickDeleteProduct={(orderId, productId) =>
            delProduct(orderId, productId)
          }
          formatCurrency
          usePagination={!search.searchTerm?.length}
          showTotals
        />
        {!projectOrders.length ? <h1>{appStrings.noRecords}</h1> : null}
      </Box>
    </div>
  );
};

export default Orders;
