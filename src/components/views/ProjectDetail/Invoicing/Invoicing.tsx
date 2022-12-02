import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  createProjectInvoiceDetail,
  deleteProjectInvoiceDetail,
  getProjectInvoiceDetailById,
  getProjectInvoicing,
  updateProjectInvoiceDetail,
} from '../../../../services/ProjectInvoiceService';
import { IProjectInvoiceDetail } from '../../../../types/projectInvoiceDetail';
import { useAppSelector } from '../../../../redux/hooks';
import { colonFormat } from '../../../../utils/numbers';

import styles from './Invoicing.module.css';
interface IInvoicing {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  order: 0,
  quantity: 0,
  name: '',
  cost: 0,
  subtotal: 0,
  activity: '',
  invoice: '',
  delivered: 0,
  difference: 0,
  date: new Date(),
};

const Invoicing: React.FC<IInvoicing> = props => {
  const [tableData, setTableData] = useState<IProjectInvoiceDetail[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectInvoiceDetail>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'order', value: appStrings.order },
    { name: 'quantity', value: appStrings.quantity, isGreen: true },
    { name: 'name', value: appStrings.name },
    { name: 'date', value: appStrings.date },
    { name: 'cost', value: appStrings.cost },
    { name: 'subtotal', value: appStrings.subtotal },
    { name: 'activity', value: appStrings.activity },
    { name: 'invoice', value: appStrings.invoice },
    { name: 'delivered', value: appStrings.delivered },
    { name: 'difference', value: appStrings.difference },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      date: data.date.toDateString(),
      cost: colonFormat(data.cost),
      subtotal: colonFormat(data.subtotal),
    }));

  const getInvoicing = async () => {
    const successCallback = (response: IProjectInvoiceDetail[]) =>
      setTableData(response);
    await getProjectInvoicing({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IProjectInvoiceDetail) =>
    setTableData([item, ...tableData]);

  const updateItem = (item: IProjectInvoiceDetail) => {
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
    const successCallback = (response: IProjectInvoiceDetail) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getProjectInvoiceDetailById({
      projectId,
      projectInvoiceDetailId,
      appStrings,
      successCallback,
    });
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

  const handleOnSubmit = async (
    projectInvoiceDetail: IProjectInvoiceDetail,
  ) => {
    const successCallback = (item: IProjectInvoiceDetail) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      projectInvoiceDetail.id ? updateItem(item) : addItem(item);
    };
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...projectInvoiceDetail,
        order: +projectInvoiceDetail.order,
        delivered: +projectInvoiceDetail.delivered,
        quantity: +projectInvoiceDetail.quantity,
        cost: +projectInvoiceDetail.cost,
        subtotal: projectInvoiceDetail.cost * projectInvoiceDetail.quantity,
        difference:
          projectInvoiceDetail.quantity - projectInvoiceDetail.delivered,
      },
      appStrings,
      successCallback,
    };
    projectInvoiceDetail.id
      ? await updateProjectInvoiceDetail(serviceCallParameters)
      : await createProjectInvoiceDetail(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    order: yup.number().positive().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    name: yup.string().required(appStrings?.requiredField),
    date: yup.date().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
    activity: yup.string().required(appStrings?.requiredField),
    invoice: yup.string().required(appStrings?.requiredField),
    delivered: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getInvoicing();
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
              <Input name="order" type="number" label={appStrings.order} />
              <Input
                name="quantity"
                type="number"
                label={appStrings.quantity}
              />
              <Input name="name" label={appStrings.name} />
              <Input name="cost" label={appStrings.cost} />
              <Input name="activity" label={appStrings.activity} />
              <Input name="invoice" type="number" label={appStrings.invoice} />
              <Input
                name="delivered"
                type="number"
                label={appStrings.delivered}
              />
              <DatePicker name="date" label={appStrings.date}></DatePicker>
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
          setSelectedItem(initialSelectedItemData);
          setIsAlertDialogOpen(false);
        }}
        onSubmit={() => deleteButton()}
      />
      <TableView
        headers={tableHeader}
        items={formatTableData()}
        filter={value =>
          searchTerm === '' || value.name.toUpperCase().includes(searchTerm)
        }
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id: id });
          setIsAlertDialogOpen(true);
        }}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default Invoicing;
