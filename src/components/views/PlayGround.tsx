import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { changeAppLang } from '../../redux/reducers/settingsSlice';
import { supportedLangs } from '../../providers/LangProvider';
import { TAppLang } from '../../types/global';
import Button from '../common/Button/Button';
import Form, { Input, Select } from '../common/Form';
import Modal from '../common/Modal/Modal';
import TableView from '../common/TableView/TableView';
import { TTableHeader } from '../common/TableView/TableView';
import TabGroup from '../common/TabGroup/TabGroup';
import * as yup from 'yup';

import styles from './PlayGround.module.css';

export const tableHeader: TTableHeader[] = [
  { name: 'name', value: 'Nombre' },
  { name: 'invoice', value: '# Factura', isGreen: true },
  { name: 'creation', value: 'Creacion' },
  { name: 'email', value: 'Correo' },
  { name: 'value', value: 'Valor' },
];

export const tableData = [
  {
    id: '1',
    name: 'Segun Adebayo',
    invoice: '39235',
    creation: '24 May, 2020',
    email: 'sage@chakra-ui.com',
    value: 'CRC 5900',
  },
  {
    id: '2',
    name: 'Mark Chandler',
    invoice: '93457',
    creation: '21 Sep, 2020',
    email: 'mark@chakra-ui.com',
    value: 'CRC 5900',
  },
  {
    id: '3',
    name: 'Lazar Nikolov',
    invoice: '10708',
    creation: '1 Feb, 2020',
    email: 'lazar@chakra-ui.com',
    value: 'CRC 5900',
  },
  {
    id: '4',
    name: 'Javier Alaves',
    invoice: '50364',
    creation: '8 Sep, 2020',
    email: 'javi@chakra-ui.com',
    value: 'CRC 5900',
  },
];

const Home = () => {
  const { appLang, appStrings } = useAppSelector(state => ({
    ...state.settings,
  }));
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dummyValidationSchema = yup.object().shape({
    username: yup.string().required('Campo requerido'),
    password: yup.string().required('Campo requerido'),
  });

  return (
    <div className={`red-text ${styles.home_container}`}>
      <p>
        This is the app play ground. Here you can see how basic functionality
        works. How to access the application through it's different slice
        reducers. Dispatch actions and see how they afect the state. The difrent
        ways to style the application.
      </p>
      <label>
        {appStrings.PlayGround.changeLang}{' '}
        <select
          value={appLang}
          onChange={event =>
            dispatch(changeAppLang(event.target.value as TAppLang))
          }
        >
          {supportedLangs.map(lang => (
            <option value={lang} key={`lang-option-${lang}`}>
              {lang}
            </option>
          ))}
        </select>
      </label>
      <br />
      <Link to="/home">Click here to Home</Link>
      <br />
      <Link to="/clients">Click here to Clients</Link>
      <br />
      <Link to="/invoices">Click here to Invoices</Link>
      <br />
      <Link to="/products">Click here to Products</Link>
      <br />
      <Link to="/reports">Click here to Reports</Link>
      <br />
      <br />
      <div style={{ margin: '0 30%' }}>
        <p>Example: Single Selection Tab Group</p>
        <TabGroup
          tabs={[
            { id: 'product', name: 'Producto', selected: true },
            { id: 'services', name: 'Servicios' },
            { id: 'digitalContent', name: 'Contenido Digital' },
          ]}
          onSelectedTabChange={activeTabs =>
            console.log('Single - Active Tabs: ', activeTabs)
          }
        />
        <br />
        <p>Example: Multiple Selection Tab Group</p>
        <TabGroup
          tabs={[
            { id: 'product', name: 'Producto', selected: true },
            { id: 'services', name: 'Servicios' },
            { id: 'digitalContent', name: 'Contenido Digital' },
          ]}
          onSelectedTabChange={activeTabs =>
            console.log('Multiple - Active Tabs: ', activeTabs)
          }
          selectionType="multiple"
        />
      </div>
      <br />
      <br />
      <div style={{ margin: '0 30%' }}>
        <p>Form Examples</p>

        <p>Form 1</p>
        <Form
          id="playground-form-1"
          initialFormData={{ username: 'Test Initial Data' }}
          validationSchema={dummyValidationSchema}
          validateOnChange
          validateOnBlur
          onSubmit={data => {
            console.log('Form 1 submitted data: ', data);
          }}
        >
          <Input
            name="username"
            label="Nombre de usuario"
            placeholder="Texto como placeholder"
            helperText="Texto con indicaciones"
          />
          <Input
            name="password"
            label="Contraseña"
            placeholder="Texto como placeholder"
          />
          <Select
            name="country"
            label="País"
            placeholder="Seleccione su nacionalidad"
            options={[
              { id: 'CR', name: 'Costa Rica' },
              { id: 'CA', name: 'Canadá' },
            ]}
          />
          <br />
          <Button width="full" type="submit">
            Submit
          </Button>
        </Form>

        <br />

        <p>Form 2</p>
        <Form
          id="playground-form-2"
          onSubmit={data => {
            console.log('Form 2 submitted data: ', data);
          }}
        >
          <Input name="email" label="Correo electrónico" isRequired />
          <Input
            name="password"
            isRequired
            label="Contraseña"
            type="password"
          />
          <br />
          <Button width="full" type="submit">
            Submit
          </Button>
        </Form>
      </div>
      <div style={{ margin: '0 30%' }}>
        <button onClick={() => setIsModalOpen(true)}>open side modal</button>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div>Modal Test</div>
        </Modal>
      </div>
      <TableView headers={tableHeader} items={tableData} />
    </div>
  );
};

export default Home;
