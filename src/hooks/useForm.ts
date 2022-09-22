import React, { useEffect, useRef, useState } from 'react';
import { TObject, TValidationSchema } from '../types/global';
import useObjectValidation from './useObjectValidation';
import { IFormContext, IFormProps } from '../components/common/Form/Form';
import { TFormDataElement, TFormErrors } from '../types/forms';
import { array } from 'yup';

export interface IUseFormOptions<T> {
  initialFormData?: Partial<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onFormDataChange?: (newFormData: Partial<T>) => void;
  validationSchema?: TValidationSchema;
  validateOnChange?: boolean | Array<keyof T> | 'ALL';
  validateOnBlur?: boolean | Array<keyof T> | 'ALL';
  validateTogether?: Partial<TObject<Array<Extract<keyof T, string>>, keyof T>>;
}

export interface IUseFormHook<T> {
  formData: Partial<T>;
  updateFormData: (
    data: TFormDataElement<T> | Array<TFormDataElement<T>>,
  ) => void;
  handleOnChange: (data: TFormDataElement<T>) => void;
  handleOnBlur: (data: TFormDataElement<T>) => void;
  handleOnSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  validateForm: (
    specificSchema?: TValidationSchema,
  ) => Promise<[boolean, TObject<string>]>;
  validateSomeFields: (
    fields: Array<Extract<keyof T, string>>,
  ) => Promise<[boolean, TObject<string>]>;
  isValid: boolean;
  errors: TFormErrors<T>;
}

const useForm = <T extends TObject = TObject>(
  options: IUseFormOptions<T> = {},
): IUseFormHook<T> => {
  const {
    initialFormData,
    onSubmit,
    onFormDataChange,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    validateTogether,
  } = options;

  const [formData, setFormData] = useState<Partial<T>>(initialFormData as {});
  const { isValid, errors, validate, validateSome } = useObjectValidation(
    formData,
    validationSchema,
  );
  const touchedFieldsQueue = useRef<Array<Array<string>>>([]);

  const updateFormData: IFormContext<T>['updateFormData'] = data => {
    let fields: Array<TFormDataElement<T>> = Array.isArray(data)
      ? data
      : [data];
    const newFormData = { ...formData };
    const touchedFields = [];
    for (const field of fields) {
      const { name, value } = field;
      if (name?.length) {
        Object.assign(newFormData, { [name]: value });
        touchedFields.push(name);
      }
    }
    touchedFieldsQueue.current.push(touchedFields);
    setFormData(newFormData);
    onFormDataChange?.(newFormData);
  };

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [isValid] = await validate();
    if (isValid) onSubmit?.(formData as T);
  };

  const handleOnChange: IUseFormHook<T>['handleOnChange'] = data => {
    updateFormData?.(data);
  };

  const handleValidations = async (names: Array<string>) => {
    const relationships = [];
    for (const name of names) {
      relationships.push(...(validateTogether?.[name] ?? []));
    }
    validateSome([...names, ...relationships]);
  };

  /**
   * @param validationCondition validateOnChange | validateOnBlur
   * @param names form data key or keys to validate
   */
  const checkIfShouldValidate = (
    validationCondition:
      | IFormProps<T>['validateOnBlur']
      | IFormProps<T>['validateOnChange'],
    names?: Array<string>,
  ) => {
    if (validationCondition && names?.length) {
      if (validationCondition === 'ALL') {
        validate();
      } else {
        const filteredNames = names.filter(name => {
          if (Array.isArray(validationCondition)) {
            return validationCondition.includes(name);
          }
          return true;
        });
        handleValidations(filteredNames);
      }
    }
  };

  const handleOnBlur: IUseFormHook<T>['handleOnBlur'] = data => {
    const { name } = data;
    checkIfShouldValidate(validateOnBlur, [name]);
  };

  useEffect(() => {
    if (touchedFieldsQueue.current.length) {
      const touchedFields = touchedFieldsQueue.current.shift();
      checkIfShouldValidate(validateOnChange, touchedFields);
    }
  }, [formData]);

  return {
    formData,
    updateFormData,
    handleOnChange,
    handleOnBlur,
    handleOnSubmit,
    validateForm: validate,
    validateSomeFields: validateSome,
    isValid,
    errors: errors as TFormErrors<T>,
  };
};

export default useForm;
