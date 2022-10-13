import styles from './MaterialsDelivered.module.css';
import { Flex, Heading, useToast } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import Form, { Input } from '../../../common/Form';
import {
  createProjectMaterialDelivered,
  getProjectMaterialDeliveredById,
  getProjectMaterialsDelivered,
  updateProjectMaterialDelivered,
} from '../../../../services/ProjectMaterialsDeliveredService';
import { IProjectMaterialDelivered } from '../../../../types/projectMaterialDelivered';
import { useAppSelector } from '../../../../redux/hooks';

interface IMaterialsDelivered {
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

const MaterialsDelivered: React.FC<IMaterialsDelivered> = props => {
  const [tableData, setTableData] = useState<IProjectMaterialDelivered[]>([]);
  const [selectedItem, setSelectedItem] = useState<IProjectMaterialDelivered>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const toast = useToast();
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

  const getMaterialsDelivered = useCallback(async () => {
    const [errors, response] = await getProjectMaterialsDelivered(projectId);
    if (!errors) {
      setTableData(response);
    } else {
      toast({
        title: 'Error al extraer la informacion',
        description: errors + '',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [projectId, toast]);

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const editButton = async (id: string) => {
    const [errors, response] = await getProjectMaterialDeliveredById(
      projectId,
      id,
    );
    if (!errors && response) {
      setSelectedItem(response);
      setIsModalOpen(true);
    }
  };

  const deleteButton = (id: string) => {};

  const handleOnSubmit = async (
    projectMaterialDelivered: IProjectMaterialDelivered,
  ) => {
    projectMaterialDelivered.id
      ? await updateProjectMaterialDelivered(
          projectId,
          projectMaterialDelivered,
        )
      : await createProjectMaterialDelivered(
          projectId,
          projectMaterialDelivered,
        );
    setSelectedItem(initialSelectedItemData);
    setIsModalOpen(false);
    getMaterialsDelivered();
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
    getMaterialsDelivered();
    return () => {
      abortController.abort();
    };
  }, [getMaterialsDelivered, projectId, toast]);

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
                : appStrings.createMaterial}
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

export default MaterialsDelivered;
