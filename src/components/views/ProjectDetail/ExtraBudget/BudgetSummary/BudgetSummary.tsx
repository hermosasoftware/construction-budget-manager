import React, { useEffect, useState } from 'react';
import { BagSimple, DotsThreeOutline, Handshake, Wall } from 'phosphor-react';
import { Divider } from '@chakra-ui/react';
import BigButton from '../../../../common/BigButton/BigButton';
import { useAppSelector } from '../../../../../redux/hooks';
import { IProjectBudget } from '../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Stat from '../../../../common/Stat/Stat';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetSummary.module.css';

interface IBudgetSummaryView {
  projectId: string;
  budget: IProjectBudget;
  activityList: IBudgetActivity[];
}

interface IBudgetTotals extends IProjectBudget {
  totalDirectCost: number;
  adminFee: number;
  grandTotal: number;
  sumMaterialsDolars: number;
  sumLaborsDolars: number;
  sumSubcontractsDolars: number;
  totalDirectCostDolars: number;
  adminFeeDolars: number;
  grandTotalDolars: number;
}

const BudgetSummary: React.FC<IBudgetSummaryView> = props => {
  const { budget, activityList } = props;
  const [budgetTotals, setBudgetTotals] = useState<IBudgetTotals>();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const calcTotals = ({
    sumLabors,
    sumSubcontracts,
    sumMaterials,
  }: IProjectBudget) => {
    let adminFee = 0;
    let sumMaterialsDolars = 0;
    let sumLaborsDolars = 0;
    let sumSubcontractsDolars = 0;
    let adminFeeDolars = 0;
    activityList.forEach(activity => {
      sumMaterialsDolars += activity.sumMaterials / Number(activity.exchange);
      sumLaborsDolars += activity.sumLabors / Number(activity.exchange);
      sumSubcontractsDolars +=
        activity.sumSubcontracts / Number(activity.exchange);
      adminFeeDolars +=
        ((sumMaterialsDolars + sumLaborsDolars + sumSubcontractsDolars) *
          Number(activity.adminFee)) /
        100;
      adminFee +=
        ((sumLabors + sumSubcontracts + sumMaterials) *
          Number(activity.adminFee)) /
        100;
    });
    const totalDirectCost = sumLabors + sumSubcontracts + sumMaterials;
    const totalDirectCostDolars =
      sumLaborsDolars + sumSubcontractsDolars + sumMaterialsDolars;
    const grandTotal = totalDirectCost + adminFee;
    const grandTotalDolars = totalDirectCostDolars + adminFeeDolars;

    return {
      totalDirectCost,
      adminFee,
      grandTotal,
      sumMaterialsDolars,
      sumLaborsDolars,
      sumSubcontractsDolars,
      totalDirectCostDolars,
      adminFeeDolars,
      grandTotalDolars,
    };
  };

  useEffect(() => {
    setBudgetTotals({ ...budget, ...calcTotals(budget) });
  }, [budget, activityList]);

  return budgetTotals ? (
    <>
      <div className={`center-content ${styles.bigButtons_container}`}>
        <BigButton
          title={appStrings.materials}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumMaterials,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumMaterialsDolars,
          )}`}
          illustration={<Wall color="var(--chakra-colors-red-300)" size={25} />}
        />
        <BigButton
          title={appStrings.labors}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumLabors,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumLaborsDolars,
          )}`}
          illustration={
            <BagSimple
              color="var(--chakra-colors-teal-500)"
              size={25}
              weight="fill"
            />
          }
        />
        <BigButton
          title={appStrings.subcontracts}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumSubcontracts,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumSubcontractsDolars,
          )}`}
          illustration={
            <Handshake
              color="var(--chakra-colors-blue-400)"
              size={25}
              weight="fill"
            />
          }
        />
        {/* TODO */}
        <BigButton
          title={`${appStrings.others} (IN PROGRESS)`}
          description={`${appStrings.total}: ₡ 0.00\n${appStrings.dollars}: $ 0.00`}
          illustration={
            <DotsThreeOutline
              color="var(--chakra-colors-purple-500)"
              size={25}
              weight="fill"
            />
          }
        />
      </div>
      <Divider marginTop={5} />
      <div className={`center-content ${styles.stats__container}`}>
        <Stat
          title={appStrings.totalDirectCost}
          content={`${colonFormat(budgetTotals.totalDirectCost)}\n${dolarFormat(
            budgetTotals.totalDirectCostDolars,
          )}`}
        />
        <Stat
          title={appStrings.adminFee}
          content={`${colonFormat(budgetTotals.adminFee)}\n${dolarFormat(
            budgetTotals.adminFeeDolars,
          )}`}
        />
        <Stat
          title={appStrings.grandTotal}
          content={`${colonFormat(budgetTotals.grandTotal)}\n${dolarFormat(
            budgetTotals.grandTotalDolars,
          )}`}
        />
      </div>
    </>
  ) : null;
};

export default BudgetSummary;
