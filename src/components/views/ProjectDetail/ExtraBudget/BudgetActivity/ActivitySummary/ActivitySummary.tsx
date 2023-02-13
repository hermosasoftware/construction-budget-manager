import React, { useEffect, useState } from 'react';
import { BagSimple, DotsThreeOutline, Handshake, Wall } from 'phosphor-react';
import { Divider } from '@chakra-ui/react';
import BigButton from '../../../../../common/BigButton/BigButton';
import { useAppSelector } from '../../../../../../redux/hooks';
import { IProjectBudget } from '../../../../../../types/projectBudget';
import { IBudgetActivity } from '../../../../../../types/budgetActivity';
import Stat from '../../../../../common/Stat/Stat';
import { colonFormat, dolarFormat } from '../../../../../../utils/numbers';

import styles from './ActivitySummary.module.css';

interface IActivitySummaryView {
  projectId: string;
  budget: IProjectBudget;
  activity: IBudgetActivity;
}

interface IBudgetTotals extends IBudgetActivity {
  totalDirectCost: number;
  adminFee: number;
  grandTotal: number;
}

const ActivitySummary: React.FC<IActivitySummaryView> = props => {
  const { budget, activity } = props;
  const [budgetTotals, setBudgetTotals] = useState<IBudgetTotals>();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const calcTotals = ({
    sumLabors,
    sumSubcontracts,
    sumMaterials,
  }: IBudgetActivity) => {
    const totalDirectCost = sumLabors + sumSubcontracts + sumMaterials;
    const adminFee = (totalDirectCost * Number(activity.adminFee)) / 100;
    const grandTotal = totalDirectCost + adminFee;
    return { totalDirectCost, adminFee, grandTotal };
  };

  useEffect(() => {
    setBudgetTotals({ ...activity, ...calcTotals(activity) });
  }, [activity]);

  return budgetTotals ? (
    <>
      <div className={`center-content ${styles.bigButtons_container}`}>
        <BigButton
          title={appStrings.materials}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumMaterials,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumMaterials / Number(activity.exchange),
          )}`}
          illustration={<Wall color="var(--chakra-colors-red-300)" size={25} />}
        />
        <BigButton
          title={appStrings.labors}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumLabors,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumLabors / Number(activity.exchange),
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
            budgetTotals.sumSubcontracts / Number(activity.exchange),
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
            budgetTotals.totalDirectCost / Number(activity.exchange),
          )}`}
        />
        <Stat
          title={`${appStrings.adminFee} ${activity.adminFee}%`}
          content={`${colonFormat(budgetTotals.adminFee)}\n${dolarFormat(
            budgetTotals.adminFee / Number(activity.exchange),
          )}`}
        />
        <Stat
          title={appStrings.grandTotal}
          content={`${colonFormat(budgetTotals.grandTotal)}\n${dolarFormat(
            budgetTotals.grandTotal / Number(activity.exchange),
          )}`}
        />
      </div>
    </>
  ) : null;
};

export default ActivitySummary;
