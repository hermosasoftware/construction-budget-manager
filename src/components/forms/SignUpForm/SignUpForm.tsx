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
    { id: 'national', name: appStrings?.Global?.national },
  ];

  const validationSchema = yup.object().shape({
    name: yup.string().required(appStrings?.Global?.requiredField),
    lastName: yup.string().required(appStrings?.Global?.requiredField),
    id: yup
      .string()
      .required(appStrings?.Global?.requiredField)
      .test({
        test: async value => validateKey(value),
        message: appStrings?.Global?.idAlreadyTaken,
      }),
    email: yup
      .string()
      .required(appStrings?.Global?.requiredField)
      .email(appStrings?.Global?.validEmailRequired)
      .test({
        test: async value => validateKey(value),
        message: appStrings?.Global?.emailAlreadyTaken,
      }),
    password: yup
      .string()
      .required(appStrings?.Global?.requiredField)
      .min(6, appStrings?.Global?.passwordTooShort),
    passwordVerification: yup.string().when('password', (password, schema) => {
      if (!password?.length) return schema;
      return schema.test({
        test: (passwordVerification: string) =>
          passwordVerification === password,
        message: appStrings?.Global?.passwordsDontMatch,
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
        label={appStrings?.Global?.firstName}
        placeholder={appStrings?.Global?.name}
      />
      <Input
        isRequired
        name="lastName"
        label={appStrings?.Global?.lastName}
        placeholder={appStrings?.Global?.lastName}
      />
      <Select
        isRequired
        name="idType"
        label={appStrings?.Global?.idType}
        options={idTypeSelectOptions}
      />
      <Input
        isRequired
        name="id"
        label={appStrings?.Global?.id}
        placeholder={appStrings?.Global?.idNumber}
      />
      <Input
        isRequired
        name="email"
        label={appStrings?.Global?.email}
        placeholder={appStrings?.Global?.mail}
      />
      <Input
        isRequired
        name="password"
        type="password"
        label={appStrings?.Global?.password}
        placeholder={appStrings?.Global?.password}
      />
      <Input
        isRequired
        name="passwordVerification"
        type="password"
        label={appStrings?.Auth?.verifyPassword}
        placeholder={appStrings?.Global?.enterAgain}
      />
      <Button type="submit" className="submit-button">
        {appStrings?.Auth?.signUp}
      </Button>
    </Form>
  );
};

export default SignUpForm;
