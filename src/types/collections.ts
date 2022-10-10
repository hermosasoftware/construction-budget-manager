export interface IMaterial {
  id: string;
  name: string;
  unit: string;
  cost: number;
}

interface ISubMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  cost: number;
}

export interface IMaterialBreakdown {
  id: string;
  material: IMaterial;
  subMaterials: ISubMaterial[];
}
