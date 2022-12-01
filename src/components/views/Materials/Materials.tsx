import React, { useEffect, useState } from 'react';
import {
  addMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from '../../../services/materialsService';
import { IMaterial, IMaterialBreakdown } from '../../../types/collections';
import Button from '../../common/Button/Button';
import Form, { Input, Select } from '../../common/Form';
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
const initialSelectedMaterialData = {
  id: '',
  material: {
    cost: 0,
    id: '',
    name: '',
    unit: '',
  },
  subMaterials: [],
};

export default function Materials() {
  const [materialsData, setMaterialsDataTable] = useState<
    Array<IMaterialBreakdown>
  >([]);
  const [selectedMaterial, setSelectedMaterial] = useState<IMaterialBreakdown>(
    initialSelectedMaterialData,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    cost: yup.string().required(appStrings?.requiredField),
  });

  const onSubmit = async (data: IMaterial) => {
    const successAddCallback = (materialID: string) => {
      Object.assign(data, { id: materialID });
      setMaterialsDataTable([
        ...materialsData,
        { id: materialID, material: data, subMaterials: [] },
      ]);
      setIsModalOpen(false);
    };
    const successUpdateCallback = () => {
      const materials = materialsData.map(breakDown =>
        breakDown.material.id === data.id
          ? { id: data.id, material: data, subMaterials: [] }
          : breakDown,
      );
      setMaterialsDataTable(materials);
      setIsModalOpen(false);
    };
    const serviceCallParameters = {
      material: data,
      appStrings,
      successCallback: !data.id ? successAddCallback : successUpdateCallback,
    };
    !data.id
      ? addMaterial(serviceCallParameters)
      : updateMaterial(serviceCallParameters);
  };

  const editButton = async (materialId: string) => {
    const material = materialsData.find(m => m.id === materialId);
    setSelectedMaterial(material as IMaterialBreakdown);
    setIsModalOpen(true);
  };

  const deleteButton = async (materialId: string) => {
    const successCallback = () =>
      setMaterialsDataTable(materialsData.filter(m => m.id !== materialId));
    await deleteMaterial({ materialId, appStrings, successCallback });
  };

  useEffect(() => {
    (async function () {
      const data = await getMaterials();
      if (data?.length) setMaterialsDataTable(data);
    })();
  }, []);

  useEffect(() => {
    if (!isModalOpen) setSelectedMaterial(initialSelectedMaterialData);
  }, [isModalOpen]);

  return (
    <>
      <Sidebar />
      <div className={`${styles.projects_materials_container}`}>
        <Box p={5} borderWidth="1px" className={`${styles.title_container}`}>
          <h1 className={`${styles.title}`}>
            {appStrings.materialsManagement}
          </h1>
        </Box>
        <Flex marginBottom="5px" marginLeft={'10px'}>
          <SearchInput
            style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
            placeholder={appStrings.search}
            onChange={handleSearch}
          ></SearchInput>
          <div style={{ textAlign: 'end' }}>
            <Button onClick={() => setIsModalOpen(true)}>+</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <Heading as="h2" size="lg">
                {selectedMaterial.id
                  ? appStrings.editMaterial
                  : appStrings.createMaterial}
              </Heading>
              <Form
                id="project-form"
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
                />
                <Input
                  name="unit"
                  label={appStrings.unit}
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
        <MaterialsTableView
          headers={tableHeader}
          items={materialsData}
          boxStyle={{ width: '98%', margin: '20px 0 0 20px' }}
          filter={value =>
            searchTerm === '' ||
            value?.material?.name?.toUpperCase().includes(searchTerm)
          }
          handleRowClick={handleRowClick}
          onClickEdit={id => editButton(id)}
          onClickDelete={id => deleteButton(id)}
        />
      </div>
    </>
  );
}
