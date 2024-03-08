import { FC, useEffect, useState } from 'react';
import { Image } from '@react-pdf/renderer';
import CotoLogo from '../../../assets/img/coto-logo.png';
import Document from '../../common/PDF/Document';
import Text from '../../common/PDF/Text';
import View from '../../common/PDF/View';
import Page from '../../common/PDF/Page';
import EditableTextarea from '../../common/PDF/EditableTextarea';
import { IProject } from '../../../types/project';
import { IProjectComparative } from '../../../types/projectComparative';
import { colonFormat, dolarFormat } from '../../../utils/numbers';
import { formatDate } from '../../../utils/dates';

import styles from './ComparativeReportPDF.module.css';

interface Props {
  project: IProject;
  comparatives: IProjectComparative[];
  noteValue: string;
  setNoteValue: Function;
  pdfMode: boolean;
}

const ComparativeReportPDF: FC<Props> = props => {
  const { project, comparatives, noteValue, setNoteValue, pdfMode } = props;
  const [subtotalColones, setSubtotalColones] = useState<number>(0);
  const [subtotalDollars, setSubtotalDollars] = useState<number>(0);

  const handleInputChange = (value: string) => setNoteValue(value);

  const calculateTotalCost = (array: any[], type?: string) => {
    let total = 0;
    array.forEach(
      row => (total += row?.amount / (type === 'dollars' ? row?.exchange : 1)),
    );

    return total;
  };

  useEffect(() => {
    setSubtotalColones(calculateTotalCost(comparatives));
    setSubtotalDollars(calculateTotalCost(comparatives, 'dollars'));
  }, []);

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
              {`Comparative Report`}
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
          </View>
          <View className="w-45" pdfMode={pdfMode}>
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

        {!!comparatives?.length && (
          <>
            <View className="mt-30" pdfMode={pdfMode}>
              <Text className="fs-20 left bold" pdfMode={pdfMode}>
                {`Activities`}
              </Text>
              <View className="bg-dark flex left" pdfMode={pdfMode}>
                <View className="w-20 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Activity`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Budget`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Advance`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Advance Amount`}
                  </Text>
                </View>
                <View className="w-20 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Accounting`}
                  </Text>
                </View>
                <View className="w-15 p-4-8" pdfMode={pdfMode}>
                  <Text className="white bold" pdfMode={pdfMode}>
                    {`Difference`}
                  </Text>
                </View>
              </View>
            </View>
            {comparatives.map((labor, i) => {
              return (
                <View key={i} className="row flex left" pdfMode={pdfMode}>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {labor.activity}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(labor.budget)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {formatDate(new Date(labor.advance), 'MM/DD/YYYY')}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(labor.advanceAmount)}
                    </Text>
                  </View>
                  <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(labor.accounting)}
                    </Text>
                  </View>
                  <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                    <Text className="dark" pdfMode={pdfMode}>
                      {dolarFormat(labor.difference)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
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
                <Text pdfMode={pdfMode}>Bueget </Text>
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {colonFormat(subtotalColones)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>Advance amount </Text>
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {colonFormat(subtotalColones)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>Accounting </Text>
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {colonFormat(subtotalColones)}
                </Text>
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  {`Difference`}
                </Text>
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <Text className="dark bold right ml-30" pdfMode={pdfMode}>
                  {dolarFormat(subtotalDollars)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ComparativeReportPDF;
