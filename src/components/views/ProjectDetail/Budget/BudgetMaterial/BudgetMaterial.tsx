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
  createBudgetSubMaterial,
  deleteBudgetMaterial,
  deleteBudgetSubMaterial,
  getBudgetMaterialById,
  getBudgetMaterials,
  updateBudgetMaterial,
  updateBudgetSubMaterial,
} from '../../../../../services/BudgetMaterialsService';
import { IBudgetMaterial } from '../../../../../types/budgetMaterial';
import { IProjectBudget } from '../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Form, { AutoComplete, Input, Switch } from '../../../../common/Form';
import { useAppSelector } from '../../../../../redux/hooks';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import {
  IMaterialBreakdown,
  ISubMaterial,
} from '../../../../../types/collections';

import styles from './BudgetMaterial.module.css';

interface IBudgetMaterialView {
  projectId: string;
  isBudgetOpen: boolean;
  budget: IProjectBudget;
  activity: IBudgetActivity;
}

const initialSelectedItemData = {
  id: '',
  name: '',
  unit: '',
  hasSubMaterials: true,
  quantity: 1,
  cost: 0,
  subtotal: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const initialSelectedSubMaterialData = {
  id: '',
  cost: 0,
  name: '',
  quantity: 1,
  unit: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BudgetMaterial: React.FC<IBudgetMaterialView> = props => {
  const { projectId, isBudgetOpen, budget, activity } = props;
  const [tableData, setTableData] = useState<IMaterialBreakdown[]>([]);
  const [selectedItem, setSelectedItem] = useState<IBudgetMaterial>(
    initialSelectedItemData,
  );
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSubMaterial, setSelectedSubMaterial] = useState<ISubMaterial>(
    initialSelectedSubMaterialData,
  );
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [SubMatAlertDialogOpen, setSubMatAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubMaterialModalOpen, setIsSubMaterialModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const materials = useAppSelector(state => state.materials.materials);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true, showTotal: true },
    {
      name: 'subtotal',
      value: appStrings.subtotal,
      isGreen: true,
      showTotal: true,
    },
    {
      name: 'dollarCost',
      value: appStrings.dollars,
      isGreen: true,
      showTotal: true,
    },
  ];

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    unit: yup.string().required(appStrings?.requiredField),
    cost: yup.string().when('hasSubMaterials', (val, schema) => {
      if (val) {
        return yup.string().notRequired();
      }
      return yup.string().required();
    }),
  });

  const subMaterialValSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    unit: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
    quantity: yup.string().required(appStrings?.requiredField),
  });

  const getMaterials = async () => {
    const successCallback = (response: IMaterialBreakdown[]) =>
      setTableData(response);
    await getBudgetMaterials({
      projectId,
      activityId: activity.id,
      appStrings,
      successCallback,
    });
  };

  const addItem = (item: IMaterialBreakdown) =>
    setTableData([...tableData, item]);

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
      setSelectedItem(response);
      setIsModalOpen(true);
    };
    await getBudgetMaterialById({
      projectId,
      activityId: activity.id,
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
    };
    await deleteBudgetMaterial({
      projectId,
      activityId: activity.id,
      budgetMaterialId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const deleteSubMaterial = async () => {
    const successCallback = () => {
      setTableData(
        tableData.map(e =>
          e.id === selectedMaterial
            ? {
                ...e,
                subMaterials: e.subMaterials?.filter(
                  s => s.id !== selectedSubMaterial.id,
                ),
              }
            : e,
        ),
      );
      setSelectedMaterial('');
      setSelectedSubMaterial(initialSelectedSubMaterialData);
      setSubMatAlertDialogOpen(false);
    };
    await deleteBudgetSubMaterial({
      projectId,
      activityId: activity.id,
      budgetMaterialId: selectedMaterial,
      budgetSubMaterialId: selectedSubMaterial.id,
      appStrings,
      successCallback,
    });
  };

  const selectSubMaterial = (materialId: string) => {
    const materialBreakDown = tableData.find(m => m.id === materialId);
    setSelectedMaterial(materialBreakDown?.material?.id!);
    setIsSubMaterialModalOpen(true);
  };

  const onSubmitSubmaterial = async (data: ISubMaterial) => {
    const successAddCallback = (materialId: string, subMaterialId: string) => {
      setTableData(
        tableData.map(m =>
          m.material?.id === materialId
            ? {
                ...m,
                subMaterials: [
                  ...m.subMaterials,
                  { ...data, id: subMaterialId },
                ],
              }
            : m,
        ),
      );
      setSelectedSubMaterial(initialSelectedSubMaterialData);
      setIsSubMaterialModalOpen(false);
    };

    const successUpdateCallback = (
      materialId: string,
      subMaterialId: string,
    ) => {
      setTableData(
        tableData.map(m =>
          m.material?.id === materialId
            ? {
                ...m,
                subMaterials: m.subMaterials?.map(s =>
                  s.id === subMaterialId ? data : s,
                ),
              }
            : m,
        ),
      );
      setSelectedSubMaterial(initialSelectedSubMaterialData);
      setIsSubMaterialModalOpen(false);
    };
    const serviceCallParameters = {
      materialId: selectedMaterial,
      projectId,
      activityId: activity.id,
      budgetSubMaterial: {
        ...data,
        cost: +data.cost,
        quantity: +data.quantity,
      },
      appStrings,
      successCallback: !data.id ? successAddCallback : successUpdateCallback,
    };
    !data.id
      ? await createBudgetSubMaterial(serviceCallParameters)
      : await updateBudgetSubMaterial(serviceCallParameters);
  };

  const editSubMaterial = async (materialId: string, submaterialId: string) => {
    const submaterial = tableData
      .find(m => m.material?.id === materialId)
      ?.subMaterials?.find(s => s.id === submaterialId);
    if (submaterial) {
      const materialBreakDown = tableData.find(m => m.id === materialId);
      setSelectedMaterial(materialBreakDown?.id!);
      setSelectedSubMaterial(submaterial);
      setIsSubMaterialModalOpen(true);
    }
  };

  const delSubMaterial = async (materialId: string, submaterialId: string) => {
    setSelectedMaterial(materialId);
    setSelectedSubMaterial({ ...selectedSubMaterial, id: submaterialId });
    setSubMatAlertDialogOpen(true);
  };

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleAutoComplete = async (data: any) => {
    const { value, id } = data;
    const m = materials.find(material => id === material.id);
    if (m) {
      const { id, ...rest } = m.material;
      setSelectedItem({
        ...selectedItem,
        ...rest,
        subMaterials: m.subMaterials,
      });
    } else {
      setSelectedItem({ ...selectedItem, name: value });
    }
  };

  const handleAutoCompleteSubMaterial = async (data: any) => {
    const { value, id } = data;
    const result = materials.find(material => id === material.id);
    if (result) {
      const { cost, name, unit } = result.material;
      setSelectedSubMaterial({ ...selectedSubMaterial, cost, name, unit });
    } else {
      setSelectedSubMaterial({ ...selectedSubMaterial, name: value });
    }
  };

  const handleSubmaterialSuggestions = () =>
    materials
      .filter(item => !item.material.hasSubMaterials)
      .map(item => ({
        value: item.material.name,
        id: item.id,
      }));

  const handleOnSubmit = async (data: IBudgetMaterial) => {
    const { name, ...rest } = data;
    const subMaterials = tableData.find(e => e.id === data.id)?.subMaterials;
    const budgetMaterial = {
      ...rest,
      quantity: +rest.quantity,
      cost: +rest.cost,
      subtotal: rest.cost * rest.quantity,
      name,
      subMaterials: !data.id ? data.subMaterials : subMaterials,
    };
    const successCallback = (item: IBudgetMaterial) => {
      setSelectedItem(initialSelectedItemData);
      setIsModalOpen(false);
      const MatBreakdown = {
        id: item.id,
        material: item,
        subMaterials: item?.subMaterials || [],
      };
      budgetMaterial.id ? updateItem(MatBreakdown) : addItem(MatBreakdown);
    };
    const serviceCallParameters = {
      projectId,
      activityId: activity.id,
      budgetMaterial,
      appStrings,
      successCallback,
    };
    budgetMaterial.id
      ? await updateBudgetMaterial(serviceCallParameters)
      : await createBudgetMaterial(serviceCallParameters);
  };

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
              <AutoComplete
                name="name"
                label={appStrings.material}
                suggestions={materials.map(material => ({
                  value: material.material.name,
                  id: material.id,
                }))}
                onChange={e => handleAutoComplete(e.value)}
                placeholder={appStrings.materialName}
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
              <Switch
                name="hasSubMaterials"
                label={appStrings.hasSubmaterials}
                onChange={e =>
                  setSelectedItem({ ...selectedItem, hasSubMaterials: e.value })
                }
                helperText={appStrings.submaterialsDisclaimer}
              />
              {!selectedItem.hasSubMaterials && (
                <Input name="cost" type={'number'} label={appStrings.cost} />
              )}
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
          <Modal
            isOpen={isSubMaterialModalOpen}
            onClose={() => {
              setSelectedSubMaterial(initialSelectedSubMaterialData);
              setIsSubMaterialModalOpen(false);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedSubMaterial.id
                ? appStrings.editSubmaterial
                : appStrings.addSubmaterial}
            </Heading>
            <Form
              id="submaterial-form"
              initialFormData={selectedSubMaterial}
              validationSchema={subMaterialValSchema}
              validateOnChange
              validateOnBlur
              onSubmit={onSubmitSubmaterial}
            >
              <AutoComplete
                name="name"
                label={appStrings.material}
                suggestions={handleSubmaterialSuggestions()}
                onChange={e => handleAutoCompleteSubMaterial(e.value)}
                placeholder={appStrings.materialName}
              />
              <Input name="unit" label={appStrings.unit} />
              <Input name="quantity" label={appStrings.quantity} />
              <Input name="cost" type={'number'} label={appStrings.cost} />
              <br />
              <Button width="full" type="submit">
                {appStrings.submit}
              </Button>
            </Form>
          </Modal>
        </div>
      </Flex>
      <AlertDialog
        title={appStrings.deleteMaterial}
        content={appStrings.deleteWarning}
        isOpen={isAlertDialogOpen}
        onClose={() => {
          setSelectedItem(initialSelectedItemData);
          setIsAlertDialogOpen(false);
        }}
        onSubmit={() => deleteButton()}
      />
      <AlertDialog
        title={appStrings.deleteSubMaterial}
        content={appStrings.deleteWarning}
        isOpen={SubMatAlertDialogOpen}
        onClose={() => {
          setSelectedItem(initialSelectedItemData);
          setSubMatAlertDialogOpen(false);
        }}
        onSubmit={() => deleteSubMaterial()}
      />
      <MaterialsTableView
        headers={tableHeader}
        items={tableData}
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
        exchangeRate={Number(budget.exchange)}
        handleRowClick={() => {}}
        onClickAddSubMaterial={id => selectSubMaterial(id)}
        onClickEditSubMaterial={(materialId, submaterialId) =>
          editSubMaterial(materialId, submaterialId)
        }
        onClickDeleteSubMaterial={(materialId, submaterialId) => {
          delSubMaterial(materialId, submaterialId);
        }}
        formatCurrency
        usePagination
        showTotals
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetMaterial;
