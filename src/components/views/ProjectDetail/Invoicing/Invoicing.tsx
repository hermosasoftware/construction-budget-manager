import { Box, Flex, FormLabel, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { FilePdf, UploadSimple } from 'phosphor-react';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import SearchInput from '../../../common/SearchInput/SearchInput';
import Form, { DatePicker, Input } from '../../../common/Form';
import AlertDialog from '../../../common/AlertDialog/AlertDialog';
import {
  addInvoiceProduct,
  createProjectInvoiceDetail,
  createProjectInvoiceDetailAndProducts,
  deleteInvoiceProduct,
  deleteProjectInvoiceDetail,
  updateInvoiceProduct,
  updateProjectInvoiceDetail,
} from '../../../../services/ProjectInvoiceService';
import {
  IInvoiceProduct,
  IProjectInvoiceDetail,
} from '../../../../types/projectInvoiceDetail';
import { IActivity } from '../../../../types/activity';
import { useAppSelector } from '../../../../redux/hooks';
import SearchSelect from '../../../common/Form/Elements/SearchSelect';
import { formatDate } from '../../../../utils/dates';
import { IOrderProduct, IProjectOrder } from '../../../../types/projectOrder';
import InvoiceTableView from '../../../layout/InvoiceTableView';
import { TTableHeader } from '../../../layout/InvoiceTableView/InvoiceTableView';
import FileUploader, {
  EFileTypes,
} from '../../../common/FileUploader/FileUploader';

import styles from './Invoicing.module.css';
import { xml2json } from '../../../../utils/xml2json';
interface IInvoicing {
  projectId: string;
}

const initialSelectedItemData = {
  id: '',
  order: 0,
  activity: '',
  invoice: '',
  date: new Date(),
  products: [],
  option: { value: '', label: '' },
  pdfURL: '',
  pdfFile: undefined,
  updatedAt: new Date(),
};

const initialXMLData = {
  option: { value: '', label: '' },
  activity: '',
  xmlFile: undefined,
};

const initialSelectedOrderData = {
  id: '',
  order: 1,
  proforma: '',
  date: new Date(),
  deliverDate: new Date(),
  activity: '',
  sentStatus: false,
  cost: 0,
  products: [],
  option: { value: '', label: '' },
  updatedAt: new Date(),
};

const initialSelectedProductData = {
  id: '',
  quantity: 1,
  description: { value: '', label: '' },
  tax: 0,
  cost: 0,
};

interface IInvoiceOrderDetail extends IProjectOrder {
  option: { value: string; label: string };
}

interface IInvoice extends IProjectInvoiceDetail {
  option: { value: string; label: string };
}

interface IXMLFile {
  option: { value: string; label: string };
  activity: string;
  xmlFile?: File;
}

interface IInvProd extends Omit<IInvoiceProduct, 'description'> {
  description: { value: string; label: string };
}

const Invoicing: React.FC<IInvoicing> = props => {
  const [selectedItem, setSelectedItem] = useState<IInvoice>(
    initialSelectedItemData,
  );
  const [xmlItem, setXMLItem] = useState<IXMLFile>(initialXMLData);
  const [selectedOrder, setSelectedOrder] = useState<IInvoiceOrderDetail>(
    initialSelectedOrderData,
  );
  const [selectedProduct, setSelectedProduct] = useState<IInvProd>(
    initialSelectedProductData,
  );
  const [isProductAlertDialogOpen, setIsProductAlertDialogOpen] =
    useState(false);

  const [allActivities, setAllActivities] = useState<IActivity[]>([]);

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isXMLModalOpen, setIsXMLModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projectId } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const projectInvoices = useAppSelector(
    state => state.projectInvoices.projectInvoices,
  );
  const orders = useAppSelector(state => state.projectOrders.projectOrders);
  const budgetActivities = useAppSelector(
    state => state.budgetActivities.budgetActivities,
  );
  const extraActivities = useAppSelector(
    state => state.extraActivities.extraActivities,
  );

  const tableHeader: TTableHeader[] = [
    { name: 'invoice', value: appStrings.invoice },
    { name: 'order', value: appStrings.order },
    { name: 'date', value: appStrings.date },
    { name: 'activity', value: appStrings.activity },
    { name: 'description', value: appStrings.description },
    { name: 'quantity', value: appStrings.quantity },
    { name: 'cost', value: appStrings.cost },
    { name: 'subtotal', value: appStrings.subtotal, isGreen: true },
    { name: 'imp', value: appStrings.imp, isGreen: true },
    { name: 'total', value: appStrings.total, isGreen: true },
  ];

  const formatTableData = () =>
    projectInvoices.map(data => ({
      ...data,
      date: formatDate(new Date(data.date), 'MM/DD/YYYY'),
    }));

  const handleSearch = async (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const getActivityById = (id?: string): IActivity =>
    allActivities.find(e => e.id === id)!;

  const editButton = async (projectInvoiceDetailId: string) => {
    const invoice = projectInvoices.find(e => e.id === projectInvoiceDetailId);
    const order = orders.find(e => e.order === invoice?.order);
    if (order) {
      const { id, ...rest } = order;
      const option = { value: id, label: String(order.order) };
      setSelectedOrder({
        ...selectedOrder,
        ...rest,
        id,
        option,
      });
      setSelectedItem({
        ...invoice!,
        date: new Date(invoice!.date),
        option,
      });
    }

    setIsModalOpen(true);
  };

  const deleteButton = async () => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setIsAlertDialogOpen(false);
    };
    await deleteProjectInvoiceDetail({
      projectId,
      projectInvoiceDetailId: selectedItem.id,
      appStrings,
      successCallback,
    });
  };

  const handleOnSubmit = async (projectInvoiceDetail: IInvoice) => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setIsModalOpen(false);
    };
    const { option, ...rest } = projectInvoiceDetail;
    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...rest,
        order: +option.label,
      },
      appStrings,
      successCallback,
    };
    projectInvoiceDetail.id
      ? await updateProjectInvoiceDetail(serviceCallParameters)
      : await createProjectInvoiceDetail(serviceCallParameters);
  };

  const addProduct = async (invoiceId: string) => {
    const item = projectInvoices.find(m => m.id === invoiceId) as IInvoice;
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const editProduct = async (orderId: string, productId: string) => {
    const product = projectInvoices
      .find(m => m?.id === orderId)
      ?.products?.find(s => s.id === productId);
    if (product) {
      const item = projectInvoices.find(m => m.id === orderId) as IInvoice;
      setSelectedItem(item);
      setSelectedProduct({
        ...product,
        description: { value: product.id, label: product.description },
      });
      setIsDetailModalOpen(true);
    }
  };

  const delProduct = async (invoiceId: string, productId: string) => {
    setSelectedItem({ ...selectedItem, id: invoiceId });
    setSelectedProduct({
      ...selectedProduct,
      id: productId,
    });
    setIsProductAlertDialogOpen(true);
  };

  const onSubmitProduct = async (data: IInvProd) => {
    const product = {
      ...data,
      description: data.description.label,
      quantity: +data.quantity,
      cost: +data.cost,
      tax: +data.tax,
    };
    const successAddCallback = () => {
      setSelectedProduct(initialSelectedProductData);
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setIsDetailModalOpen(false);
    };

    const successUpdateCallback = () => {
      setSelectedProduct(initialSelectedProductData);
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setIsDetailModalOpen(false);
    };
    const serviceCallParameters = {
      projectId,
      invoiceId: selectedItem?.id,
      product,
      appStrings,
      successCallback: !product.id ? successAddCallback : successUpdateCallback,
    };
    !product.id
      ? await addInvoiceProduct(serviceCallParameters)
      : await updateInvoiceProduct(serviceCallParameters);
  };

  const deleteProduct = async () => {
    const successCallback = () => {
      setSelectedItem(initialSelectedItemData);
      setSelectedOrder(initialSelectedOrderData);
      setSelectedProduct(initialSelectedProductData);
      setIsProductAlertDialogOpen(false);
    };
    await deleteInvoiceProduct({
      projectId,
      projectInvoiceId: selectedItem.id,
      invoiceProductId: selectedProduct.id,
      appStrings,
      successCallback,
    });
  };

  const validationSchema = yup.object().shape({
    option: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    invoice: yup.string().required(appStrings?.requiredField),
    activity: yup.string().required(appStrings?.requiredField),
  });
  const productValSchema = yup.object().shape({
    description: yup.object().shape({
      value: yup.string().required(appStrings?.requiredField),
      label: yup.string().required(appStrings?.requiredField),
    }),
    quantity: yup.string().required(appStrings?.requiredField),
    cost: yup.string().required(appStrings?.requiredField),
    tax: yup.number().min(0).max(100).required(appStrings.required),
  });

  const handleSearchSelect = (v: any) => {
    const order = orders.find(e => e.id === v);
    if (order) {
      const { id, ...rest } = order;
      const option = { value: order.id, label: String(order.order) };
      const orderActivity = getActivityById(rest.activity);
      setSelectedOrder({
        ...selectedOrder,
        ...rest,
        option,
      });
      setSelectedItem({
        ...selectedItem,
        option,
        activity: orderActivity.activity,
      });
      setXMLItem({
        ...xmlItem,
        option,
        activity: orderActivity.activity,
      });
    }
  };

  const handleSearchProduct = (v: any) => {
    const products: IOrderProduct[] = [];
    orders.forEach(e => {
      products.push(...e.products);
    });
    const product = products.find(e => e.id === v);
    if (product) {
      const { id, ...rest } = product;
      const description = {
        value: product.id,
        label: String(product.description),
      };
      setSelectedProduct({
        ...selectedProduct,
        ...rest,
        description,
      });
    }
  };

  const getOrdersProducts = (invoice: IInvoice) => {
    const products: IOrderProduct[] = [];
    orders
      .filter(e => e.order === invoice.order)
      .forEach(e => {
        products.push(...e.products);
      });
    const filterIsUsed = (e: IOrderProduct) => {
      const isUsed = invoice.products?.some(p => {
        return p.description === e.description;
      });
      return !isUsed;
    };
    return products
      .filter(filterIsUsed)
      .map(e => ({ value: e.id, label: e.description }));
  };

  const ProductSearchSelect = () => {
    const options = getOrdersProducts(selectedItem);
    const hasNoProducts = !options?.length;
    return (
      <SearchSelect
        name="description"
        label={appStrings.product}
        placeholder={appStrings.product}
        helperText={
          hasNoProducts && !selectedProduct.id ? appStrings.noProducts : ''
        }
        isDisabled={!!selectedProduct.id || hasNoProducts}
        options={options}
        value={selectedProduct.description}
        onChange={item => {
          handleSearchProduct(item?.value?.value);
        }}
      />
    );
  };

  useEffect(() => {
    const extrasAct = extraActivities.map(activity => ({
      ...activity,
      isExtra: true,
    }));
    setAllActivities([...budgetActivities, ...extrasAct]);
  }, [budgetActivities, extraActivities]);

  // const xml = `<?xml version="1.0" encoding="utf-8"?><FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica"><Clave>50629042300310152289900100001010000226268170688835</Clave><CodigoActividad>523402</CodigoActividad><NumeroConsecutivo>00100001010000226268</NumeroConsecutivo><FechaEmision>2023-04-29T12:45:28-06:00</FechaEmision><Emisor><Nombre>IMPORTACIONES MORPA SUREnO SOCIEDAD ANONIMA</Nombre><Identificacion><Tipo>02</Tipo><Numero>3101522899</Numero></Identificacion><NombreComercial>FERRETERIA IGUANA VERDE</NombreComercial><Ubicacion><Provincia>6</Provincia><Canton>05</Canton><Distrito>04</Distrito><OtrasSenas>DEL PUENTE SOBRE RIO UVITA, 200 METROS SUR</OtrasSenas></Ubicacion><Telefono><CodigoPais>506</CodigoPais><NumTelefono>27438929</NumTelefono></Telefono><CorreoElectronico>FacturaElectronica@FerreteriaIguanaVerde.com</CorreoElectronico></Emisor><Receptor><Nombre>ADRIAN ALBERTO COTO CERDAS</Nombre><Identificacion><Tipo>01</Tipo><Numero>303620115</Numero></Identificacion><NombreComercial>COTO BROTHERS COMPANY SA</NombreComercial><Telefono><CodigoPais>506</CodigoPais><NumTelefono>88729766</NumTelefono></Telefono><CorreoElectronico>acoto@cotocompany.com</CorreoElectronico></Receptor><CondicionVenta>02</CondicionVenta><PlazoCredito>30</PlazoCredito><MedioPago>01</MedioPago><DetalleServicio><LineaDetalle><NumeroLinea>1</NumeroLinea><Codigo>3632098010100</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128388</Codigo></CodigoComercial><Cantidad>100</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC CURVA CONDUIT TIPO A   12MM  1/2"   UL GR CAM/CEM</Detalle><PrecioUnitario>907.07965</PrecioUnitario><MontoTotal>90707.9646</MontoTotal><Descuento><MontoDescuento>36283.18584</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>54424.77876</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>7075.22124</Monto></Impuesto><ImpuestoNeto>7075.22124</ImpuestoNeto><MontoTotalLinea>61500</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>2</NumeroLinea><Codigo>3632098010100</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128412</Codigo></CodigoComercial><Cantidad>80</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC UNION CONDUIT TIPO A 12MM 1/2" UL</Detalle><PrecioUnitario>221.23894</PrecioUnitario><MontoTotal>17699.11505</MontoTotal><Descuento><MontoDescuento>7079.64602</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>10619.46903</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>1380.53097</Monto></Impuesto><ImpuestoNeto>1380.53097</ImpuestoNeto><MontoTotalLinea>12000</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>3</NumeroLinea><Codigo>3632098010100</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128405</Codigo></CodigoComercial><Cantidad>100</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC CONECTOR MACHO CONDUIT TIPO A 12MM  1/2" UL GR</Detalle><PrecioUnitario>287.61062</PrecioUnitario><MontoTotal>28761.06195</MontoTotal><Descuento><MontoDescuento>11504.42478</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>17256.63717</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>2243.36283</Monto></Impuesto><ImpuestoNeto>2243.36283</ImpuestoNeto><MontoTotalLinea>19500</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>4</NumeroLinea><Codigo>3632098010100</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128367</Codigo></CodigoComercial><Cantidad>20</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC CURVA CONDUIT TIPO A   18MM  3/4"   UL GR CAM/CEM</Detalle><PrecioUnitario>1128.31858</PrecioUnitario><MontoTotal>22566.37168</MontoTotal><Descuento><MontoDescuento>9026.54867</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>13539.82301</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>1760.17699</Monto></Impuesto><ImpuestoNeto>1760.17699</ImpuestoNeto><MontoTotalLinea>15300</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>5</NumeroLinea><Codigo>3632098010100</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128619</Codigo></CodigoComercial><Cantidad>20</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC UNION CONDUIT TIPO A 18MM 3/4"      UL GR CAM/CEM</Detalle><PrecioUnitario>309.73451</PrecioUnitario><MontoTotal>6194.69027</MontoTotal><Descuento><MontoDescuento>2477.87611</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>3716.81416</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>483.18584</Monto></Impuesto><ImpuestoNeto>483.18584</ImpuestoNeto><MontoTotalLinea>4200</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>6</NumeroLinea><Codigo>3632098010100</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128406</Codigo></CodigoComercial><Cantidad>30</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC CONECTOR MACHO  CONDUIT TIPO A 18MM  3/4"  UL GR</Detalle><PrecioUnitario>353.9823</PrecioUnitario><MontoTotal>10619.46903</MontoTotal><Descuento><MontoDescuento>4247.78761</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>6371.68142</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>828.31858</Monto></Impuesto><ImpuestoNeto>828.31858</ImpuestoNeto><MontoTotalLinea>7200</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>7</NumeroLinea><Codigo>2731001000200</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>120487</Codigo></CodigoComercial><Cantidad>1</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>MECATE BANANERO ROLLO 1 KG BLANC/NEGRO (CORD. MULTIUSO)</Detalle><PrecioUnitario>3747.67739</PrecioUnitario><MontoTotal>3747.67739</MontoTotal><Descuento><MontoDescuento>374.76774</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>3372.90965</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>438.47825</Monto></Impuesto><ImpuestoNeto>438.47825</ImpuestoNeto><MontoTotalLinea>3811.3879</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>8</NumeroLinea><Codigo>3341000000200</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>121525</Codigo></CodigoComercial><Cantidad>2</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>ENVASE DE GAS 1/4 VUELTA JUMBO STAR</Detalle><PrecioUnitario>2369.99999</PrecioUnitario><MontoTotal>4739.99998</MontoTotal><Descuento><MontoDescuento>474</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>4265.99998</SubTotal><ImpuestoNeto>0</ImpuestoNeto><MontoTotalLinea>4265.99998</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>9</NumeroLinea><Codigo>3632002039900</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128378</Codigo></CodigoComercial><Cantidad>100</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC TUBO CONDUIT TIPO A   12MM    1/2" X 3M UL GR CAM/CEM</Detalle><PrecioUnitario>2345.13274</PrecioUnitario><MontoTotal>234513.27434</MontoTotal><Descuento><MontoDescuento>93805.30973</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>140707.96461</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>18292.0354</Monto></Impuesto><ImpuestoNeto>18292.0354</ImpuestoNeto><MontoTotalLinea>159000.00001</MontoTotalLinea></LineaDetalle><LineaDetalle><NumeroLinea>10</NumeroLinea><Codigo>3632002039900</Codigo><CodigoComercial><Tipo>04</Tipo><Codigo>128365</Codigo></CodigoComercial><Cantidad>40</Cantidad><UnidadMedida>Unid</UnidadMedida><Detalle>PVC TUBO CONDUIT TIPO A   18MM    3/4" X 3M UL GR CAM/CEM</Detalle><PrecioUnitario>3495.57521</PrecioUnitario><MontoTotal>139823.0085</MontoTotal><Descuento><MontoDescuento>55929.2034</MontoDescuento><NaturalezaDescuento>Descuento acordado</NaturalezaDescuento></Descuento><SubTotal>83893.8051</SubTotal><Impuesto><Codigo>01</Codigo><CodigoTarifa>08</CodigoTarifa><Tarifa>13</Tarifa><Monto>10906.19466</Monto></Impuesto><ImpuestoNeto>10906.19466</ImpuestoNeto><MontoTotalLinea>94799.99976</MontoTotalLinea></LineaDetalle></DetalleServicio><ResumenFactura><CodigoTipoMoneda><CodigoMoneda>CRC</CodigoMoneda><TipoCambio>1</TipoCambio></CodigoTipoMoneda><TotalServGravados>0</TotalServGravados><TotalServExentos>0</TotalServExentos><TotalServExonerado>0</TotalServExonerado><TotalMercanciasGravadas>554632.63281</TotalMercanciasGravadas><TotalMercanciasExentas>4739.99998</TotalMercanciasExentas><TotalMercExonerada>0</TotalMercExonerada><TotalGravado>554632.63281</TotalGravado><TotalExento>4739.99998</TotalExento><TotalExonerado>0</TotalExonerado><TotalVenta>559372.63279</TotalVenta><TotalDescuentos>221202.7499</TotalDescuentos><TotalVentaNeta>338169.88289</TotalVentaNeta><TotalImpuesto>43407.50476</TotalImpuesto><TotalComprobante>381577.38765</TotalComprobante></ResumenFactura><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="Signature-544554981"><ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference Id="Ref1" URI=""><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>6mD2B3vlmTOT2QdUiWiX/7nzsqxZ4B+T/UV6zWUdwTQ=</ds:DigestValue></ds:Reference><ds:Reference URI="#Certificate1"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>FoKjMAzBLVG10cjT5eTMaY6YdPWV6fXI4R098c12yVM=</ds:DigestValue></ds:Reference><ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#SignedProperties-625156527"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>Yr5tL42ypA8DYLEm1oRWP4fI5eDG/vW296sl6TVsmUY=</ds:DigestValue></ds:Reference></ds:SignedInfo><ds:SignatureValue>GexQ11do4dy+/PujaPu8u33OTErNTpop01UQen0nJJESoz6pqGTPPozRwUDis7fxI1+egVoD5Oxgqzh6iGcV2seoJpfs9Y8hqboK1cCsFndf5uP3PEsydJqciVZt/90tNuyzmPVTILZ2yrE6LtNqKJFTEXVhmKm1Yy2ujsg1JriF+FBOmNNLb5xOnxuvj8u3+5rtKZEUZXwNZtrNnQdyFROfX4XNwNGFEPUCk0q4HtOlqjNbFg+KWqiKrXnupoZxJQKBmYpE0uZWYO/rsHfaO9Gd0r/wEuS6/Ai2TY1T4AuVRt6dIaR9+7FpDPVlTCliYN6BeYPwtuhoUTBWkr8PZg==</ds:SignatureValue><ds:KeyInfo Id="Certificate1"><ds:KeyValue><ds:RSAKeyValue><ds:Modulus>pslUUozm2DoD1sMOKN7hJSO/Nw5ZNdeAOQXrXLI4gSQLiX50B1Y4/KSsHV8DriRDBqDxLusyUgEu4V/7DtRjCiQNTfpPvueicSfp+awRwa8ggqH8uDNjTqujt+58T6q3u5l1ZCrdEF1B5B279jyTVNMWNqgxRvAr+he5iz23ylZWOf5JY4RBlVf/z/ByJlPsS0CNZVj4y2bno1MYxVNv2+TX390Xtm930apZqI+6Ppd9O5zZ0nZ0nMYhcWqReRBXcsUoSuKAgpm7utBuHvKosgIIagTNd7QzF8XVgwKVcgcXFoGW3P1UcD9wfWlx7FLXRE/ZMS85e7KhKaAvCDocgw==</ds:Modulus><ds:Exponent>AQAB</ds:Exponent></ds:RSAKeyValue></ds:KeyValue><ds:X509Data><ds:X509Certificate>MIIFLTCCAxWgAwIBAgIGAYHK0RDUMA0GCSqGSIb3DQEBCwUAMFoxCzAJBgNVBAYTAkNSMR8wHQYDVQQKDBZNSU5JU1RFUklPIERFIEhBQ0lFTkRBMQwwCgYDVQQLDANER1QxHDAaBgNVBAMME0NBIFBFUlNPTkEgSlVSSURJQ0EwHhcNMjIwNzA0MjAwNTA3WhcNMjYwNzAzMjAwNTA3WjCBhzEZMBcGA1UEBRMQQ1BKLTMtMTAxLTUyMjg5OTELMAkGA1UEBhMCQ1IxGTAXBgNVBAoMEFBFUlNPTkEgSlVSSURJQ0ExDDAKBgNVBAsMA0NQSjE0MDIGA1UEAwwrSU1QT1JUQUNJT05FUyBNT1JQQSBTVVJFbk8gU09DSUVEQUQgQU5PTklNQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKbJVFKM5tg6A9bDDije4SUjvzcOWTXXgDkF61yyOIEkC4l+dAdWOPykrB1fA64kQwag8S7rMlIBLuFf+w7UYwokDU36T77nonEn6fmsEcGvIIKh/LgzY06ro7fufE+qt7uZdWQq3RBdQeQdu/Y8k1TTFjaoMUbwK/oXuYs9t8pWVjn+SWOEQZVX/8/wciZT7EtAjWVY+Mtm56NTGMVTb9vk19/dF7Zvd9GqWaiPuj6XfTuc2dJ2dJzGIXFqkXkQV3LFKErigIKZu7rQbh7yqLICCGoEzXe0MxfF1YMClXIHFxaBltz9VHA/cH1pcexS10RP2TEvOXuyoSmgLwg6HIMCAwEAAaOByjCBxzAfBgNVHSMEGDAWgBQ7bVf11nzpnhACIEHjvRrMz7NOlTAdBgNVHQ4EFgQUy/VpDcunt67yuBk4QUEBoacj6wEwCwYDVR0PBAQDAgbAMBMGA1UdJQQMMAoGCCsGAQUFBwMEMGMGCCsGAQUFBwEBBFcwVTBTBggrBgEFBQcwAoZHaHR0cHM6Ly9wa2kuY29tcHJvYmFudGVzZWxlY3Ryb25pY29zLmdvLmNyL3Byb2QvaW50ZXJtZWRpYXRlLXBqLXBlbS5jcnQwDQYJKoZIhvcNAQELBQADggIBAI0W+TqdBoh0M8dY1hmd6DV0kUiWmi3isVOCAswk2/PUNaUHgeuO1nly2jdmDnE06h/3Zdgik5XL6G1AMrDR5HVvGlmfp2YRdYeHW/YK1Q41s9UyUZIvJCH2bV+F2J5+pSc3ygqjkKkD33woAV7wlzMNs8g2daPRGakd0RfjKK9viCt3VqXGhEy3b5Isq7Foi9rUZxYMVXtrfZ+eaXVspE1V4jgsMnEKvsgKgYQA1Nwn7ubimXG+OfWwaxBiG6YOswzxavkVs2eGvSzqnaK70/5uwzIqDarTLbu2R0OwiSc8sQmLPdgFfTH/G7eltqk1c51YJSlhpSJQLiXtxeFlgbgZvcczh6D2dYCN0AdZxk2x88DscOOXc3vE3E4Hb7SisuT3F78xh4PyBq3eFBRU2/WxHDyEY2xrtm0PuBYnB05Gw0tEwnRlE5NBp/X0F+dfP5b4Ra1Hi9Iaqr7Ezz052h7bQEk1BvduNBgd31OIUhruFQA4fhIvzOr7mWiEUB2yQxI8B0rwWBp4JZIk0LlR6RgraDSLnmUnHU5N3JLFZ+lYPuICtMCl5iAXUVDia6yjWICwGZcHeZa0di2syhWUxsN4xbTAMjJRuyh+UOJ52M3sOMY3Fj3DkNbWEczXezf8KzWhnZk4oXeY4KG7sAANhylcZbCDsJ2LC08nwyTxpwkH</ds:X509Certificate></ds:X509Data></ds:KeyInfo><ds:Object><xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#Signature-544554981"><xades:SignedProperties Id="SignedProperties-625156527"><xades:SignedSignatureProperties><xades:SigningTime>2023-04-29T18:45:43.015Z</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>/ShdbzoPt4V75kTaIBIlLEqtOhUuzwWNihB2nmO4Sic=</ds:DigestValue></xades:CertDigest><xades:IssuerSerial><ds:X509IssuerName>CN=CA PERSONA JURIDICA, OU=DGT, O=MINISTERIO DE HACIENDA, C=CR</ds:X509IssuerName><ds:X509SerialNumber>1656965107924</ds:X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate><xades:SignaturePolicyIdentifier><xades:SignaturePolicyId><xades:SigPolicyId><xades:Identifier Qualifier="OIDAsURI">https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2016/v4.3/Resoluci%C3%B3n_General_sobre_disposiciones_t%C3%A9cnicas_comprobantes_electr%C3%B3nicos_para_efectos_tributarios.pdf</xades:Identifier></xades:SigPolicyId><xades:SigPolicyHash><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>0h7Q3dFHhu0bHbcZEgVc07cEcDlquUeG08HG6Iototo=</ds:DigestValue></xades:SigPolicyHash></xades:SignaturePolicyId></xades:SignaturePolicyIdentifier><xades:SignerRole><xades:ClaimedRoles><xades:ClaimedRole>emisor</xades:ClaimedRole></xades:ClaimedRoles></xades:SignerRole></xades:SignedSignatureProperties><xades:SignedDataObjectProperties><xades:DataObjectFormat ObjectReference="#Ref1"><xades:MimeType>text/xml</xades:MimeType><xades:Encoding>utf-8</xades:Encoding></xades:DataObjectFormat></xades:SignedDataObjectProperties></xades:SignedProperties></xades:QualifyingProperties></ds:Object></ds:Signature></FacturaElectronica>`;
  // var objson = xml2json.fromStr(xml, 'string');

  const jsonProcessor = (json: any) => {
    const invoice = {
      invoice: json?.FacturaElectronica?.NumeroConsecutivo?.['#text'],
      date: new Date(json?.FacturaElectronica?.FechaEmision?.['#text']),
    };
    const products =
      json?.FacturaElectronica?.DetalleServicio?.LineaDetalle.map(
        (element: any) => {
          return {
            cost: +element?.SubTotal?.['#text'] / +element?.Cantidad?.['#text'],
            description: element?.Detalle?.['#text'],
            quantity: +element?.Cantidad?.['#text'],
            tax: element?.Impuesto ? +element?.Impuesto?.Tarifa?.['#text'] : 0,
          } as IInvoiceProduct;
        },
      );
    return { ...invoice, products };
  };

  const xmllog = async (file: IXMLFile) => {
    const { option, activity, xmlFile } = file;
    const xmlString = await xmlFile?.text();
    var objson = xml2json.fromStr(xmlString);
    const data = jsonProcessor(objson);
    console.log('invoice: ', data?.invoice, 'products: ', data?.products);

    const successCallback = () => {
      setXMLItem(initialXMLData);
      setSelectedOrder(initialSelectedOrderData);
      setIsXMLModalOpen(false);
    };

    const serviceCallParameters = {
      projectId,
      projectInvoiceDetail: {
        ...data,
        id: '',
        order: +option.label,
        updatedAt: new Date(),
        activity,
      },
      appStrings,
      successCallback,
    };
    await createProjectInvoiceDetailAndProducts(serviceCallParameters);
  };

  return (
    <div className={`${styles.operations_container}`}>
      <Box p={5} borderWidth="1px" borderRadius={12}>
        <Flex marginBottom="5px">
          <SearchInput
            id="fhg fw"
            style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
            placeholder="Search"
            onChange={handleSearch}
          ></SearchInput>
          <div style={{ textAlign: 'end', display: 'flex' }}>
            <Button
              style={{ padding: '0px', marginRight: 10 }}
              onClick={() => setIsXMLModalOpen(true)}
            >
              <UploadSimple size={18} />
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>+</Button>
            <Modal
              isOpen={isXMLModalOpen}
              onClose={() => {
                setIsXMLModalOpen(false);
              }}
            >
              <Form
                id="xml-form"
                initialFormData={xmlItem}
                // validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={xmllog}
              >
                <SearchSelect
                  name="option"
                  label={appStrings.order}
                  placeholder={appStrings.selectOrder}
                  options={orders.map(o => ({
                    value: o.id,
                    label: String(o.order),
                  }))}
                  value={selectedOrder.option}
                  onChange={item => {
                    handleSearchSelect(item?.value?.value);
                  }}
                />
                <Input name="activity" label={appStrings.activity} isDisabled />
                <FileUploader
                  name="xmlFile"
                  label={appStrings.uploadPDF}
                  buttonLabel={appStrings.selectFile}
                  acceptedFiles={[EFileTypes.any]}
                ></FileUploader>
                <Button width="full" type="submit">
                  {appStrings.submit}
                </Button>
              </Form>
            </Modal>
            <Modal
              isOpen={isModalOpen}
              onClose={() => {
                setSelectedItem(initialSelectedItemData);
                setSelectedOrder(initialSelectedOrderData);
                setIsModalOpen(false);
              }}
            >
              <Heading as="h2" size="lg">
                {selectedItem.id
                  ? appStrings.editInvoice
                  : appStrings.addInvoice}
              </Heading>
              <Form
                id="invoice-form"
                initialFormData={selectedItem}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
                onSubmit={handleOnSubmit}
              >
                <SearchSelect
                  name="option"
                  label={appStrings.order}
                  placeholder={appStrings.selectOrder}
                  isDisabled={!!selectedOrder.id}
                  options={orders.map(o => ({
                    value: o.id,
                    label: String(o.order),
                  }))}
                  value={selectedOrder.option}
                  onChange={item => {
                    handleSearchSelect(item?.value?.value);
                  }}
                />
                <Input
                  name="invoice"
                  type="number"
                  label={appStrings.invoice}
                  placeholder={appStrings.invoiceNumber}
                />
                <Input name="activity" label={appStrings.activity} isDisabled />
                <DatePicker name="date" label={appStrings.date}></DatePicker>
                <div className={styles.fileUpload_container}>
                  <FileUploader
                    name="pdfFile"
                    label={appStrings.uploadPDF}
                    buttonLabel={appStrings.selectFile}
                    acceptedFiles={[EFileTypes.pdf]}
                  ></FileUploader>
                  {selectedItem.pdfURL && (
                    <div style={{ width: '40%' }}>
                      <FormLabel>{appStrings.CurrentPDF}</FormLabel>
                      <Button
                        onClick={() => {
                          window.open(selectedItem.pdfURL);
                        }}
                        style={{ height: '40px', width: '100%' }}
                        rightIcon={<FilePdf size={24} />}
                      >
                        {appStrings.open}
                      </Button>
                    </div>
                  )}
                </div>

                <br />
                <Button width="full" type="submit">
                  {appStrings.submit}
                </Button>
              </Form>
            </Modal>
            <Modal
              isOpen={isDetailModalOpen}
              onClose={() => {
                setSelectedItem(initialSelectedItemData);
                setSelectedOrder(initialSelectedOrderData);
                setSelectedProduct(initialSelectedProductData);
                setIsDetailModalOpen(false);
              }}
            >
              <Heading as="h2" size="lg">
                {selectedProduct.id
                  ? appStrings.editInvoiceDetail
                  : appStrings.addInvoiceDetail}
              </Heading>
              <Form
                id="product-form"
                initialFormData={selectedProduct}
                validationSchema={productValSchema}
                validateOnChange
                validateOnBlur
                onSubmit={onSubmitProduct}
              >
                <ProductSearchSelect />
                <Input
                  name="quantity"
                  type="number"
                  label={appStrings.quantity}
                />
                <Input name="cost" type="number" label={appStrings.cost} />
                <Input name="tax" type="number" label={appStrings.taxAmount} />
                <br />
                <Button width="full" type="submit">
                  {appStrings.submit}
                </Button>
              </Form>
            </Modal>
          </div>
        </Flex>
        <AlertDialog
          title={appStrings.deleteInvoice}
          content={appStrings.deleteWarning}
          isOpen={isAlertDialogOpen}
          onClose={() => {
            setSelectedItem(initialSelectedItemData);
            setSelectedOrder(initialSelectedOrderData);
            setIsAlertDialogOpen(false);
          }}
          onSubmit={() => deleteButton()}
        />
        <AlertDialog
          title={appStrings.deleteProduct}
          content={appStrings.deleteWarning}
          isOpen={isProductAlertDialogOpen}
          onClose={() => {
            setSelectedProduct(initialSelectedProductData);
            setIsProductAlertDialogOpen(false);
          }}
          onSubmit={() => deleteProduct()}
        />
        <InvoiceTableView
          headers={tableHeader}
          items={formatTableData()}
          filter={value =>
            searchTerm === '' ||
            value.invoice?.toString().toUpperCase().includes(searchTerm)
          }
          handleRowClick={() => {}}
          onClickEdit={id => editButton(id)}
          onClickDelete={id => {
            setSelectedItem({ ...selectedItem, id: id });
            setIsAlertDialogOpen(true);
          }}
          onClickAddProduct={id => addProduct(id)}
          onClickEditProduct={(orderId, productId) =>
            editProduct(orderId, productId)
          }
          onClickDeleteProduct={(orderId, productId) =>
            delProduct(orderId, productId)
          }
          formatCurrency
        />
        {!projectInvoices.length ? <h1>{appStrings.noRecords}</h1> : null}
      </Box>
    </div>
  );
};

export default Invoicing;
