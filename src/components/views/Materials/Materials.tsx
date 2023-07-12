import { useEffect, useState } from 'react';
import {
  addMaterial,
  addSubmaterial,
  deleteMaterial,
  deleteSubMaterial,
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
import MaterialsTableView, {
  TTableHeader,
} from '../../layout/MaterialsTableView/MaterialsTableView';
import { Box, Text, Flex, Heading, useColorModeValue } from '@chakra-ui/react';
import SearchInput from '../../common/SearchInput';
import Modal from '../../common/Modal';
import ExchangeInput from '../../common/ExchangeInput';
import AlertDialog from '../../common/AlertDialog/AlertDialog';

import styles from './Materials.module.css';

const initialSelectedMaterialData = {
  id: '',
  material: {
    cost: 0,
    id: '',
    name: '',
    hasSubMaterials: false,
    unit: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  subMaterials: [],
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

export default function Materials() {
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
  const materials = useAppSelector(state => state.materials.materials);

  const tableHeader: TTableHeader[] = [
    { name: 'name', value: appStrings.name },
    { name: 'unit', value: appStrings.unit },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost },
    { name: 'dollarCost', value: 'cost($)' },
  ];

  const formatTableData = () =>
    materials.map(data => ({
      ...data,
      material: { ...data.material, quantity: 1 },
    }));

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleRowClick = (event: MouseEvent) => {};

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
      cost: !data.hasSubMaterials ? +data.cost : 0,
    };
    const successAddCallback = (materialId: string) => {
      Object.assign(value, { id: materialId });
      setIsModalOpen(false);
    };
    const successUpdateCallback = () => {
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
    const successAddCallback = () => {
      setIsSubMaterialModalOpen(false);
    };

    const successUpdateCallback = () => {
      setIsSubMaterialModalOpen(false);
    };
    const serviceCallParameters = {
      materialId: selectedMaterial?.material?.id,
      submaterial: { ...data, cost: +data.cost, quantity: +data.quantity },
      appStrings,
      successCallback: !data.id ? successAddCallback : successUpdateCallback,
    };
    !data.id
      ? await addSubmaterial(serviceCallParameters)
      : await updateSubMaterial(serviceCallParameters);
  };

  const editButton = async (materialId: string) => {
    const materialBreakDown = materials.find(m => m.id === materialId);
    setSelectedMaterial(materialBreakDown as IMaterialBreakdown);
    setIsModalOpen(true);
  };

  const addSubMaterial = async (materialId: string) => {
    const materialBreakDown = materials.find(m => m.id === materialId);
    setSelectedMaterial(materialBreakDown as IMaterialBreakdown);
    setIsSubMaterialModalOpen(true);
  };

  const editSubMaterial = async (materialId: string, submaterialId: string) => {
    const submaterial = materials
      .find(m => m.material?.id === materialId)
      ?.subMaterials?.find(s => s.id === submaterialId);
    if (submaterial) {
      const materialBreakDown = materials.find(m => m.id === materialId);
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

  const Header = () => {
    const textColor = useColorModeValue('teal.500', 'teal.300');

    return (
      <Box borderBottomWidth="1px" px={5} py={3}>
        <Flex className="header" justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color={textColor} align="left">
            {appStrings.materialsManagement}
          </Text>
        </Flex>
      </Box>
    );
  };

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
    <div className={`container  ${styles.projects_materials_container}`}>
      <Header />
      <div className={`${styles.content_container}`}>
        <Box p={5} borderWidth="1px" borderRadius={12}>
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
              <Button
                className={styles.button_add}
                onClick={() => setIsModalOpen(true)}
              >
                +
              </Button>
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
                    placeholder={appStrings.materialName}
                  />
                  <Input
                    name="unit"
                    label={appStrings.unit}
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
                  <Input name="name" label={appStrings.name} />
                  <Input name="unit" label={appStrings.unit} />
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
            items={formatTableData()}
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
            usePagination
          />
          {!materials.length ? <h1>{appStrings.noRecords}</h1> : null}
        </Box>
      </div>
    </div>
  );
}
