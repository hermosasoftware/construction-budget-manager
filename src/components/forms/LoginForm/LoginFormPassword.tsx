import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import Button from '../../common/Button/Button';
import Form, { Input } from '../../common/Form';
import { IFormProps } from '../../common/Form/Form';
import * as yup from 'yup';

import styles from './LoginForm.module.css';

export interface ILoginFormPasswordData {
  password: string;
}

interface ILoginForm extends Omit<IFormProps<ILoginFormPasswordData>, 'id'> {}

const LoginForm: React.FC<ILoginForm> = props => {
  const formProps: Omit<IFormProps<ILoginFormPasswordData>, 'id'> = props;
  const { className } = formProps;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const validationSchema = yup.object().shape({
    password: yup.string().required(appStrings?.requiredField),
  });

  return (
    <Form<ILoginFormPasswordData>
      validationSchema={validationSchema}
      validateOnChange
      validateOnBlur={['password']}
      {...formProps}
      id="login-form"
      className={`${styles.login_form} ${className}`}
    >
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
