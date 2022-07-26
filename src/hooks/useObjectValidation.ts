import { useState } from 'react';
import * as yup from 'yup';
import { TObject, TValidationSchema } from '../types/global';

export type TErrors = TObject<string>;
export type TErrorModification = { name: string; error: string | null };

export type TUseObjectValidationHook = {
  isValid: boolean;
  errors: TErrors;
  validate: (specificSchema?: TValidationSchema) => Promise<[boolean, TErrors]>;
  validateSome: (
    fields: Array<string>,
    specificSchema?: TValidationSchema,
  ) => Promise<[boolean, TErrors]>;
};

const useObjectValidation = (
  data: TObject,
  schema: TValidationSchema = yup.object().shape({}),
): TUseObjectValidationHook => {
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<TErrors>({});

  /**
   * This is done this way to avoid async inconsistencies
   */
  const makeErrorModifications = (
    errorModifications: Array<TErrorModification>,
  ) => {
    setErrors(currentErrors => {
      const nextErrors = { ...currentErrors };
      errorModifications.forEach(({ name, error }) => {
        if (error) {
          nextErrors[name] = error;
        } else {
          delete nextErrors[name];
        }
      });
      return nextErrors;
    });
  };

  const validate = async (
    specificSchema?: TValidationSchema,
  ): Promise<[boolean, TErrors]> => {
    const errorModifications: Array<TErrorModification> = [];
    const newErrors: TErrors = {};
    try {
      if (specificSchema)
        await specificSchema.validate(data, { abortEarly: false });
      else await schema.validate(data, { abortEarly: false });
    } catch (err: any) {
      err.inner.forEach(({ path, message }: TObject) => {
        Object.assign(newErrors, { [path]: message });
        errorModifications.push({ name: path, error: message });
      });
    }
    return updateStates(errorModifications, newErrors);
  };

  const validateSome = async (
    fields: Array<string>,
    specificSchema?: TValidationSchema,
  ): Promise<[boolean, TErrors]> => {
    const errorModifications: Array<TErrorModification> = [];
    const newErrors = { ...errors };
    for (const field of fields) {
      try {
        if ((specificSchema ?? schema)?.fields?.[field]) {
          if (specificSchema) await specificSchema.validateAt(field, data);
          else await schema.validateAt(field, data);
        }
        delete newErrors[field];
        errorModifications.push({ name: field, error: null });
      } catch (err: any) {
        newErrors[err.path] = err.message;
        errorModifications.push({ name: err.path, error: err.message });
      }
    }
    return updateStates(errorModifications, newErrors);
  };

  const updateStates = (
    errorModifications: Array<{ name: string; error: string | null }>,
    newErrors: TErrors,
  ): [boolean, TErrors] => {
    const newIsValid = !Object.keys(newErrors)?.length;
    setIsValid(newIsValid);
    makeErrorModifications(errorModifications);
    return [newIsValid, newErrors];
  };

  return { isValid, errors, validate, validateSome: validateSome };
};

export default useObjectValidation;
