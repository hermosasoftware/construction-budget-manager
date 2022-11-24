import styles from './Invoicing.module.css';
import { Flex, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { Input } from '../../../common/Form';
import {
  createProjectInvoiceDetail,
  getProjectInvoiceDetailById,
  getProjectInvoicing,
  updateProjectInvoiceDetail,
} from '../../../../services/ProjectInvoiceService';
import { IProjectInvoiceDetail } from '../../../../types/projectInvoiceDetail';
import { useAppSelector } from '../../../../redux/hooks';

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
};

const Invoicing: React.FC<IInvoicing> = props => {
  const [tableData, setTableData] = useState<IProjectInvoiceDetail[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectInvoiceDetail>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'order', value: appStrings.order },
    { name: 'quantity', value: appStrings.quantity, isGreen: true },
    { name: 'name', value: appStrings.name },
    { name: 'cost', value: appStrings.cost },
    { name: 'subtotal', value: appStrings.subtotal },
    { name: 'activity', value: appStrings.activity },
    { name: 'invoice', value: appStrings.invoice },
    { name: 'delivered', value: appStrings.delivered },
    { name: 'difference', value: appStrings.difference },
  ];

  const getInvoicing = async () => {
    const successCallback = (response: IProjectInvoiceDetail[]) =>
      setTableData(response);
    await getProjectInvoicing({
      projectId,
      appStrings,
      successCallback,
    });
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

  const deleteButton = (id: string) => {};

  const handleOnSubmit = async (
    projectInvoiceDetail: IProjectInvoiceDetail,
  ) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      getInvoicing();
    };
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail,
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
    cost: yup.number().positive().required(appStrings?.requiredField),
    activity: yup.string().required(appStrings?.requiredField),
    invoice: yup.string().required(appStrings?.requiredField),
    delivered: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getInvoicing();
    return () => {
      abortController.abort();
    };
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
              {selectedItem.id
                ? appStrings.editMaterial
                : appStrings.addMaterial}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input name="order" label={appStrings.order} />
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
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
        </div>
      </Flex>
      <TableView
        headers={tableHeader}
        items={tableData}
        filter={value =>
          searchTerm === '' || value.name.toUpperCase().includes(searchTerm)
        }
        onClickEdit={id => editButton(id)}
        onClickDelete={id => deleteButton(id)}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default Invoicing;