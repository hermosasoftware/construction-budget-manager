import React, { useEffect, useState } from 'react';
import { BagSimple, DotsThreeOutline, Handshake, Wall } from 'phosphor-react';
import { Divider } from '@chakra-ui/react';
import BigButton from '../../../../common/BigButton/BigButton';
import { useAppSelector } from '../../../../../redux/hooks';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Stat from '../../../../common/Stat/Stat';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './BudgetSummary.module.css';

interface IBudgetSummaryView {
  projectId: string;
  budget: IProjectBudget;
}

interface IBudgetTotals extends IProjectBudget {
  totalDirectCost: number;
  adminFee: number;
  grandTotal: number;
}

const BudgetSummary: React.FC<IBudgetSummaryView> = props => {
  const { budget } = props;
  const [budgetTotals, setBudgetTotals] = useState<IBudgetTotals>();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const calcTotals = ({
    sumLabors,
    sumSubcontracts,
    sumMaterials,
    sumOthers,
  }: IProjectBudget) => {
    const totalDirectCost =
      sumLabors + sumSubcontracts + sumMaterials + sumOthers;
    const adminFee = totalDirectCost * (budget.adminFee / 100);
    const grandTotal = totalDirectCost + adminFee;
    return { totalDirectCost, adminFee, grandTotal };
  };

  useEffect(() => {
    setBudgetTotals({ ...budget, ...calcTotals(budget) });
  }, [budget]);

  return budgetTotals ? (
    <>
      <div className={`center-content ${styles.bigButtons_container}`}>
        <BigButton
          title={appStrings.materials}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumMaterials,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumMaterials / budgetTotals.exchange,
          )}`}
          illustration={<Wall color="var(--chakra-colors-red-300)" size={25} />}
        />
        <BigButton
          title={appStrings.labors}
          description={`${appStrings.total}: ${colonFormat(
            budgetTotals.sumLabors,
          )}\n${appStrings.dollars}: ${dolarFormat(
            budgetTotals.sumLabors / budgetTotals.exchange,
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
            budgetTotals.sumSubcontracts / budgetTotals.exchange,
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
            budgetTotals.sumOthers / budgetTotals.exchange,
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
            budgetTotals.totalDirectCost / budgetTotals.exchange,
          )}`}
        />
        <Stat
          title={`${appStrings.adminFee} ${budget.adminFee}%`}
          content={`${colonFormat(budgetTotals.adminFee)}\n${dolarFormat(
            budgetTotals.adminFee / budgetTotals.exchange,
          )}`}
        />
        <Stat
          title={appStrings.grandTotal}
          content={`${colonFormat(budgetTotals.grandTotal)}\n${dolarFormat(
            budgetTotals.grandTotal / budgetTotals.exchange,
          )}`}
        />
      </div>
    </>
  ) : null;
};

export default BudgetSummary;
