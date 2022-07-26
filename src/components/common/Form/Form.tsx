import React, { createContext } from 'react';
import { IStyledComponent, TChildren, TObject } from '../../../types/global';
import useForm, { IUseFormHook, IUseFormOptions } from '../../../hooks/useForm';
import { TFormErrors } from '../../../types/forms';

import styles from './Form.module.css';

export interface IFormProps<T = TObject>
  extends IUseFormOptions<T>,
    IStyledComponent {
  id: string;
  formElements?: (formContext: IFormContext<T>) => TChildren;
  children?: TChildren;
}

export interface IFormContext<T = TObject>
  extends Omit<IUseFormHook<T>, 'handleOnSubmit'> {
  formId: string;
  initialFormData: Partial<T>;
}

export const FormContext = createContext<IFormContext<any>>({} as IFormContext);

const Form = <T extends TObject>(props: IFormProps<T>) => {
  const {
    id,
    className,
    style,
    initialFormData = {},
    onSubmit,
    onFormDataChange,
    validationSchema,
    validateOnChange = false,
    validateOnBlur = false,
    validateTogether,
    formElements,
    children,
  } = props;

  const {
    formData,
    updateFormData,
    handleOnChange,
    handleOnBlur,
    handleOnSubmit,
    validateForm,
    validateSomeFields,
    isValid,
    errors,
  } = useForm<T>({
    initialFormData,
    onSubmit,
    onFormDataChange,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    validateTogether,
  });

  const formContext: IFormContext<T> = {
    formId: id,
    initialFormData,
    formData,
    updateFormData,
    handleOnChange,
    handleOnBlur,
    validateForm,
    validateSomeFields,
    isValid,
    errors: errors as TFormErrors<T>,
  };

  return (
    <form
      className={`center-content ${styles.form} ${className}`}
      style={style}
      onSubmit={handleOnSubmit}
    >
      <FormContext.Provider value={formContext}>
        {formElements ? formElements(formContext) : children}
      </FormContext.Provider>
    </form>
  );
};

export default Form;
