import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import Button from '../../common/Button/Button';
import Form, { Input } from '../../common/Form';
import { IFormProps } from '../../common/Form/Form';
import { IUser } from '../../../types/user';
import * as yup from 'yup';

import styles from './LoginForm.module.css';

export interface ILoginFormData {
  id?: IUser['id'];
  email: IUser['email'];
  password: string;
}

interface ILoginForm extends Omit<IFormProps<ILoginFormData>, 'id'> {}

const LoginForm: React.FC<ILoginForm> = props => {
  const formProps: Omit<IFormProps<ILoginFormData>, 'id'> = props;
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
      password: yup.string().required(appStrings?.requiredField),
    },
    [['id', 'email']],
  );
  return (
    <Form<ILoginFormData>
      validationSchema={validationSchema}
      validateOnChange
      validateOnBlur={['password']}
      validateTogether={{ id: ['email'], email: ['id'] }}
      {...formProps}
      id="login-form"
      className={`${styles.login_form} ${className}`}
    >
      <Input
        name="id"
        label={appStrings?.idNumber}
        placeholder={appStrings?.id}
        helperText={appStrings?.orCanAlsoUse}
      />
      <Input
        name="email"
        label={appStrings?.email}
        placeholder={appStrings?.email}
      />
      <Input
        isRequired
        name="password"
        type="password"
        label={appStrings?.password}
        placeholder={appStrings?.password}
        containerClassName={styles.password_input}
      />
      <Link to="/forgot-password" className={styles.restore_link}>
        {appStrings?.restoreForgottenPassword}
      </Link>
      <Button type="submit" className="submit-button">
        {appStrings?.logIn}
      </Button>
    </Form>
  );
};

export default LoginForm;
