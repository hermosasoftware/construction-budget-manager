import React, { useEffect, useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import * as yup from 'yup';
import Button from '../../../../common/Button/Button';
import Modal from '../../../../common/Modal/Modal';
import SearchInput from '../../../../common/SearchInput/SearchInput';
import MaterialsTableView, {
  TTableHeader,
} from '../../../../layout/MaterialsTableView/MaterialsTableView';
import {
  createBudgetMaterial,
  getBudgetMaterialById,
  getBudgetMaterials,
  updateBudgetMaterial,
} from '../../../../../services/BudgetMaterialsService';
import { IBudgetMaterial } from '../../../../../types/budgetMaterial';
import Form, { Input } from '../../../../common/Form';
import { useAppSelector } from '../../../../../redux/hooks';
import SearchSelect from '../../../../common/Form/Elements/SearchSelect';
import { IMaterialBreakdown } from '../../../../../types/collections';

import styles from './BudgetMaterial.module.css';

interface IBudgetMaterialView {
  projectId: string;
  isBudgetOpen: boolean;
}

interface IItem extends Omit<IBudgetMaterial, 'name'> {
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

const BudgetMaterial: React.FC<IBudgetMaterialView> = props => {
  const [tableData, setTableData] = useState<IMaterialBreakdown[]>([]);
  const [selectedItem, setSelectedItem] = useState<IItem>(
    initialSelectedItemData,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId, isBudgetOpen } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const materials = useAppSelector(state => state.materials.materials);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
  ];

  const getMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setTableData(response);
    await getBudgetMaterials({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const editButton = async (budgetMaterialId: string) => {
    const successCallback = (response: IBudgetMaterial) => {
      setSelectedItem({
        ...response,
        name: { value: response.id, label: response.name },
      });
      setIsModalOpen(true);
    };
    await getBudgetMaterialById({
      projectId,
      budgetMaterialId,
      appStrings,
      successCallback,
    });
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
    const budgetMaterial = {
      ...rest,
      subtotal: rest.cost * rest.quantity,
      name: name.label,
    };
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      getMaterials();
    };
    const serviceCallParameters = {
      projectId,
      budgetMaterial,
      appStrings,
      successCallback,
    };
    budgetMaterial.id
      ? await updateBudgetMaterial(serviceCallParameters)
      : await createBudgetMaterial(serviceCallParameters);
  };

  const onClickEdit = (id: string) => editButton(id);

  const onClickDelete = (id: string) => deleteButton(id);

  const validationSchema = yup.object().shape({
    name: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    unit: yup.string().required(appStrings?.requiredField),
    quantity: yup.number().positive().required(appStrings?.requiredField),
    cost: yup.number().positive().required(appStrings?.requiredField),
  });

  useEffect(() => {
    let abortController = new AbortController();
    getMaterials();
    return () => abortController.abort();
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
              <SearchSelect
                name="name"
                label={appStrings.material}
                placeholder={appStrings.projectName}
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
              <Input
                name="unit"
                label="Unit"
                placeholder={appStrings.metricUnit}
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
      <MaterialsTableView
        headers={tableHeader}
        items={tableData}
        filter={value =>
          searchTerm === '' ||
          value?.material?.name?.toUpperCase().includes(searchTerm)
        }
        onClickEdit={onClickEdit}
        onClickDelete={onClickEdit}
        hideOptions={!isBudgetOpen}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetMaterial;
