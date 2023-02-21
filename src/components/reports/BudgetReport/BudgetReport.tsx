import { FC, Fragment, useEffect, useState } from 'react';
import { Image } from '@react-pdf/renderer';
import CotoLogo from '../../../assets/img/coto-logo.png';
import Document from '../../common/PDF/Document';
import Text from '../../common/PDF/Text';
import View from '../../common/PDF/View';
import Page from '../../common/PDF/Page';
import EditableTextarea from '../../common/PDF/EditableTextarea';
import { IProject } from '../../../types/project';
import { IProjectBudget } from '../../../types/projectBudget';
import { IBudgetActivity } from '../../../types/budgetActivity';
import { IMaterialBreakdown } from '../../../types/collections';
import { IBudgetMaterial } from '../../../types/budgetMaterial';
import { colonFormat, dolarFormat } from '../../../utils/numbers';

import styles from './BudgetReport.module.css';

interface Props {
  project: IProject;
  budget: IProjectBudget;
  activity: IBudgetActivity[];
  noteValue: string;
  setNoteValue: Function;
  detailed?: boolean;
  pdfMode: boolean;
}

const BudgetReport: FC<Props> = props => {
  const {
    project,
    budget,
    activity,
    noteValue,
    setNoteValue,
    detailed = false,
    pdfMode,
  } = props;
  const [subtotal, setSubtotal] = useState<number>(0);
  const [adminFee, setAdminFee] = useState<number>(0);
  const [saleTax, setSaleTax] = useState<number>(0);

  const handleInputChange = (value: string) => setNoteValue(value);

  useEffect(() => {
    setSubtotal(
      (budget.sumMaterials +
        budget.sumLabors +
        budget.sumSubcontracts +
        budget.sumOthers) /
        budget.exchange,
    );
  }, [budget]);

  useEffect(() => {
    const adminFee = subtotal ? (subtotal * budget.adminFee) / 100 : 0;
    const saleTax = subtotal ? subtotal * 0.04 : 0;

    setAdminFee(adminFee);
    setSaleTax(saleTax);
  }, [subtotal]);

  const calculateMaterialCost = (row: any) => {
    let total = 0;
    const subMaterials = row.subMaterials;
    if (row?.material.hasSubMaterials) {
      subMaterials?.forEach((s: any) => {
        total += Number(s.quantity) * Number.parseFloat(s.cost);
      });
    } else {
      total = Number(row?.material?.cost);
    }
    return total;
  };

  const calculateTotalMaterialCost = (materials: IMaterialBreakdown[]) => {
    let total = 0;
    materials.forEach(row => (total += calculateMaterialCost(row)));

    return total;
  };

  const calculateTotalCost = (array: any[]) => {
    let total = 0;
    array.forEach(row => (total += row?.cost));

    return total;
  };

  return (
    <Document pdfMode={pdfMode}>
      <Page className="page-wrapper" pdfMode={pdfMode}>
        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50" pdfMode={pdfMode}>
            {pdfMode ? (
              <Image src={CotoLogo} style={{ maxWidth: '150pt' }} />
            ) : (
              <img src={CotoLogo} className={styles.coto_logo} alt={'Logo'} />
            )}
          </View>
          <View className="w-50" pdfMode={pdfMode}>
            <Text className="fs-20 right bold" pdfMode={pdfMode}>
              {`Budget Report`}
            </Text>
          </View>
        </View>

        <View className="mt-40" pdfMode={pdfMode}>
          <Text className="fs-20 bold" pdfMode={pdfMode}>
            {`General Information`}
          </Text>
        </View>
        <View className=" flex" pdfMode={pdfMode}>
          <View className="w-55" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`PROJECT:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{project.name}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`CLIENT:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{project.client}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`LOCATION:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{project.location}</Text>
              </View>
            </View>
          </View>
          <View className="w-45" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`CURRENCY \n EXCHANGE:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{colonFormat(budget.exchange)}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`DATE:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>
                  {budget.creationDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {activity.map((element, k) => (
          <Fragment key={k}>
            <View className="mt-100" pdfMode={pdfMode}>
              <Text className="fs-20 bold" pdfMode={pdfMode}>
                {`Activity Details`}
              </Text>
            </View>
            <View className="row left flex " pdfMode={pdfMode}>
              <View className="w-55" pdfMode={pdfMode}>
                <View className="flex" pdfMode={pdfMode}>
                  <View className="w-40" pdfMode={pdfMode}>
                    <Text className="bold" pdfMode={pdfMode}>
                      {`CONCEPT:`}
                    </Text>
                  </View>
                  <View className="w-60" pdfMode={pdfMode}>
                    <Text pdfMode={pdfMode}>{element.activity}</Text>
                  </View>
                </View>
              </View>
              <View className="w-45" pdfMode={pdfMode}>
                <View className="flex" pdfMode={pdfMode}>
                  <View className="w-40" pdfMode={pdfMode}>
                    <Text className="bold" pdfMode={pdfMode}>
                      {`DATE:`}
                    </Text>
                  </View>
                  <View className="w-60" pdfMode={pdfMode}>
                    <Text pdfMode={pdfMode}>
                      {element.date.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {!!element.materials?.length && (
              <>
                <View className="mt-30" pdfMode={pdfMode}>
                  <Text className="fs-20 left bold" pdfMode={pdfMode}>
                    {`Materials`}
                  </Text>

                  <View className="bg-dark flex left" pdfMode={pdfMode}>
                    <View className="w-48 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Description`}
                      </Text>
                    </View>
                    <View className="w-10 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Qty.`}
                      </Text>
                    </View>
                    <View className="w-10 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Unit`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Unit Cost`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Subtotal`}
                      </Text>
                    </View>
                    <View className="w-15 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Dolars`}
                      </Text>
                    </View>
                  </View>
                </View>
                {element.materials?.map((row, i) => {
                  const material = row.material as IBudgetMaterial;
                  return (
                    <Fragment key={i}>
                      <View className="row flex left" pdfMode={pdfMode}>
                        <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {material.name}
                          </Text>
                        </View>
                        <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {`${material.quantity}`}
                          </Text>
                        </View>
                        <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {material.unit}
                          </Text>
                        </View>
                        <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {colonFormat(calculateMaterialCost(row))}
                          </Text>
                        </View>
                        <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {colonFormat(
                              material.quantity * calculateMaterialCost(row),
                            )}
                          </Text>
                        </View>
                        <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {dolarFormat(
                              (material.quantity * calculateMaterialCost(row)) /
                                budget.exchange,
                            )}
                          </Text>
                        </View>
                      </View>
                      {detailed &&
                        row.subMaterials.map((subMaterial, i) => (
                          <View
                            key={i}
                            className="row flex left"
                            pdfMode={pdfMode}
                          >
                            <View
                              className="w-48 p-4-8 pb-10"
                              pdfMode={pdfMode}
                            >
                              <Text className="dark" pdfMode={pdfMode}>
                                {`${subMaterial.name}`}
                              </Text>
                            </View>
                            <View
                              className="w-10 p-4-8 pb-10"
                              pdfMode={pdfMode}
                            >
                              <Text className="dark" pdfMode={pdfMode}>
                                {`${subMaterial.quantity}`}
                              </Text>
                            </View>
                            <View
                              className="w-10 p-4-8 pb-10"
                              pdfMode={pdfMode}
                            >
                              <Text className="dark" pdfMode={pdfMode}>
                                {subMaterial.unit}
                              </Text>
                            </View>
                            <View
                              className="w-20 p-4-8 pb-10"
                              pdfMode={pdfMode}
                            >
                              <Text className="dark" pdfMode={pdfMode}>
                                {colonFormat(subMaterial.cost)}
                              </Text>
                            </View>
                            <View
                              className="w-20 p-4-8 pb-10"
                              pdfMode={pdfMode}
                            >
                              <Text className="dark" pdfMode={pdfMode}>
                                {colonFormat(
                                  Number(subMaterial.quantity) *
                                    subMaterial.cost,
                                )}
                              </Text>
                            </View>
                            <View
                              className="w-15 p-4-8 pb-10"
                              pdfMode={pdfMode}
                            >
                              <Text className="dark" pdfMode={pdfMode}>
                                {dolarFormat(
                                  (Number(subMaterial.quantity) *
                                    subMaterial.cost) /
                                    budget.exchange,
                                )}
                              </Text>
                            </View>
                          </View>
                        ))}
                    </Fragment>
                  );
                })}
                <View className="flex left bg-gray p-5" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="bold" pdfMode={pdfMode}>
                      {`TOTAL`}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}></View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}></View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(
                        calculateTotalMaterialCost(element.materials),
                      )}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(element.sumMaterials)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(element.sumMaterials / budget.exchange)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {!!element.labors?.length && (
              <>
                <View className="mt-30" pdfMode={pdfMode}>
                  <Text className="fs-20 left bold" pdfMode={pdfMode}>
                    {`Labors`}
                  </Text>
                  <View className="bg-dark flex left" pdfMode={pdfMode}>
                    <View className="w-48 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Description`}
                      </Text>
                    </View>
                    <View className="w-10 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Qty.`}
                      </Text>
                    </View>
                    <View className="w-10 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Unit`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {` Unit Cost`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Subtotal`}
                      </Text>
                    </View>
                    <View className="w-15 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Dolars`}
                      </Text>
                    </View>
                  </View>
                </View>
                {element.labors.map((labor, i) => {
                  return (
                    <View key={i} className="row flex left" pdfMode={pdfMode}>
                      <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {labor.name}
                        </Text>
                      </View>
                      <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {`${labor.quantity}`}
                        </Text>
                      </View>
                      <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {labor.unit}
                        </Text>
                      </View>
                      <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {colonFormat(labor.cost)}
                        </Text>
                      </View>
                      <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {colonFormat(labor.quantity * labor.cost)}
                        </Text>
                      </View>
                      <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {dolarFormat(
                            (labor.quantity * labor.cost) / budget.exchange,
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <View className="flex left bg-gray p-5" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="bold" pdfMode={pdfMode}>
                      {`TOTAL`}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}></View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}></View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(calculateTotalCost(element.labors))}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(element.sumLabors)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(element.sumLabors / budget.exchange)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {!!element.subcontracts?.length && (
              <>
                <View className="mt-30" pdfMode={pdfMode}>
                  <Text className="fs-20 left bold" pdfMode={pdfMode}>
                    {`Subcontracts`}
                  </Text>
                  <View className="bg-dark flex left" pdfMode={pdfMode}>
                    <View className="w-48 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Description`}
                      </Text>
                    </View>
                    <View className="w-10 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Qty.`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {` Unit Cost`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Subtotal`}
                      </Text>
                    </View>
                    <View className="w-15 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Dolars`}
                      </Text>
                    </View>
                  </View>
                </View>
                {element.subcontracts.map((labor, i) => {
                  return (
                    <View key={i} className="row flex left" pdfMode={pdfMode}>
                      <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {labor.name}
                        </Text>
                      </View>
                      <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {`${labor.quantity}`}
                        </Text>
                      </View>
                      <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {colonFormat(labor.cost)}
                        </Text>
                      </View>
                      <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {colonFormat(labor.quantity * labor.cost)}
                        </Text>
                      </View>
                      <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {dolarFormat(
                            (labor.quantity * labor.cost) / budget.exchange,
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <View className="flex left bg-gray p-5" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="bold" pdfMode={pdfMode}>
                      {`TOTAL`}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}></View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(calculateTotalCost(element.subcontracts))}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(element.sumSubcontracts)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(element.sumSubcontracts / budget.exchange)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {!!element.others?.length && (
              <>
                <View className="mt-30" pdfMode={pdfMode}>
                  <Text className="fs-20 left bold" pdfMode={pdfMode}>
                    {`Others Expenses`}
                  </Text>
                  <View className="bg-dark flex left" pdfMode={pdfMode}>
                    <View className="w-48 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Description`}
                      </Text>
                    </View>
                    <View className="w-10 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Qty.`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {` Unit Cost`}
                      </Text>
                    </View>
                    <View className="w-20 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Subtotal`}
                      </Text>
                    </View>
                    <View className="w-15 p-4-8" pdfMode={pdfMode}>
                      <Text className="white bold" pdfMode={pdfMode}>
                        {`Dolars`}
                      </Text>
                    </View>
                  </View>
                </View>
                {element.others.map((other, i) => {
                  return (
                    <View key={i} className="row flex left" pdfMode={pdfMode}>
                      <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {other.name}
                        </Text>
                      </View>
                      <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {`${other.quantity}`}
                        </Text>
                      </View>
                      <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {colonFormat(other.cost)}
                        </Text>
                      </View>
                      <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {colonFormat(other.quantity * other.cost)}
                        </Text>
                      </View>
                      <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                        <Text className="dark" pdfMode={pdfMode}>
                          {dolarFormat(
                            (other.quantity * other.cost) / budget.exchange,
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <View className="flex left bg-gray p-5" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="bold" pdfMode={pdfMode}>
                      {`TOTAL`}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}></View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(calculateTotalCost(element.others))}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(element.sumOthers)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(element.sumOthers / budget.exchange)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View className="mt-30" pdfMode={pdfMode}>
              <Text className="fs-20 left bold" pdfMode={pdfMode}>
                {`Summary`}
              </Text>
              <View className="bg-dark flex center" pdfMode={pdfMode}>
                <View className="w-50 p-4-8 " pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Description`}
                  </Text>
                </View>
                <View className="w-50 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Dolars`}
                  </Text>
                </View>
              </View>
            </View>

            {!!element.materials?.length && (
              <View className="row flex center" pdfMode={pdfMode}>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {`Materials`}
                  </Text>
                </View>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {dolarFormat(element.sumMaterials / budget.exchange)}
                  </Text>
                </View>
              </View>
            )}
            {!!element.labors?.length && (
              <View className="row flex center" pdfMode={pdfMode}>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {`Labors`}
                  </Text>
                </View>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {dolarFormat(element.sumLabors / budget.exchange)}
                  </Text>
                </View>
              </View>
            )}
            {!!element.subcontracts?.length && (
              <View className="row flex center" pdfMode={pdfMode}>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {`Subcontracts`}
                  </Text>
                </View>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {dolarFormat(element.sumSubcontracts / budget.exchange)}
                  </Text>
                </View>
              </View>
            )}
            {!!element.others?.length && (
              <View className="row flex center" pdfMode={pdfMode}>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {`Others Expenses`}
                  </Text>
                </View>
                <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                  <Text className="dark" pdfMode={pdfMode}>
                    {dolarFormat(element.sumOthers / budget.exchange)}
                  </Text>
                </View>
              </View>
            )}

            <View className="row flex center bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`Subtotal`}
                </Text>
              </View>

              <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {dolarFormat(
                    (element.sumMaterials +
                      element.sumLabors +
                      element.sumSubcontracts +
                      element.sumOthers) /
                      budget.exchange,
                  )}
                </Text>
              </View>
            </View>
          </Fragment>
        ))}

        <View className="mt-100" pdfMode={pdfMode}>
          <View className="row" pdfMode={pdfMode}>
            <Text className="fs-20 bold" pdfMode={pdfMode}>
              {`Grand Total`}
            </Text>
          </View>
          <View className="flex" pdfMode={pdfMode}>
            <View className="w-50 mt-10" pdfMode={pdfMode}>
              <Text className="left fs-20 w-100" pdfMode={pdfMode}>
                {`Notes:`}
              </Text>
              <EditableTextarea
                className="w-100"
                value={noteValue}
                onChange={value => handleInputChange(value)}
                pdfMode={pdfMode}
              />
            </View>
            <View className="w-50 mt-20" pdfMode={pdfMode}>
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>Subtotal </Text>
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right bold dark" pdfMode={pdfMode}>
                    {dolarFormat(subtotal)}
                  </Text>
                </View>
              </View>
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>{`Admin Fee (12%)`}</Text>
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right bold dark" pdfMode={pdfMode}>
                    {dolarFormat(adminFee)}
                  </Text>
                </View>
              </View>
              <View className="flex" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text pdfMode={pdfMode}>{`IVA (4%)`}</Text>
                </View>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="right bold dark" pdfMode={pdfMode}>
                    {dolarFormat(saleTax)}
                  </Text>
                </View>
              </View>
              <View className="flex bg-gray p-5" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {`TOTAL`}
                  </Text>
                </View>
                <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                  <Text className="dark bold right ml-30" pdfMode={pdfMode}>
                    {dolarFormat(subtotal + adminFee + saleTax)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BudgetReport;
