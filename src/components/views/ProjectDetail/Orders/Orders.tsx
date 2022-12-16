import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  createProjectOrder,
  deleteProjectOrder,
  getProjectOrderById,
  getProjectOrder,
  updateProjectOrder,
} from '../../../../services/ProjectOrderService';
import { IOrderMaterials, IProjectOrder } from '../../../../types/projectOrder';
import { useAppSelector } from '../../../../redux/hooks';
import { colonFormat } from '../../../../utils/numbers';
import OrdersTableView, {
  TTableHeader,
} from '../../../layout/OrdersTableView/OrdersTableView';

import styles from './Orders.module.css';

interface IOrders {
  projectId: string;
}

const initialSelectedOrderData = {
  id: '',
  order: 0,
  proforma: '',
  date: new Date(),
  cost: 0,
  imp: 0,
  subtotal: 0,
  total: 0,
  materials: [],
};

const initialSelectedMaterialData = {
  id: '',
  quantity: '1',
  description: '',
  activity: '',
  cost: 0,
  imp: 0,
  subtotal: 0,
  total: 0,
};

const temporalArray = [
  {
    id: '324fghg',
    order: 1,
    proforma: '325423',
    date: new Date(),
    cost: 340,
    imp: 10,
    subtotal: 350,
    total: 350,
    materials: [
      {
        id: '3245fc',
        quantity: '1',
        description: 'vbgfng',
        activity: 'sdgdsf',
        cost: 120,
        imp: 120,
        subtotal: 240,
        total: 240,
      },
    ],
  },
];
const Orders: React.FC<IOrders> = props => {
  const [tableData, setTableData] = useState<IProjectOrder[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectOrder>(
    initialSelectedOrderData,
  );
  const [selectedSubMaterial, setSelectedSubMaterial] =
    useState<IOrderMaterials>(initialSelectedMaterialData);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubMaterialModalOpen, setIsSubMaterialModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'order', value: appStrings.order },
    { name: 'proforma', value: appStrings.proforma },
    { name: 'date', value: appStrings.date },
    { name: 'quantity', value: appStrings.quantity, isGreen: true },
    { name: 'description', value: appStrings.description },
    { name: 'activity', value: appStrings.activity },
    { name: 'cost', value: appStrings.cost },
    { name: 'imp', value: appStrings.imp },
    { name: 'subtotal', value: appStrings.subtotal },
    { name: 'total', value: appStrings.total },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: data.date.toDateString(),
      cost: colonFormat(data.cost),
      subtotal: colonFormat(data.subtotal),
    }));

  const getOrders = async () => {
    const successCallback = (response: IProjectOrder[]) =>
      setTableData(response);
    await getProjectOrder({
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

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const materialID = row.id;
  };

  const editButton = async (projectInvoiceDetailId: string) => {
    const successCallback = (response: IProjectOrder) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getProjectOrderById({
      projectId,
      projectInvoiceDetailId,
      appStrings,
      successCallback,
    });
  };

  const addSubMaterial = async (materialId: string) => {
    const materialBreakDown = tableData.find(m => m.id === materialId);
    setSelectedItem(materialBreakDown as IProjectOrder);
    setIsSubMaterialModalOpen(true);
  };

  const editSubMaterial = async (orderId: string, materialId: string) => {
    const submaterial = tableData
      .find(m => m?.id === orderId)
      ?.materials?.find(s => s.id === materialId);
    if (submaterial) {
      const materialBreakDown = tableData.find(m => m.id === orderId);
      setSelectedItem(materialBreakDown as IProjectOrder);
      setSelectedSubMaterial(submaterial);
      setIsSubMaterialModalOpen(true);
    }
  };

  const delSubMaterial = async (materialId: string, submaterialId: string) => {
    setSelectedItem({ ...selectedItem, id: materialId });
    setSelectedSubMaterial({
      ...selectedSubMaterial,
      id: submaterialId,
    });
    setIsAlertDialogOpen(true);
  };

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedOrderData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectOrder({
      projectId,
      projectInvoiceDetailId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectInvoiceDetail: IProjectOrder) => {
    const successCallback = (item: IProjectOrder) => {
      setSelectedItem(initialSelectedOrderData);
      setIsModalOpen(false);
      projectInvoiceDetail.id ? updateItem(item) : addItem(item);
    };
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...projectInvoiceDetail,
        order: +projectInvoiceDetail.order,
        cost: +projectInvoiceDetail.cost,
        subtotal: projectInvoiceDetail.cost,
      },
      appStrings,
      successCallback,
    };
    projectInvoiceDetail.id
      ? await updateProjectOrder(serviceCallParameters)
      : await createProjectOrder(serviceCallParameters);
  };

  const onSubmitSubmaterial = async (data: IOrderMaterials) => {
    const successAddCallback = (materialId: string, subMaterialId: string) => {
      setTableData(
        tableData.map(m =>
          m?.id === materialId
            ? {
                ...m,
                materials: [...m.materials, { ...data, id: subMaterialId }],
              }
            : m,
        ),
      );
      setIsSubMaterialModalOpen(false);
    };

    const successUpdateCallback = (
      materialId: string,
      subMaterialId: string,
    ) => {
      setTableData(
        tableData.map(m =>
          m?.id === materialId
            ? {
                ...m,
                materials: m?.materials.map(s =>
                  s.id === subMaterialId ? data : s,
                ),
              }
            : m,
        ),
      );
      setIsSubMaterialModalOpen(false);
    };
    const serviceCallParameters = {
      materialId: selectedItem?.id,
      submaterial: data,
      appStrings,
      successCallback: !data.id ? successAddCallback : successUpdateCallback,
    };
    // !data.id
    //   ? await addSubmaterial(serviceCallParameters)
    //   : await updateSubMaterial(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    order: yup.number().positive().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    name: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
    activity: yup.string().required(appStrings?.requiredField),
    proforma: yup.string().required(appStrings?.requiredField),
  });

  const subMaterialValSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    unit: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
    quantity: yup.string().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    setTableData(temporalArray);
    // getOrders();
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
              <Input name="order" type="number" label={appStrings.order} />
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
            isOpen={isSubMaterialModalOpen}
            onClose={() => setIsSubMaterialModalOpen(false)}
          >
            <Heading as="h2" size="lg">
              {selectedItem.id
                ? appStrings.editMaterial
                : appStrings.createMaterial}
            </Heading>
            <Form
              id="submaterial-form"
              initialFormData={selectedSubMaterial}
              validationSchema={subMaterialValSchema}
              validateOnChange
              validateOnBlur
              onSubmit={onSubmitSubmaterial}
            >
              <Input
                name="name"
                label={appStrings.name}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="unit"
                label={appStrings.unit}
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
        tittle={appStrings.deleteInvoice}
        content={appStrings.deleteWarning}
        isOpen={isAlertDialogOpen}
        onClose={() => {
          setSelectedItem(initialSelectedOrderData);
          setIsAlertDialogOpen(false);
        }}
        onSubmit={() => deleteButton()}
      />
      <OrdersTableView
        headers={tableHeader}
        items={formatTableData()}
        filter={value =>
          searchTerm === '' || value?.order?.toString()?.includes(searchTerm)
        }
        handleRowClick={handleRowClick}
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id });
          setIsAlertDialogOpen(true);
        }}
        onClickAddSubMaterial={id => addSubMaterial(id)}
        onClickEditSubMaterial={(materialId, submaterialId) =>
          editSubMaterial(materialId, submaterialId)
        }
        onClickDeleteSubMaterial={(materialId, submaterialId) => {
          delSubMaterial(materialId, submaterialId);
        }}
        // exchangeRate={Number(exchange)}
        formatCurrency
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default Orders;
