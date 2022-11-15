import React, { useEffect, useState } from 'react';
import { BagSimple, DotsThreeOutline, Handshake, Wall } from 'phosphor-react';
import { Divider } from '@chakra-ui/react';
import BigButton from '../../../../common/BigButton/BigButton';
import { useAppSelector } from '../../../../../redux/hooks';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Stat from '../../../../common/Stat/Stat';
import { colonFormat, dolarFormat } from '../../../../../utils/numbers';

import styles from './SummaryPlan.module.css';

interface ISummaryPlan {
  projectId: string;
  budget: IProjectBudget;
}

interface IBudgetTotals extends IProjectBudget {
  totalDirectCost: number;
  adminFee: number;
  grandTotal: number;
}

const SummaryPlan: React.FC<ISummaryPlan> = props => {
  const { budget } = props;
  const [budgetTotals, setBudgetTotals] = useState<IBudgetTotals>();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const calcTotals = ({
    sumLabors,
    sumSubcontracts,
    sumMaterials,
  }: IProjectBudget) => {
    const totalDirectCost = sumLabors + sumSubcontracts + sumMaterials;
    const adminFee = totalDirectCost * 0.12;
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
            budgetTotals.totalDirectCost / budgetTotals.exchange,
          )}`}
        />
        <Stat
          title={appStrings.adminFee}
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

export default SummaryPlan;
