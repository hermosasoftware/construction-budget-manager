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
import Form, { Input, Switch } from '../../../../common/Form';
import { useAppSelector } from '../../../../../redux/hooks';
import SearchSelect from '../../../../common/Form/Elements/SearchSelect';
import AlertDialog from '../../../../common/AlertDialog/AlertDialog';
import {
  IMaterialBreakdown,
  ISubMaterial,
} from '../../../../../types/collections';
import { colonFormat } from '../../../../../utils/numbers';

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
  hasSubMaterials: false,
  quantity: 1,
  cost: 0,
  subtotal: 0,
};
const initialSelectedSubMaterialData = {
  id: '',
  cost: 0,
  name: '',
  quantity: '1',
  unit: '',
};

const BudgetMaterial: React.FC<IBudgetMaterialView> = props => {
  const [tableData, setTableData] = useState<IMaterialBreakdown[]>([]);
  const [selectedItem, setSelectedItem] = useState<IItem>(
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
  const { projectId, isBudgetOpen, getBudget, budget } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const materials = useAppSelector(state => state.materials.materials);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost, isGreen: true },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'dollarCost', value: appStrings.dollars, isGreen: true },
  ];

  const validationSchema = yup.object().shape({
    name: yup
      .object()
      .shape({
        value: yup.string().required(),
        label: yup.string().required(),
      })
      .required(appStrings?.requiredField),
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

  const formatTableData = () =>
    tableData.map(data => ({
      ...data,
      material: {
        ...data.material,
        // cost: colonFormat(data.material.cost),
        subtotal: colonFormat(data.material.subtotal!),
        // dollars: dolarFormat(data.material.subtotal! / budget.exchange),
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
                subMaterials: m.subMaterials.map(s =>
                  s.id === subMaterialId ? data : s,
                ),
              }
            : m,
        ),
      );
      setIsSubMaterialModalOpen(false);
    };
    const serviceCallParameters = {
      materialId: selectedMaterial,
      projectId,
      budgetSubMaterial: data,
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
      const material = tableData.find(e => e.id === item.id);
      const MatBreakdown = {
        id: item.id,
        material: item,
        subMaterials: material?.subMaterials!,
      };
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
            onClose={() => setIsSubMaterialModalOpen(false)}
          >
            <Heading as="h2" size="lg">
              {selectedMaterial
                ? appStrings.editSubmaterial
                : appStrings.createSubmaterial}
            </Heading>
            <Form
              id="submaterial-form"
              initialFormData={selectedSubMaterial}
              validationSchema={subMaterialValSchema}
              validateOnChange
              validateOnBlur
              onSubmit={onSubmitSubmaterial}
            >
              <Input
                name="name"
                label={appStrings.name}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="unit"
                label={appStrings.unit}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="quantity"
                label={appStrings.quantity}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
              <Input
                name="cost"
                type={'number'}
                label={appStrings.cost}
                innerStyle={{ width: '200px', marginRight: '5px' }}
              />
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
      />
      {!tableData.length ? <h1>{appStrings.noRecords}</h1> : null}
    </div>
  );
};

export default BudgetMaterial;
