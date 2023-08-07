import React, { useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../../common/Button/Button';
import Modal from '../../../../common/Modal/Modal';
import SearchInput from '../../../../common/SearchInput/SearchInput';
import TableView, {
  TTableHeader,
} from '../../../../common/TableView/TableView';
import {
  createExtraBudgetOther,
  deleteExtraBudgetOther,
  getExtraBudgetOtherById,
  updateExtraBudgetOther,
} from '../../../../../services/ExtraBudgetOthersService';
import { IBudgetOther } from '../../../../../types/budgetOther';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Form, { Input } from '../../../../common/Form';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { useAppSelector } from '../../../../../redux/hooks';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetOther.module.css';

interface IBudgetOtherView {
  projectId: string;
  activity: IBudgetActivity;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BudgetOther: React.FC<IBudgetOtherView> = props => {
  const { projectId, activity } = props;
  const [selectedItem, setSelectedItem] = useState<IBudgetOther>(
    initialSelectedItemData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const extraOthers = useAppSelector(state => state.extraOthers.extraOthers);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true, showTotal: true },
    {
      name: 'subtotal',
      value: appStrings.subtotal,
      isGreen: true,
      showTotal: true,
    },
    {
      name: 'dollars',
      value: appStrings.dollars,
      isGreen: true,
      showTotal: true,
    },
  ];

  const formatTableData = () =>
    extraOthers.map(data => ({
      ...data,
      cost: colonFormat(data.cost),
      subtotal: colonFormat(data.subtotal),
      dollars: dolarFormat(data.subtotal / Number(activity.exchange)),
    }));

  const editButton = async (extraBudgetOtherId: string) => {
    const successCallback = (response: IBudgetOther) => {
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getExtraBudgetOtherById({
      projectId,
      activityId: activity.id,
      extraBudgetOtherId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = async () => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
    };
    await deleteExtraBudgetOther({
      projectId,
      activityId: activity.id,
      extraBudgetOtherId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (extraBudgetOther: IBudgetOther) => {
    const successCallback = (item: IBudgetOther) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      activityId: activity.id,
      extraBudgetOther: {
        ...extraBudgetOther,
        quantity: +extraBudgetOther.quantity,
        cost: +extraBudgetOther.cost,
        subtotal: extraBudgetOther.cost * extraBudgetOther.quantity,
      },
      appStrings,
      successCallback,
    };
    extraBudgetOther.id
      ? await updateExtraBudgetOther(serviceCallParameters)
      : await createExtraBudgetOther(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

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
              {selectedItem.id ? appStrings.editOther : appStrings.addOther}
            </Heading>
            <Form
              id="other-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <Input
                name="name"
                label={appStrings.name}
                placeholder={appStrings.name}
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
      <AlertDialog
        title={appStrings.deleteOther}
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
        showTotals
      />
      {!extraOthers.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetOther;
