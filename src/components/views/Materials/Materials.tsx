import React, { useEffect, useState } from 'react';
import {
  addMaterial,
  addSubmaterial,
  deleteMaterial,
  deleteSubMaterial,
  getMaterials,
  updateMaterial,
  updateSubMaterial,
} from '../../../services/materialsService';
import {
  IMaterial,
  IMaterialBreakdown,
  ISubMaterial,
} from '../../../types/collections';
import Button from '../../common/Button/Button';
import Form, { Input, Switch } from '../../common/Form';
import * as yup from 'yup';
import { useAppSelector } from '../../../redux/hooks';
import Sidebar from '../../layout/Sidebar';
import MaterialsTableView, {
  TTableHeader,
} from '../../layout/MaterialsTableView/MaterialsTableView';
import { Box, Flex, Heading } from '@chakra-ui/react';
import SearchInput from '../../common/SearchInput';
import Modal from '../../common/Modal';
import styles from './Materials.module.css';
import ExchangeInput from '../../common/ExchangeInput';
import AlertDialog from '../../common/AlertDialog/AlertDialog';
const initialSelectedMaterialData = {
  id: '',
  material: {
    cost: 0,
    id: '',
    name: '',
    hasSubMaterials: false,
    unit: '',
  },
  subMaterials: [],
};
const initialSelectedSubMaterialData = {
  id: '',
  cost: 0,
  name: '',
  quantity: 1,
  unit: '',
};

