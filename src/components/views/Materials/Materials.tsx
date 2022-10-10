import React, {
  HtmlHTMLAttributes,
  ReactEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  addMaterial,
  getMaterials,
  updateMaterial,
} from '../../../services/materialsService';
import { IMaterial, IMaterialBreakdown } from '../../../types/collections';
import Button from '../../common/Button/Button';
import Form, { Input } from '../../common/Form';
import styles from './Materials.module.css';
import * as yup from 'yup';
import { useAppSelector } from '../../../redux/hooks';
import Sidebar from '../../layout/Sidebar';
import MaterialsTableView, {
  TTableHeader,
} from '../../layout/MaterialsTableView/MaterialsTableView';

const tableHeader: TTableHeader[] = [
  { name: 'name', value: 'Name' },
  { name: 'unit', value: 'Unit' },
  { name: 'quantity', value: 'Quantity' },
  { name: 'cost', value: 'Cost' },
];

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
  const appStrings = useAppSelector(state => state.settings.appStrings);

  useEffect(() => {
    (async function () {
      const data = await getMaterials();
      if (data?.length) setMaterialsDataTable(data);
    })();
  }, []);

  const handleRowClick = (event: MouseEvent) => {
    const row = event.target as HTMLInputElement;
    const materialID = row.id;
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.Global?.requiredField),
    unit: yup.string().required(appStrings?.Global?.requiredField),
    cost: yup.string().required(appStrings?.Global?.requiredField),
  });

  const onSubmit = async (data: any) => {
    if (!selectedMaterial.material.id) {
      const materialID = await addMaterial(data);
      if (materialID) {
        Object.assign(data, { id: materialID });
        setMaterialsDataTable([
          ...materialsData,
          { id: materialID, material: data, subMaterials: [] },
        ]);
      }
    } else {
      const res = await updateMaterial(data);
      if (res) {
        const materials = materialsData.map(breakDown =>
          breakDown.material.id === data.id
            ? { id: data.id, material: data, subMaterials: [] }
            : breakDown,
        );
        setMaterialsDataTable(materials);
      }
    }
  };

  return (
    <>
      <Sidebar />
      <div className={`${styles.projects_materials_container}`}>
        <Form
          id="materials-form"
          initialFormData={selectedMaterial.material}
          validationSchema={validationSchema}
          validateOnBlur={['cost', 'name', 'unit']}
          style={{ marginLeft: '26px', alignItems: 'start' }}
          onSubmit={onSubmit}
        >
          <div style={{ display: 'flex' }}>
            <Input
              name="name"
              label="Material"
              innerStyle={{ width: '200px', marginRight: '5px' }}
            />
            <Input
              name="unit"
              label="Unit"
              innerStyle={{ width: '200px', marginRight: '5px' }}
            />
            <Input
              name="cost"
              type={'number'}
              label="Cost"
              innerStyle={{ width: '200px', marginRight: '5px' }}
            />
          </div>
          <div>
            <Button type="submit" style={{ width: '75px' }}>
              {selectedMaterial.material.id ? 'Update' : 'Add'}
            </Button>
            {selectedMaterial.material.id && (
              <Button
                onClick={() => setSelectedMaterial(initialSelectedMaterialData)}
                style={{ width: '75px', marginLeft: '5px' }}
              >
                Clear
              </Button>
            )}
          </div>
        </Form>
        <MaterialsTableView
          headers={tableHeader}
          items={materialsData}
          boxStyle={{ width: '98%', margin: '20px 0 0 20px' }}
          handleRowClick={handleRowClick}
        />
      </div>
    </>
  );
}
