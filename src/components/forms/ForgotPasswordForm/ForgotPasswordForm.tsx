import React from 'react';
import { useAppSelector } from '../../../redux/hooks';
import Button from '../../common/Button/Button';
import Form, { Input } from '../../common/Form';
import { IFormProps } from '../../common/Form/Form';
import { IUser } from '../../../types/user';
import * as yup from 'yup';

interface IForgotPasswordFormData {
  id?: IUser['id'];
  email?: IUser['email'];
}

interface IForgotPasswordForm
  extends Omit<IFormProps<IForgotPasswordFormData>, 'id'> {}

const ForgotPasswordForm: React.FC<IForgotPasswordForm> = props => {
  const formProps: Omit<IFormProps<IForgotPasswordFormData>, 'id'> = props;
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
    <Form<IForgotPasswordFormData>
      validationSchema={validationSchema}
      validateOnChange={'ALL'}
      {...formProps}
      id="forgot-password-form"
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
        placeholder={appStrings?.mail}
      />
      <Button type="submit" className="submit-button">
        {appStrings?.sendRecovery}
      </Button>
    </Form>
  );
};

export default ForgotPasswordForm;
