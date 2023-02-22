import { FC, Fragment, useEffect, useState } from 'react';
import { Image } from '@react-pdf/renderer';
import CotoLogo from '../../../assets/img/coto-logo.png';
import Document from '../../common/PDF/Document';
import Text from '../../common/PDF/Text';
import View from '../../common/PDF/View';
import Page from '../../common/PDF/Page';
import EditableTextarea from '../../common/PDF/EditableTextarea';
import { IProject } from '../../../types/project';
import { IBudgetActivity } from '../../../types/budgetActivity';
import { IMaterialBreakdown } from '../../../types/collections';
import { IBudgetMaterial } from '../../../types/budgetMaterial';
import { IBudgetLabor } from '../../../types/budgetLabor';
import { IBudgetSubcontract } from '../../../types/budgetSubcontract';
import { IBudgetOther } from '../../../types/budgetOther';
import { colonFormat, dolarFormat } from '../../../utils/numbers';

import styles from './ExtraReport.module.css';

interface Props {
  project: IProject;
  activity: IBudgetActivity;
  materials: IMaterialBreakdown[];
  labors: IBudgetLabor[];
  subcontracts: IBudgetSubcontract[];
  others: IBudgetOther[];
  noteValue: string;
  setNoteValue: Function;
  detailed?: boolean;
  pdfMode: boolean;
}

const ExtraReport: FC<Props> = props => {
  const {
    project,
    activity,
    materials,
    labors,
    subcontracts,
    others,
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
      (activity.sumMaterials +
        activity.sumLabors +
        activity.sumSubcontracts +
        activity.sumOthers) /
        Number(activity.exchange),
    );
  }, [activity]);

  useEffect(() => {
    const adminFee = subtotal
      ? (subtotal * Number(activity.adminFee)) / 100
      : 0;
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

  const calculateTotalMaterialCost = () => {
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
              {`Extra ${project.name}`}
            </Text>
          </View>
        </View>

        <View className=" left flex mt-40" pdfMode={pdfMode}>
          <View className="w-55" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`CONCEPT:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{activity.activity}</Text>
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
                  {activity.date.toLocaleDateString()}
                </Text>
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
                <Text pdfMode={pdfMode}>
                  {colonFormat(Number(activity.exchange))}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {materials.length > 0 && (
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
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Qty.`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
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
            {materials.map((row, i) => {
              const material = row.material as IBudgetMaterial;
              return (
                <Fragment key={i}>
                  <View className="row flex left" pdfMode={pdfMode}>
                    <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                      <Text className="dark" pdfMode={pdfMode}>
                        {material.name}
                      </Text>
                    </View>
                    <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                      <Text className="dark" pdfMode={pdfMode}>
                        {`${material.quantity}`}
                      </Text>
                    </View>
                    <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
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
                            Number(activity.exchange),
                        )}
                      </Text>
                    </View>
                  </View>
                  {detailed &&
                    row.subMaterials.map((subMaterial, i) => (
                      <View key={i} className="row flex left" pdfMode={pdfMode}>
                        <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {`${subMaterial.name}`}
                          </Text>
                        </View>
                        <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {`${subMaterial.quantity}`}
                          </Text>
                        </View>
                        <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {subMaterial.unit}
                          </Text>
                        </View>
                        <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {colonFormat(subMaterial.cost)}
                          </Text>
                        </View>
                        <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {colonFormat(
                              Number(subMaterial.quantity) * subMaterial.cost,
                            )}
                          </Text>
                        </View>
                        <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                          <Text className="dark" pdfMode={pdfMode}>
                            {dolarFormat(
                              (Number(subMaterial.quantity) *
                                subMaterial.cost) /
                                Number(activity.exchange),
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
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}></View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}></View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(calculateTotalMaterialCost())}
                </Text>
              </View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(activity.sumMaterials)}
                </Text>
              </View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {dolarFormat(
                    activity.sumMaterials / Number(activity.exchange),
                  )}
                </Text>
              </View>
            </View>
          </>
        )}

        {labors.length > 0 && (
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
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Qty.`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
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
            {labors.map((labor, i) => {
              return (
                <View key={i} className="row flex left" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.name}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {`${labor.quantity}`}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
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
                        (labor.quantity * labor.cost) /
                          Number(activity.exchange),
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
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}></View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}></View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(calculateTotalCost(labors))}
                </Text>
              </View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(activity.sumLabors)}
                </Text>
              </View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {dolarFormat(activity.sumLabors / Number(activity.exchange))}
                </Text>
              </View>
            </View>
          </>
        )}

        {subcontracts?.length > 0 && (
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
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
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
            {subcontracts.map((labor, i) => {
              return (
                <View key={i} className="row flex left" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.name}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
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
                        (labor.quantity * labor.cost) /
                          Number(activity.exchange),
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
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}></View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(calculateTotalCost(subcontracts))}
                </Text>
              </View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(activity.sumSubcontracts)}
                </Text>
              </View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {dolarFormat(
                    activity.sumSubcontracts / Number(activity.exchange),
                  )}
                </Text>
              </View>
            </View>
          </>
        )}

        {others?.length > 0 && (
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
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
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
            {others.map((other, i) => {
              return (
                <View key={i} className="row flex left" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {other.name}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
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
                        (other.quantity * other.cost) /
                          Number(activity.exchange),
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
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}></View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(calculateTotalCost(others))}
                </Text>
              </View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(activity.sumOthers)}
                </Text>
              </View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {dolarFormat(activity.sumOthers / Number(activity.exchange))}
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

        {materials?.length > 0 && (
          <View className="row flex center" pdfMode={pdfMode}>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {`Materials`}
              </Text>
            </View>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {dolarFormat(activity.sumMaterials / Number(activity.exchange))}
              </Text>
            </View>
          </View>
        )}
        {labors?.length > 0 && (
          <View className="row flex center" pdfMode={pdfMode}>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {`Labors`}
              </Text>
            </View>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {dolarFormat(activity.sumLabors / Number(activity.exchange))}
              </Text>
            </View>
          </View>
        )}
        {subcontracts?.length > 0 && (
          <View className="row flex center" pdfMode={pdfMode}>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {`Subcontracts`}
              </Text>
            </View>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {dolarFormat(
                  activity.sumSubcontracts / Number(activity.exchange),
                )}
              </Text>
            </View>
          </View>
        )}
        {others?.length > 0 && (
          <View className="row flex center" pdfMode={pdfMode}>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {`Others Expenses`}
              </Text>
            </View>
            <View className="w-50 p-4-8 pb-10" pdfMode={pdfMode}>
              <Text className="dark" pdfMode={pdfMode}>
                {dolarFormat(activity.sumOthers / Number(activity.exchange))}
              </Text>
            </View>
          </View>
        )}

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
                <Text
                  pdfMode={pdfMode}
                >{`Admin Fee (${activity.adminFee}%)`}</Text>
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
      </Page>
    </Document>
  );
};

export default ExtraReport;
