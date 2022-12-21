import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import Button from '../../common/Button/Button';
import Form, { Input } from '../../common/Form';
import { IFormProps } from '../../common/Form/Form';
import { IUser } from '../../../types/user';
import * as yup from 'yup';

import styles from './LoginFormEmail.module.css';

export interface ILoginFormEmailData {
  id?: IUser['id'];
  email: IUser['email'];
}

interface ILoginForm extends Omit<IFormProps<ILoginFormEmailData>, 'id'> {}

const LoginForm: React.FC<ILoginForm> = props => {
  const formProps: Omit<IFormProps<ILoginFormEmailData>, 'id'> = props;
  const { className } = formProps;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const validationSchema = yup.object().shape(
    {
      id: yup.string().when('email', (email, schema) => {
        if (email?.length) return schema;
        return schema.required(appStrings?.oneIdRequired);
      }),
      email: yup
        .string()
        .email(appStrings?.validEmailRequired)
        .when('id', (id, schema) => {
          if (id?.length) return schema;
          return schema.required(appStrings?.oneIdRequired);
        }),
    },
    [['id', 'email']],
  );

  return (
    <Form<ILoginFormEmailData>
      validationSchema={validationSchema}
      validateOnChange
      validateTogether={{ id: ['email'], email: ['id'] }}
      {...formProps}
      id="login-form"
      className={`${styles.login_form} ${className}`}
    >
      <Input
        name="email"
        label={appStrings?.email}
        placeholder={appStrings?.email}
      />

      <Link to="/forgot-password" className={styles.restore_link}>
        {appStrings?.restoreForgottenPassword}
      </Link>
      <Button type="submit" className="submit-button">
        {appStrings?.next}
      </Button>
    </Form>
  );
};

export default LoginForm;
