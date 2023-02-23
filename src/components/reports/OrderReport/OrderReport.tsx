import { FC, useEffect, useState } from 'react';
import { Image } from '@react-pdf/renderer';
import CotoLogo from '../../../assets/img/coto-logo.png';
import Document from '../../../components/common/PDF/Document';
import Text from '../../../components/common/PDF/Text';
import View from '../../../components/common/PDF/View';
import Page from '../../../components/common/PDF/Page';
import EditableTextarea from '../../common/PDF/EditableTextarea';
import { IProjectOrder } from '../../../types/projectOrder';
import { IProject } from '../../../types/project';
import { colonFormat } from '../../../utils/numbers';

import styles from './OrderReport.module.css';

interface Props {
  order: IProjectOrder;
  project: IProject;
  noteValue: string;
  setNoteValue: Function;
  pdfMode: boolean;
}

const OrderReport: FC<Props> = props => {
  const { project, order, noteValue, setNoteValue, pdfMode } = props;
  const [subTotal, setSubTotal] = useState<number>(0);
  const [saleTax, setSaleTax] = useState<number>(0);

  const handleInputChange = (value: string) => setNoteValue(value);

  const calSaleTax = () => {
    let tax = 0;
    order.products.forEach(e => {
      tax += ((e.cost * e.quantity) / 100) * e.tax;
    });
    setSaleTax(tax);
  };

  useEffect(() => {
    let subTotal = 0;

    order.products.forEach(product => {
      const quantityNumber = product.quantity;
      const rateNumber = product.cost;
      const amount =
        quantityNumber && rateNumber ? quantityNumber * rateNumber : 0;

      subTotal += amount;
    });

    setSubTotal(subTotal);
  }, [order.products]);

  useEffect(() => calSaleTax(), [subTotal]);

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
              ORDEN DE COMPRA DE PRODUCTOS
            </Text>
          </View>
        </View>

        <View className=" left flex mt-40" pdfMode={pdfMode}>
          <View className="w-55" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  Orden de compra:
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{order.order.toString()}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  Proforma:
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{order.proforma.toString()}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  Proyecto:
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{project.name}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  Actividad:
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{order.activity}</Text>
              </View>
            </View>
          </View>
          <View className="w-45" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  Fecha:
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>{order.date.toLocaleDateString()}</Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-40" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  Entrega:
                </Text>
              </View>
              <View className="w-60" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>
                  {order.deliverDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-30 bg-dark flex left" pdfMode={pdfMode}>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <Text className="white bold" pdfMode={pdfMode}>
              Descripción
            </Text>
          </View>
          <View className="w-15 p-4-8" pdfMode={pdfMode}>
            <Text className="white bold" pdfMode={pdfMode}>
              Cant.
            </Text>
          </View>
          <View className="w-20 p-4-8" pdfMode={pdfMode}>
            <Text className="white bold" pdfMode={pdfMode}>
              P. Unitario
            </Text>
          </View>
          <View className="w-15 p-4-8" pdfMode={pdfMode}>
            <Text className="white bold" pdfMode={pdfMode}>
              Imp.
            </Text>
          </View>
          <View className="w-20 p-4-8" pdfMode={pdfMode}>
            <Text className="white bold" pdfMode={pdfMode}>
              Subtotal
            </Text>
          </View>
        </View>

        {order.products.map((product, i) => {
          return pdfMode && product.description === '' ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex left" pdfMode={pdfMode}>
              <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {product.description}
                </Text>
              </View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {product.quantity.toString()}
                </Text>
              </View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(product.cost)}
                </Text>
              </View>
              <View className="w-15 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {product.tax === 0 ? 'Exento' : `${product.tax}%`}
                </Text>
              </View>
              <View className="w-20 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark" pdfMode={pdfMode}>
                  {colonFormat(product.quantity * product.cost)}
                </Text>
              </View>
            </View>
          );
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            <Text className="left fs-20 w-100" pdfMode={pdfMode}>
              Notas:
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
                  {colonFormat(subTotal)}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text pdfMode={pdfMode}>IVA</Text>
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {colonFormat(saleTax)}
                </Text>
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="bold" pdfMode={pdfMode}>
                  TOTAL
                </Text>
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <Text className="dark bold right ml-30" pdfMode={pdfMode}>
                  {colonFormat(subTotal + saleTax)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default OrderReport;
