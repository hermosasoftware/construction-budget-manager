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
  deleteBudgetMaterial,
  getBudgetMaterialById,
  getBudgetMaterials,
  updateBudgetMaterial,
} from '../../../../../services/BudgetMaterialsService';
import { IBudgetMaterial } from '../../../../../types/budgetMaterial';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Form, { Input } from '../../../../common/Form';
import { useAppSelector } from '../../../../../redux/hooks';
import SearchSelect from '../../../../common/Form/Elements/SearchSelect';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import { IMaterialBreakdown } from '../../../../../types/collections';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetMaterial.module.css';

interface IBudgetMaterialView {
  projectId: string;
  isBudgetOpen: boolean;
  getBudget: Function;
  budget: IProjectBudget;
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
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId, isBudgetOpen, getBudget, budget } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const materials = useAppSelector(state => state.materials.materials);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'dollars', value: appStrings.dollars, isGreen: true },
  ];

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      material: {
        ...data.material,
        cost: colonFormat(data.material.cost),
        subtotal: colonFormat(data.material.subtotal!),
        dollars: dolarFormat(data.material.subtotal! / budget.exchange),
      },
    }));

  const getMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setTableData(response);
    await getBudgetMaterials({
      projectId,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IMaterialBreakdown) =>
    setTableData([item, ...tableData]);

  const updateItem = (item: IMaterialBreakdown) => {
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

  const deleteButton = async () => {
    const successCallback = () => {
      removeItem(selectedItem.id);
      setSelectedItem(initialSelectedItemData);
      setIsAlertDialogOpen(false);
      getBudget();
    };
    await deleteBudgetMaterial({
      projectId,
      budgetMaterialId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

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
      quantity: +rest.quantity,
      cost: +rest.cost,
      subtotal: rest.cost * rest.quantity,
      name: name.label,
    };
    const successCallback = (item: IBudgetMaterial) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      const MatBreakdown = { id: item.id, material: item, subMaterials: [] };
      budgetMaterial.id ? updateItem(MatBreakdown) : addItem(MatBreakdown);
      getBudget();
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
          {isBudgetOpen && (
            <Button onClick={() => setIsModalOpen(true)}>+</Button>
          )}
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
      <AlertDialog
        tittle={appStrings.deleteMaterial}
        content={appStrings.deleteWarning}
        isOpen={isAlertDialogOpen}
        onClose={() => {
          setSelectedItem(initialSelectedItemData);
          setIsAlertDialogOpen(false);
        }}
        onSubmit={() => deleteButton()}
      />
      <MaterialsTableView
        headers={tableHeader}
        items={formatTableData()}
        filter={value =>
          searchTerm === '' ||
          value?.material?.name?.toUpperCase().includes(searchTerm)
        }
        onClickEdit={id => editButton(id)}
        onClickDelete={id => {
          setSelectedItem({ ...selectedItem, id: id });
          setIsAlertDialogOpen(true);
        }}
        hideOptions={!isBudgetOpen}
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetMaterial;
