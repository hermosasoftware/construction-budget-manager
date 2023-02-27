import React, { useEffect, useState } from 'react';
import { BagSimple, DotsThreeOutline, Handshake, Wall } from 'phosphor-react';
import { Divider } from '@chakra-ui/react';
import BigButton from '../../../../common/BigButton/BigButton';
import { useAppSelector } from '../../../../../redux/hooks';
import { IProjectExtraBudget } from '../../../../../types/projectExtraBudget';
import { IBudgetActivity } from '../../../../../types/budgetActivity';
import Stat from '../../../../common/Stat/Stat';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetSummary.module.css';

interface IBudgetSummaryView {
  projectId: string;
  budget: IProjectExtraBudget;
  activityList: IBudgetActivity[];
}

interface IBudgetTotals extends IProjectExtraBudget {
  totalDirectCost: number;
  adminFee: number;
  grandTotal: number;
  sumMaterialsDolars: number;
  sumLaborsDolars: number;
  sumSubcontractsDolars: number;
  sumOthersDolars: number;
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
    sumOthers,
  }: IProjectExtraBudget) => {
    let adminFee = 0;
    let exchange = 0;
    let sumMaterialsDolars = 0;
    let sumLaborsDolars = 0;
    let sumSubcontractsDolars = 0;
    let sumOthersDolars = 0;
    let adminFeeDolars = 0;
    activityList.forEach(activity => {
      exchange = Number(activity.exchange);
      sumMaterialsDolars += activity.sumMaterials / exchange;
      sumLaborsDolars += activity.sumLabors / exchange;
      sumSubcontractsDolars += activity.sumSubcontracts / exchange;
      sumOthersDolars += activity.sumOthers / exchange;
      adminFeeDolars +=
        ((activity.sumMaterials / exchange +
          activity.sumLabors / exchange +
          activity.sumSubcontracts / exchange +
          activity.sumOthers / exchange) *
          Number(activity.adminFee)) /
        100;
      adminFee +=
        ((activity.sumLabors +
          activity.sumSubcontracts +
          activity.sumMaterials +
          activity.sumOthers) *
          Number(activity.adminFee)) /
        100;
    });
    const totalDirectCost =
      sumLabors + sumSubcontracts + sumMaterials + sumOthers;
    const totalDirectCostDolars =
      sumLaborsDolars +
      sumSubcontractsDolars +
      sumMaterialsDolars +
      sumOthersDolars;
    const grandTotal = totalDirectCost + adminFee;
    const grandTotalDolars = totalDirectCostDolars + adminFeeDolars;

    return {
      totalDirectCost,
      adminFee,
      grandTotal,
      sumMaterialsDolars,
      sumLaborsDolars,
      sumSubcontractsDolars,
      sumOthersDolars,
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
        <BigButton
          title={appStrings.others}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumOthers,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumOthersDolars,
          )}`}
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
