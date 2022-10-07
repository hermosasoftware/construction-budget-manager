import styles from './InitialPlan.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Heading, useToast } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import TableView, { TTableHeader } from '../../../common/TableView/TableView';
import {
  createProjectMaterialPlan,
  getProjectMaterialPlanById,
  getProjectMaterialsPlan,
  updateProjectMaterialPlan,
} from '../../../../services/ProjectMaterialsPlanService';
import { IProjectMaterialPlan } from '../../../../types/projectMaterialPlan';
import Form, { Input } from '../../../common/Form';
import { useAppSelector } from '../../../../redux/hooks';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';

interface IInitialPlan {
  projectId: string;
}

interface IItem extends Omit<IProjectMaterialPlan, 'name'> {
  name: { value: string; label: string };
}

const initialSelectedItemData = {
  id: '',
  name: { value: '', label: '' },
  unit: '',
  quantity: 1,
  cost: 0,
  subtotal: 0,
};

const InitialPlan: React.FC<IInitialPlan> = props => {
  const [tableHeader, setTableHeader] = useState<TTableHeader[]>([]);
  const [tableData, setTableData] = useState<IProjectMaterialPlan[]>([]);
  const [selectedItem, setSelectedItem] = useState<IItem>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const toast = useToast();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const materials = useAppSelector(state => state.materials.materials);

  const getMaterialsPlan = useCallback(async () => {
    const [errors, resProjects] = await getProjectMaterialsPlan(projectId);
    if (!errors) {
      setTableHeader([
        { name: 'name', value: 'Name' },
        { name: 'unit', value: 'Unit' },
        { name: 'quantity', value: 'Quantity' },
        { name: 'cost', value: 'Cost', isGreen: true },
        { name: 'subtotal', value: 'SubTotal', isGreen: true },
      ]);
      setTableData(resProjects);
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

  const editButton = async (id: string) => {
    const [errors, resProjects] = await getProjectMaterialPlanById(
      projectId,
      id,
    );
    if (!errors && resProjects) {
      setSelectedItem({
        ...resProjects,
        name: { value: resProjects.id, label: resProjects.name },
      });
      setIsModalOpen(true);
    }
  };

  const deleteButton = (id: string) => {};

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleSearchSelect = async (id: string) => {
    const material = materials.find(material => id === material.id);
    if (material) {
      const { id, ...rest } = material;
      setSelectedItem({
        ...selectedItem,
        ...rest,
        name: { value: material.id, label: material.name },
      });
    }
  };

  const handleOnSubmit = async (data: IItem) => {
    const { name, ...rest } = data;
    const projectMaterialPlan = { ...rest, name: name.label };
    projectMaterialPlan.id
      ? await updateProjectMaterialPlan(projectId, projectMaterialPlan)
      : await createProjectMaterialPlan(projectId, projectMaterialPlan);
    setSelectedItem(initialSelectedItemData);
    setIsModalOpen(false);
    getMaterialsPlan();
  };

  const validationSchema = yup.object().shape({
    name: yup.object().shape({
      value: yup.string().required(appStrings?.Global?.requiredField),
      label: yup.string().required(appStrings?.Global?.requiredField),
    }),
    unit: yup.string().required(appStrings?.Global?.requiredField),
    quantity: yup
      .number()
      .positive()
      .required(appStrings?.Global?.requiredField),
    cost: yup.number().positive().required(appStrings?.Global?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getMaterialsPlan();
    return () => {
      abortController.abort();
    };
  }, [getMaterialsPlan, projectId, toast]);

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
              {selectedItem.id ? 'Edit Material' : 'Create Material'}
            </Heading>
            <Form
              id="project-form"
              initialFormData={selectedItem}
              validationSchema={validationSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleOnSubmit}
            >
              <SearchSelect
                name="name"
                label="name"
                placeholder="Project name"
                isDisabled={!!selectedItem.id}
                options={materials.map(material => ({
                  value: material.id,
                  label: material.name,
                }))}
                value={selectedItem.name}
                onChange={item => {
                  handleSearchSelect(item?.value?.value);
                }}
              />
              <Input name="unit" label="Unit" placeholder="Metric Unit" />
              <Input name="quantity" type="number" label="Quantity" />
              <Input name="cost" type="number" label="Cost" />

              <br />
              <Button width="full" type="submit">
                Submit
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
      {!tableData.length ? <h1>No records found</h1> : null}
    </div>
  );
};

export default InitialPlan;