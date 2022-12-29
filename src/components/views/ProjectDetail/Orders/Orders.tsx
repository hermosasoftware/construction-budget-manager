import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  addOrderProduct,
  createProjectOrder,
  deleteOrderProduct,
  deleteProjectOrder,
  getProjectOrderById,
  getProjectOrders,
  updateOrderProduct,
  updateProjectOrder,
} from '../../../../services/ProjectOrderService';
import { IOrderProduct, IProjectOrder } from '../../../../types/projectOrder';
import { useAppSelector } from '../../../../redux/hooks';
import OrdersTableView, {
  TTableHeader,
} from '../../../layout/OrdersTableView/OrdersTableView';

import styles from './Orders.module.css';

interface IOrdersView {
  projectId: string;
}

const initialSelectedOrderData = {
  id: '',
  order: 1,
  proforma: '',
  date: new Date(),
  cost: 0,
  imp: 0,
  subtotal: 0,
  total: 0,
  products: [],
};

const initialSelectedProductData = {
  id: '',
  quantity: '1',
  description: '',
  activity: '',
  cost: 0,
  imp: 0,
  subtotal: 0,
  total: 0,
};

const Orders: React.FC<IOrdersView> = props => {
  const { projectId } = props;
  const [tableData, setTableData] = useState<IProjectOrder[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectOrder>(
    initialSelectedOrderData,
  );
  const [selectedProduct, setSelectedProduct] = useState<IOrderProduct>(
    initialSelectedProductData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isProductAlertDialogOpen, setIsProductAlertDialogOpen] =
    useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'order', value: appStrings.order },
    { name: 'proforma', value: appStrings.proforma },
    { name: 'date', value: appStrings.date },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'description', value: appStrings.description },
    { name: 'activity', value: appStrings.activity },
    { name: 'cost', value: appStrings.cost },
    { name: 'imp', value: appStrings.imp, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'total', value: appStrings.total, isGreen: true },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: data.date.toDateString(),
    }));

  const getOrders = async () => {
    const successCallback = (response: IProjectOrder[]) => {
      setTableData(response);
    };
    await getProjectOrders({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IProjectOrder) => setTableData([item, ...tableData]);

  const updateItem = (item: IProjectOrder) => {
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

  const editButton = async (projectOrderId: string) => {
    const successCallback = (response: IProjectOrder) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getProjectOrderById({
      projectId,
      projectOrderId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedOrderData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectOrder({
      projectId,
      projectOrderId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const addProduct = async (productId: string) => {
    setSelectedItem(tableData.find(m => m.id === productId)!);
    setIsProductModalOpen(true);
  };

  const editProduct = async (orderId: string, productId: string) => {
    const product = tableData
      .find(m => m?.id === orderId)
      ?.products?.find(s => s.id === productId);
    if (product) {
      const order = tableData.find(m => m.id === orderId);
      setSelectedItem(order as IProjectOrder);
      setSelectedProduct(product);
      setIsProductModalOpen(true);
    }
  };

  const delProduct = async (orderId: string, productId: string) => {
    setSelectedItem({ ...selectedItem, id: orderId });
    setSelectedProduct({
      ...selectedProduct,
      id: productId,
    });
    setIsProductAlertDialogOpen(true);
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
      setSelectedItem(initialSelectedOrderData);
      setSelectedProduct(initialSelectedProductData);
      setIsProductAlertDialogOpen(false);
    };
    await deleteOrderProduct({
      projectId,
      projectOrderId: selectedItem.id,
      orderProductId: selectedProduct.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectOrder: IProjectOrder) => {
    const successCallback = (item: IProjectOrder) => {
      setSelectedItem(initialSelectedOrderData);
      setIsModalOpen(false);
      projectOrder.id ? updateItem(item) : addItem(item);
    };
    const serviceCallParameters = {
      projectId,
      projectOrder: {
        ...projectOrder,
        order: +projectOrder.order,
        cost: +projectOrder.cost,
        subtotal: projectOrder.cost,
      },
      appStrings,
      successCallback,
    };
    projectOrder.id
      ? await updateProjectOrder(serviceCallParameters)
      : await createProjectOrder(serviceCallParameters);
  };

  const onSubmitProduct = async (data: IOrderProduct) => {
    const successAddCallback = (orderId: string, productId: string) => {
      setTableData(
        tableData.map(m =>
          m?.id === orderId
            ? {
                ...m,
                products: [...m.products, { ...data, id: productId }],
              }
            : m,
        ),
      );
      setSelectedProduct(initialSelectedProductData);
      setIsProductModalOpen(false);
    };

    const successUpdateCallback = (orderId: string, productId: string) => {
      setTableData(
        tableData.map(m =>
          m?.id === orderId
            ? {
                ...m,
                products: m?.products?.map(s =>
                  s.id === productId ? data : s,
                ),
              }
            : m,
        ),
      );
      setSelectedProduct(initialSelectedProductData);
      setIsProductModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      orderId: selectedItem?.id,
      product: data,
      appStrings,
      successCallback: !data.id ? successAddCallback : successUpdateCallback,
    };
    !data.id
      ? await addOrderProduct(serviceCallParameters)
      : await updateOrderProduct(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    order: yup.number().positive().required(appStrings?.requiredField),
    proforma: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
  });

  const productValSchema = yup.object().shape({
    description: yup.string().required(appStrings?.requiredField),
    activity: yup.string().required(appStrings?.requiredField),
    quantity: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
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
          <Button
            onClick={() => {
              setIsModalOpen(true);
              tableData.length
                ? setSelectedItem({
                    ...initialSelectedOrderData,
                    order: tableData[0].order + 1,
                  })
                : setSelectedItem(initialSelectedOrderData);
            }}
          >
            +
          </Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setSelectedItem(initialSelectedOrderData);
              setIsModalOpen(false);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedItem.id ? appStrings.editOrder : appStrings.addOrder}
            </Heading>
            <Form
              id="order-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input
                name="order"
                type="number"
                label={appStrings.order}
                isDisabled
              />
              <Input
                name="proforma"
                type="number"
                label={appStrings.proforma}
              />
              <DatePicker name="date" label={appStrings.date}></DatePicker>
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
          <Modal
            isOpen={isProductModalOpen}
            onClose={() => {
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
              onSubmit={onSubmitProduct}
            >
              <Input
                name="description"
                label={appStrings.description}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="activity"
                label={appStrings.activity}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="quantity"
                label={appStrings.quantity}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="cost"
                type={'number'}
                label={appStrings.cost}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
        </div>
      </Flex>
      <AlertDialog
        tittle={appStrings.deleteOrder}
        content={appStrings.deleteWarning}
        isOpen={isAlertDialogOpen}
        onClose={() => {
          setSelectedItem(initialSelectedOrderData);
          setIsAlertDialogOpen(false);
        }}
        onSubmit={() => deleteButton()}
      />
      <AlertDialog
        tittle={appStrings.deleteProduct}
        content={appStrings.deleteWarning}
        isOpen={isProductAlertDialogOpen}
        onClose={() => {
          setSelectedProduct(initialSelectedProductData);
          setIsProductAlertDialogOpen(false);
        }}
        onSubmit={() => deleteProduct()}
      />
      <OrdersTableView
        headers={tableHeader}
        items={formatTableData()}
        filter={value =>
          searchTerm === '' || value?.order?.toString()?.includes(searchTerm)
        }
        handleRowClick={() => {}}
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id });
          setIsAlertDialogOpen(true);
        }}
        onClickAddProduct={id => addProduct(id)}
        onClickEditProduct={(orderId, productId) =>
          editProduct(orderId, productId)
        }
        onClickDeleteProduct={(orderId, productId) => {
          delProduct(orderId, productId);
        }}
        exchangeRate={Number('0.13')}
        formatCurrency
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default Orders;
