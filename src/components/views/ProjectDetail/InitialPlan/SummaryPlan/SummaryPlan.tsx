import styles from './SummaryPlan.module.css';
import { BagSimple, DotsThreeOutline, Handshake, Wall } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import { Divider } from '@chakra-ui/react';
import BigButton from '../../../../common/BigButton/BigButton';
import { getProjectBudget } from '../../../../../services/ProjectBudgetService';
import { useAppSelector } from '../../../../../redux/hooks';
import { IProjectBudget } from '../../../../../types/projectBudget';
import Stat from '../../../../common/Stat/Stat';

interface ISummaryPlan {
  projectId: string;
}

interface IBudget extends IProjectBudget {
  totalDirectCost: number;
  adminFee: number;
  grandTotal: number;
}

const SummaryPlan: React.FC<ISummaryPlan> = props => {
  const { projectId } = props;
  const [budget, setBudget] = useState<IBudget>();
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
    let abortController = new AbortController();
    const getBudget = async () => {
      const successCallback = (response: IProjectBudget) =>
        setBudget({ ...response, ...calcTotals(response) });

      await getProjectBudget({ projectId, appStrings, successCallback });
    };
    getBudget();
    return () => {
      abortController.abort();
    };
  }, [projectId]);

  return budget ? (
    <>
      <div className={`center-content ${styles.bigButtons_container}`}>
        <BigButton
          title={appStrings.materials}
          description={`${
            appStrings.total
          }: ₡ ${budget.sumMaterials.toFixed()}\n${appStrings.dollars}: $ ${(
            budget.sumMaterials / budget.exchange
          ).toFixed()}`}
          illustration={<Wall color="var(--chakra-colors-red-300)" size={25} />}
        />
        <BigButton
          title={appStrings.labors}
          description={`${appStrings.total}: ₡ ${budget.sumLabors.toFixed()}\n${
            appStrings.dollars
          }: $ ${(budget.sumLabors / budget.exchange).toFixed()}`}
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
          description={`${
            appStrings.total
          }: ₡ ${budget.sumSubcontracts.toFixed()}\n${appStrings.dollars}: $ ${(
            budget.sumSubcontracts / budget.exchange
          ).toFixed()}`}
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
      <Divider marginTop={5}></Divider>
      <div className={`center-content ${styles.stats__container}`}>
        <Stat
          title={appStrings.totalDirectCost}
          content={`₡ ${budget.totalDirectCost.toFixed(2)}\n$ ${(
            budget.totalDirectCost / budget.exchange
          ).toFixed(2)}`}
        ></Stat>
        <Stat
          title={appStrings.adminFee}
          content={`₡ ${budget.adminFee.toFixed(2)}\n$ ${(
            budget.adminFee / budget.exchange
          ).toFixed(2)}`}
        ></Stat>
        <Stat
          title={appStrings.grandTotal}
          content={`₡ ${budget.grandTotal.toFixed(2)}\n$ ${(
            budget.grandTotal / budget.exchange
          ).toFixed(2)}`}
        ></Stat>
      </div>
    </>
  ) : null;
};

export default SummaryPlan;