export default function Materials() {
  const [materialsData, setMaterialsDataTable] = useState<
    Array<IMaterialBreakdown>
  >([]);
  const [selectedMaterial, setSelectedMaterial] = useState<IMaterialBreakdown>(
    initialSelectedMaterialData,
  );
  const [selectedSubMaterial, setSelectedSubMaterial] = useState<ISubMaterial>(
    initialSelectedSubMaterialData,
  );
  const [exchange, setExchange] = useState<string>('500');
  const [editExchange, setEditExchange] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubMaterialModalOpen, setIsSubMaterialModalOpen] = useState(false);
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost },
    { name: 'dollarCost', value: 'cost($)' },
  ];

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const materialID = row.id;
  };

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

  const exchangeValSchema = yup.object().shape({
    exchange: yup.number().positive().required(appStrings?.requiredField),
  });

  const onSubmit = async (data: IMaterial) => {
    const value: IMaterial = {
      ...data,
      cost: !data.hasSubMaterials ? data.cost : 0,
    };
    const successAddCallback = (materialId: string) => {
      Object.assign(value, { id: materialId });
      setMaterialsDataTable([
        ...materialsData,
        { id: materialId, material: value, subMaterials: [] },
      ]);
      setIsModalOpen(false);
    };
    const successUpdateCallback = () => {
      const materials = materialsData.map(breakDown => {
        return breakDown.material.id === value.id
          ? { ...breakDown, material: value }
          : breakDown;
      });
      setMaterialsDataTable(materials);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      material: value,
      appStrings,
      successCallback: !value.id ? successAddCallback : successUpdateCallback,
    };
    !value.id
      ? await addMaterial(serviceCallParameters)
      : await updateMaterial(serviceCallParameters);
  };

  const handleOnSubmitExchange = (data: any) => {
    setExchange(data.exchange);
    setEditExchange(false);
  };

  const onSubmitSubmaterial = async (data: ISubMaterial) => {
    const successAddCallback = (materialId: string, subMaterialId: string) => {
      setMaterialsDataTable(
        materialsData.map(m =>
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
      setMaterialsDataTable(
        materialsData.map(m =>
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
      materialId: selectedMaterial?.material?.id,
      submaterial: data,
      appStrings,
      successCallback: !data.id ? successAddCallback : successUpdateCallback,
    };
    !data.id
      ? await addSubmaterial(serviceCallParameters)
      : await updateSubMaterial(serviceCallParameters);
  };

  const editButton = async (materialId: string) => {
    const materialBreakDown = materialsData.find(m => m.id === materialId);
    setSelectedMaterial(materialBreakDown as IMaterialBreakdown);
    setIsModalOpen(true);
  };

  const addSubMaterial = async (materialId: string) => {
    const materialBreakDown = materialsData.find(m => m.id === materialId);
    setSelectedMaterial(materialBreakDown as IMaterialBreakdown);
    setIsSubMaterialModalOpen(true);
  };

  const editSubMaterial = async (materialId: string, submaterialId: string) => {
    const submaterial = materialsData
      .find(m => m.material?.id === materialId)
      ?.subMaterials?.find(s => s.id === submaterialId);
    if (submaterial) {
      const materialBreakDown = materialsData.find(m => m.id === materialId);
      setSelectedMaterial(materialBreakDown as IMaterialBreakdown);
      setSelectedSubMaterial(submaterial);
      setIsSubMaterialModalOpen(true);
    }
  };

  const delSubMaterial = async (materialId: string, submaterialId: string) => {
    setSelectedMaterial({ ...selectedMaterial, id: materialId });
    setSelectedSubMaterial({
      ...selectedSubMaterial,
      id: submaterialId,
    });
    setIsAlertDialogOpen(true);
  };

  const deleteButton = async () => {
    if (selectedMaterial.id && !selectedSubMaterial.id) {
      const successCallback = () => {
        setMaterialsDataTable(
          materialsData.filter(e => e.id !== selectedMaterial.id),
        );
        setSelectedMaterial(initialSelectedMaterialData);
        setIsAlertDialogOpen(false);
      };
      await deleteMaterial({
        materialId: selectedMaterial.id,
        appStrings,
        successCallback,
      });
    } else if (selectedSubMaterial.id) {
      const successCallback = () => {
        setMaterialsDataTable(
          materialsData.map(e =>
            e.id === selectedMaterial.id
              ? {
                  ...e,
                  subMaterials: e.subMaterials?.filter(
                    s => s.id !== selectedSubMaterial.id,
                  ),
                }
              : e,
          ),
        );
        setSelectedMaterial(initialSelectedMaterialData);
        setSelectedSubMaterial(initialSelectedSubMaterialData);
        setIsAlertDialogOpen(false);
      };
      await deleteSubMaterial({
        materialId: selectedMaterial.id,
        subMaterialId: selectedSubMaterial.id,
        appStrings,
        successCallback,
      });
    }
  };

  const handleHasSubMaterialChange = (e: any) => {
    setSelectedMaterial({
      ...selectedMaterial,
      material: {
        ...selectedMaterial.material,
        hasSubMaterials: e.value,
      },
    });
  };

  useEffect(() => {
    (async function () {
      const successCallback = (response: IMaterialBreakdown[]) =>
        setMaterialsDataTable(response);
      await getMaterials({ appStrings, successCallback });
    })();
  }, []);

  useEffect(() => {
    if (!isModalOpen) setSelectedMaterial(initialSelectedMaterialData);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isSubMaterialModalOpen) {
      setSelectedSubMaterial(initialSelectedSubMaterialData);
      setSelectedMaterial(initialSelectedMaterialData);
    }
  }, [isSubMaterialModalOpen]);

  return (
    <>
      <Sidebar />
      <div className={`${styles.projects_materials_container}`}>
        <Box p={5} borderWidth="1px" className={`${styles.title_container}`}>
          <h1 className={`${styles.title}`}>
            {appStrings.materialsManagement}
          </h1>
        </Box>
        <div className={`${styles.content_container}`}>
          <Flex marginBottom="5px">
            <SearchInput
              style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
              placeholder={appStrings.search}
              onChange={handleSearch}
            ></SearchInput>
            <div
              style={{ textAlign: 'end' }}
              className={styles.exchange_container}
            >
              <Form
                id="exchange-form"
                initialFormData={{ exchange }}
                validationSchema={exchangeValSchema}
                validateOnBlur
                style={{ alignItems: 'end', flex: 1 }}
                onSubmit={handleOnSubmitExchange}
              >
                <ExchangeInput
                  editExchange={editExchange}
                  onClick={() => setEditExchange(true)}
                />
              </Form>
              <Button onClick={() => setIsModalOpen(true)}>+</Button>
              <Modal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedMaterial(initialSelectedMaterialData);
                }}
              >
                <Heading as="h2" size="lg">
                  {selectedMaterial.id
                    ? appStrings.editMaterial
                    : appStrings.createMaterial}
                </Heading>
                <Form
                  id="material-form"
                  initialFormData={selectedMaterial.material}
                  validationSchema={validationSchema}
                  validateOnChange
                  validateOnBlur
                  onSubmit={onSubmit}
                >
                  <Input
                    name="name"
                    label={appStrings.name}
                    innerStyle={{ width: '200px', marginRight: '5px' }}
                    placeholder={appStrings.materialName}
                  />
                  <Input
                    name="unit"
                    label={appStrings.unit}
                    innerStyle={{ width: '200px', marginRight: '5px' }}
                    placeholder={appStrings.metricUnit}
                  />
                  <Switch
                    name="hasSubMaterials"
                    label={appStrings.hasSubmaterials}
                    onChange={e => handleHasSubMaterialChange(e)}
                    helperText={appStrings.submaterialsDisclaimer}
                  />
                  {!selectedMaterial.material?.hasSubMaterials && (
                    <Input
                      name="cost"
                      type={'number'}
                      label={appStrings.cost}
                      innerStyle={{ width: '200px', marginRight: '5px' }}
                    />
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
                  {selectedMaterial.id
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
              setSelectedMaterial(initialSelectedMaterialData);
              setSelectedSubMaterial(initialSelectedSubMaterialData);
              setIsAlertDialogOpen(false);
            }}
            onSubmit={() => deleteButton()}
          />
          <MaterialsTableView
            headers={tableHeader}
            items={materialsData}
            filter={value =>
              searchTerm === '' ||
              value?.material?.name?.toUpperCase().includes(searchTerm)
            }
            handleRowClick={handleRowClick}
            onClickEdit={id => editButton(id)}
            onClickDelete={id => {
              setSelectedMaterial({ ...selectedMaterial, id });
              setIsAlertDialogOpen(true);
            }}
            onClickAddSubMaterial={id => addSubMaterial(id)}
            onClickEditSubMaterial={(materialId, submaterialId) =>
              editSubMaterial(materialId, submaterialId)
            }
            onClickDeleteSubMaterial={(materialId, submaterialId) => {
              delSubMaterial(materialId, submaterialId);
            }}
            exchangeRate={Number(exchange)}
            formatCurrency
          />
        </div>
      </div>
    </>
  );
}
