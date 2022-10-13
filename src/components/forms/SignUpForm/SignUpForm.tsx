import React from 'react';
import { useAppSelector } from '../../../redux/hooks';
import Button from '../../common/Button/Button';
import Form, { Input, Select } from '../../common/Form';
import { IFormProps } from '../../common/Form/Form';
import { IUser, TIdType } from '../../../types/user';
import { validateKey } from '../../../services/authService';
import * as yup from 'yup';

export interface ISignUpFormData extends IUser {
  password: string;
  passwordVerification: string;
}

interface ISignUpForm extends Omit<IFormProps<ISignUpFormData>, 'id'> {}

const initialFormData: Partial<ISignUpFormData> = {
  idType: 'national',
};

const SignUpForm: React.FC<ISignUpForm> = props => {
  const formProps: Omit<IFormProps<ISignUpFormData>, 'id'> = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const idTypeSelectOptions: Array<{ id: TIdType; name: string }> = [
    { id: 'national', name: appStrings?.national },
  ];

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.requiredField),
    lastName: yup.string().required(appStrings?.requiredField),
    id: yup
      .string()
      .required(appStrings?.requiredField)
      .test({
        test: async value => validateKey(value),
        message: appStrings?.idAlreadyTaken,
      }),
    email: yup
      .string()
      .required(appStrings?.requiredField)
      .email(appStrings?.validEmailRequired)
      .test({
        test: async value => validateKey(value),
        message: appStrings?.emailAlreadyTaken,
      }),
    password: yup
      .string()
      .required(appStrings?.requiredField)
      .min(6, appStrings?.passwordTooShort),
    passwordVerification: yup.string().when('password', (password, schema) => {
      if (!password?.length) return schema;
      return schema.test({
        test: (passwordVerification: string) =>
          passwordVerification === password,
        message: appStrings?.passwordsDontMatch,
      });
    }),
  });

  return (
    <Form<ISignUpFormData>
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
      validateTogether={{ password: ['passwordVerification'] }}
      initialFormData={initialFormData}
      {...formProps}
      id="signup-form"
    >
      <Input
        isRequired
        name="name"
        label={appStrings?.firstName}
        placeholder={appStrings?.name}
      />
      <Input
        isRequired
        name="lastName"
        label={appStrings?.lastName}
        placeholder={appStrings?.lastName}
      />
      <Select
        isRequired
        name="idType"
        label={appStrings?.idType}
        options={idTypeSelectOptions}
      />
      <Input
        isRequired
        name="id"
        label={appStrings?.id}
        placeholder={appStrings?.idNumber}
      />
      <Input
        isRequired
        name="email"
        label={appStrings?.email}
        placeholder={appStrings?.mail}
      />
      <Input
        isRequired
        name="password"
        type="password"
        label={appStrings?.password}
        placeholder={appStrings?.password}
      />
      <Input
        isRequired
        name="passwordVerification"
        type="password"
        label={appStrings?.verifyPassword}
        placeholder={appStrings?.enterAgain}
      />
      <Button type="submit" className="submit-button">
        {appStrings?.signUp}
      </Button>
    </Form>
  );
};

export default SignUpForm;
