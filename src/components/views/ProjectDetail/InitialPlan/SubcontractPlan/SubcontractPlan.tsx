import styles from './SubcontractPlan.module.css';
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
  createProjectSubcontractPlan,
  getProjectSubcontractPlanById,
  getProjectSubcontractsPlan,
  updateProjectSubcontractPlan,
} from '../../../../../services/ProjectSubcontractsPlanService';
import { IProjectSubcontractPlan } from '../../../../../types/projectSubcontractPlan';
import Form, { Input } from '../../../../common/Form';
import { useAppSelector } from '../../../../../redux/hooks';

interface ISubcontractPlan {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
};

const SubcontractPlan: React.FC<ISubcontractPlan> = props => {
  const [tableData, setTableData] = useState<IProjectSubcontractPlan[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectSubcontractPlan>(
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

  const getSubcontractsPlan = async () => {
    const successCallback = (response: IProjectSubcontractPlan[]) =>
      setTableData(response);
    await getProjectSubcontractsPlan({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const editButton = async (projectSubcontractPlanId: string) => {
    const successCallback = (response: IProjectSubcontractPlan) => {
      setSelectedItem({ ...response });
      setIsModalOpen(true);
    };
    await getProjectSubcontractPlanById({
      projectId,
      projectSubcontractPlanId,
      appStrings,
      successCallback,
    });
  };

  const deleteButton = (id: string) => {};

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleOnSubmit = async (
    projectSubcontractPlan: IProjectSubcontractPlan,
  ) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      getSubcontractsPlan();
    };
    const serviceCallParameters = {
      projectId,
      projectSubcontractPlan,
      appStrings,
      successCallback,
    };
    projectSubcontractPlan.id
      ? await updateProjectSubcontractPlan(serviceCallParameters)
      : await createProjectSubcontractPlan(serviceCallParameters);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getSubcontractsPlan();
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
                ? appStrings.editSubcontract
                : appStrings.createSubcontract}
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

export default SubcontractPlan;
