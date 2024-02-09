import { FC, Fragment, useEffect, useState } from 'react';
import { Image } from '@react-pdf/renderer';
import CotoLogo from '../../../assets/img/coto-logo.png';
import Document from '../../common/PDF/Document';
import Text from '../../common/PDF/Text';
import View from '../../common/PDF/View';
import Page from '../../common/PDF/Page';
import EditableTextarea from '../../common/PDF/EditableTextarea';
import { IProject } from '../../../types/project';
import { IProjectExpense } from '../../../types/projectExpense';
import { colonFormat, dolarFormat } from '../../../utils/numbers';

import styles from './ExpenseReport.module.css';

interface Props {
  project: IProject;
  expenses: IProjectExpense[];
  noteValue: string;
  setNoteValue: Function;
  pdfMode: boolean;
}

const BudgetReport: FC<Props> = props => {
  const { project, expenses, noteValue, setNoteValue, pdfMode } = props;
  const [subtotal, setSubtotal] = useState<number>(0);

  const handleInputChange = (value: string) => setNoteValue(value);

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
              {`Expenses Report`}
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
                <Text pdfMode={pdfMode}>{colonFormat(0)}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`DATE:`}
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {!!expenses?.length && (
          <>
            <View className="mt-30" pdfMode={pdfMode}>
              <Text className="fs-20 left bold" pdfMode={pdfMode}>
                {`Expenses`}
              </Text>
              <View className="bg-dark flex left" pdfMode={pdfMode}>
                <View className="w-48 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Description`}
                  </Text>
                </View>
                <View className="w-10 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Doc Number`}
                  </Text>
                </View>
                <View className="w-10 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Date`}
                  </Text>
                </View>
                <View className="w-20 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {` Owner`}
                  </Text>
                </View>
                <View className="w-10 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Work`}
                  </Text>
                </View>
                <View className="w-10 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Family`}
                  </Text>
                </View>
                <View className="w-20 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Amount`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Dollars`}
                  </Text>
                </View>
              </View>
            </View>
            {expenses.map((labor, i) => {
              return (
                <View key={i} className="row flex left" pdfMode={pdfMode}>
                  <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.name}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {`${labor.docNumber}`}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.date.toLocaleString()}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.owner}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.work}
                    </Text>
                  </View>
                  <View className="w-10 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.family}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {colonFormat(labor.amount)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(labor.amount / labor.exchange)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View className="mt-40" pdfMode={pdfMode}>
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
              <View className="flex bg-gray p-5" pdfMode={pdfMode}>
                <View className="w-50 p-5" pdfMode={pdfMode}>
                  <Text className="bold" pdfMode={pdfMode}>
                    {`TOTAL`}
                  </Text>
                </View>
                <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                  <Text className="dark bold right ml-30" pdfMode={pdfMode}>
                    {dolarFormat(subtotal)}
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
