import React, { useEffect, useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../../common/Button/Button';
import Modal from '../../../../common/Modal/Modal';
import SearchInput from '../../../../common/SearchInput/SearchInput';
import TableView, {
  TTableHeader,
} from '../../../../common/TableView/TableView';
import {
  createExtraBudgetSubcontract,
  getExtraBudgetSubcontractById,
  getExtraBudgetSubcontracts,
  updateExtraBudgetSubcontract,
} from '../../../../../services/ExtraBudgetSubcontractsService';
import { IBudgetSubcontract } from '../../../../../types/budgetSubcontract';
import Form, { Input } from '../../../../common/Form';
import { useAppSelector } from '../../../../../redux/hooks';

import styles from './BudgetSubcontract.module.css';

interface IBudgetSubcontractView {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
};

const BudgetSubcontract: React.FC<IBudgetSubcontractView> = props => {
  const [tableData, setTableData] = useState<IBudgetSubcontract[]>([]);
  const [selectedItem, setSelectedItem] = useState<IBudgetSubcontract>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
  ];

  const getSubcontracts = async () => {
    const successCallback = (response: IBudgetSubcontract[]) =>
      setTableData(response);
    await getExtraBudgetSubcontracts({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const editButton = async (extraBudgetSubcontractId: string) => {
    const successCallback = (response: IBudgetSubcontract) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getExtraBudgetSubcontractById({
      projectId,
      extraBudgetSubcontractId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = (id: string) => {};

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (extraBudgetSubcontract: IBudgetSubcontract) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      getSubcontracts();
    };
    const serviceCallParameters = {
      projectId,
      extraBudgetSubcontract: {
        ...extraBudgetSubcontract,
        subtotal: extraBudgetSubcontract.cost * extraBudgetSubcontract.quantity,
      },
      appStrings,
      successCallback,
    };
    extraBudgetSubcontract.id
      ? await updateExtraBudgetSubcontract(serviceCallParameters)
      : await createExtraBudgetSubcontract(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getSubcontracts();
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className={styles.operations_container}>
      <Flex marginBottom="5px">
        <SearchInput
          className={styles.search_button}
          placeholder="Search"
          onChange={handleSearch}
        />
        <div className={styles.form_container}>
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
                ? appStrings.editSubcontract
                : appStrings.addSubcontract}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input
                name="name"
                label={appStrings.name}
                placeholder={appStrings.projectName}
              />
              <Input
                name="quantity"
                type="number"
                label={appStrings.quantity}
              />
              <Input name="cost" type="number" label={appStrings.cost} />
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

export default BudgetSubcontract;
