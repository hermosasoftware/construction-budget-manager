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
import { getExtraBudgetMaterials } from '../../../../services/ExtraBudgetMaterialsService';
import { IMaterialBreakdown } from '../../../../types/collections';
import { getBudgetMaterials } from '../../../../services/BudgetMaterialsService';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';

interface IOrdersView {
  projectId: string;
}

interface IProduct extends Omit<IOrderProduct, 'description'> {
  description: { value: string; label: string };
}

const initialSelectedOrderData = {
  id: '',
  order: 1,
  proforma: '',
  date: new Date(),
  cost: 0,
  products: [],
};

const initialSelectedProductData = {
  id: '',
  quantity: 1,
  description: { value: '', label: '' },
  activity: 'Piscina', // TODO (the activity need to be auto-populate from materials)
  cost: 0,
  materialRef: '',
};

const initialMaterialRefData = {
  materialId: '',
  subMaterialId: '',
  isExtraMaterial: false,
  isSubMaterial: false,
};

const Orders: React.FC<IOrdersView> = props => {
  const { projectId } = props;
  const [tableData, setTableData] = useState<IProjectOrder[]>([]);
  const [materials, setMaterials] = useState<IMaterialBreakdown[]>([]);
  const [extraMaterials, setExtraMaterials] = useState<IMaterialBreakdown[]>(
    [],
  );
  const [selectedOrder, setSelectedOrder] = useState<IProjectOrder>(
    initialSelectedOrderData,
  );
  const [selectedProduct, setSelectedProduct] = useState<IProduct>(
    initialSelectedProductData,
  );
  const [materialRef, setMaterialRef] = useState(initialMaterialRefData);
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
    { name: 'description', value: appStrings.description },
    { name: 'activity', value: appStrings.activity },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'imp', value: appStrings.imp, isGreen: true },
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

  const getMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setMaterials(response);
    await getBudgetMaterials({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const getExtraMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setExtraMaterials(response);
    await getExtraBudgetMaterials({
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

  const handleSearchSelect = async (id: string) => {
    let material, matRef;
    matRef = materials.find(mat =>
      id === mat.id
        ? (material = mat?.material)
        : (material = mat?.subMaterials.find(subMat => id === subMat.id)!),
    );

    if (material) {
      const { id, quantity, cost, name } = material;
      setSelectedProduct({
        ...selectedProduct,
        quantity,
        cost,
        description: { value: id, label: name },
      });
      setMaterialRef({
        materialId: matRef?.id!,
        subMaterialId: id,
        isExtraMaterial: false,
        isSubMaterial: matRef?.material?.hasSubMaterials!,
      });
    } else {
      let extraMaterial, extraMatRef;
      extraMatRef = extraMaterials.find(mat =>
        id === mat.id
          ? (extraMaterial = mat?.material)
          : (extraMaterial = mat?.subMaterials.find(
              subMat => id === subMat.id,
            )!),
      );
      if (extraMaterial) {
        const { id, quantity, cost, name } = extraMaterial;
        setSelectedProduct({
          ...selectedProduct,
          quantity,
          cost,
          description: { value: id, label: name },
        });
        setMaterialRef({
          materialId: extraMatRef?.id!,
          subMaterialId: id,
          isExtraMaterial: true,
          isSubMaterial: extraMatRef?.material?.hasSubMaterials!,
        });
      }
    }
  };

  const editButton = async (projectOrderId: string) => {
    const successCallback = (response: IProjectOrder) => {
      setSelectedOrder(response);
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
      removeItem(selectedOrder.id);
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
    setSelectedOrder(tableData.find(m => m.id === productId)!);
    setIsProductModalOpen(true);
  };

  const editProduct = async (orderId: string, productId: string) => {
    const product = tableData
      .find(m => m?.id === orderId)
      ?.products?.find(s => s.id === productId);
    if (product) {
      const order = tableData.find(m => m.id === orderId);
      setSelectedOrder(order!);
      setSelectedProduct({
        ...product,
        description: { value: product.id, label: product.description },
      });
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
      setTableData(
        tableData.map(e =>
          e.id === selectedOrder.id
            ? {
                ...e,
                products: e.products?.filter(s => s.id !== selectedProduct.id),
              }
            : e,
        ),
      );
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

  const handleOnSubmit = async (projectOrder: IProjectOrder) => {
    const successCallback = (item: IProjectOrder) => {
      setSelectedOrder(initialSelectedOrderData);
      setIsModalOpen(false);
      projectOrder.id ? updateItem(item) : addItem(item);
    };
    const serviceCallParameters = {
      projectId,
      projectOrder,
      appStrings,
      successCallback,
    };
    projectOrder.id
      ? await updateProjectOrder(serviceCallParameters)
      : await createProjectOrder(serviceCallParameters);
  };

  const onSubmitProduct = async (data: IProduct) => {
    const { description, ...rest } = data;
    const product = {
      ...rest,
      description: description.label,
      quantity: +rest.quantity,
      cost: +rest.cost,
    };
    const successAddCallback = (orderId: string, item: IOrderProduct) => {
      setTableData(
        tableData.map(m =>
          m?.id === orderId
            ? {
                ...m,
                products: [...m.products, item],
              }
            : m,
        ),
      );
      setSelectedProduct(initialSelectedProductData);
      setMaterialRef(initialMaterialRefData);
      setIsProductModalOpen(false);
    };

    const successUpdateCallback = (orderId: string, item: IOrderProduct) => {
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
    order: yup.number().positive().required(appStrings?.requiredField),
    proforma: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
  });

  const productValSchema = yup.object().shape({
    description: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    activity: yup.string().required(appStrings?.requiredField),
    quantity: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getOrders();
    getMaterials();
    getExtraMaterials();
    return () => abortController.abort();
  }, []);

  const options = () => {
    let optionsList: { value: string; label: string }[] = [];
    materials.forEach(material => {
      if (!material?.material?.hasSubMaterials) {
        optionsList.push({
          value: material.id,
          label: material?.material?.name,
        });
      } else {
        material?.subMaterials.forEach(subMaterial =>
          optionsList.push({
            value: subMaterial.id,
            label: subMaterial?.name,
          }),
        );
      }
    });
    extraMaterials.forEach(material => {
      if (!material?.material?.hasSubMaterials) {
        optionsList.push({
          value: material.id,
          label: material?.material?.name,
        });
      } else {
        material?.subMaterials.forEach(subMaterial =>
          optionsList.push({
            value: subMaterial.id,
            label: subMaterial?.name,
          }),
        );
      }
    });
    return optionsList;
  };

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
                ? setSelectedOrder({
                    ...initialSelectedOrderData,
                    order: tableData[0].order + 1,
                  })
                : setSelectedOrder(initialSelectedOrderData);
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
              setSelectedOrder(initialSelectedOrderData);
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
              <SearchSelect
                name="description"
                label={appStrings.material}
                placeholder={appStrings.material}
                isDisabled={!!selectedProduct.id}
                options={options()}
                value={selectedProduct.description}
                onChange={item => handleSearchSelect(item?.value?.value)}
              />
              <Input
                name="activity"
                label={appStrings.activity}
                innerStyle={{ width: '200px', marginRight: '5px' }}
                isDisabled
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
          setSelectedOrder(initialSelectedOrderData);
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
          setMaterialRef(initialMaterialRefData);
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
          setSelectedOrder({ ...selectedOrder, id });
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

export default Orders;
