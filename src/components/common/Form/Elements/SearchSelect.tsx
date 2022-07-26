import React, { useContext } from 'react';
import { Select as ChakraSearchSelect } from 'chakra-react-select';
import FormControl, { IFormControl } from '../Layout/FormControl/FormControl';
import { IFormElementProps } from '../../../../types/forms';
import { FormContext } from '../Form';

interface ISearchSelect extends IFormControl, IFormElementProps {
  options?: Array<ISearchSelectOption>;
  placeholder?: string;
  isClearable?: boolean;
}

export type ISearchSelectOption = {
  value: string | number;
  label: string;
  color?: string;
  rating?: string;
};

const SearchSelect: React.FC<ISearchSelect> = props => {
  const formControlProps: IFormControl = props;
  const {
    name,
    innerId,
    innerClassName,
    options = [],
    placeholder,
    isClearable = true,
    value,
    onChange,
    onBlur,
    error,
  } = props;

  const {
    formId,
    initialFormData,
    formData,
    errors,
    updateFormData,
    handleOnBlur,
  } = useContext(FormContext);

  const triggerOnChangeHandlers = (newValue: ISearchSelectOption) => {
    if (onChange) onChange({ name, value: newValue || null });
    else if (updateFormData) updateFormData({ name, value: newValue || null });
  };

  const currentValue =
    value ?? formData?.[name] ?? initialFormData?.[name] ?? null;

  const triggerOnBlurHandlers = (event: React.FocusEvent<any>) => {
    if (onBlur) onBlur({ name, value: currentValue });
    else if (handleOnBlur) handleOnBlur({ name, value: currentValue });
  };

  const uuid = innerId || `${formId}-${name}`;

  return (
    <FormControl
      innerId={uuid}
      errorMessage={error || errors[name]}
      {...formControlProps}
    >
      <ChakraSearchSelect
        id={uuid}
        name={name}
        className={`chakra-react-select ${innerClassName}`}
        classNamePrefix="chakra-react-select"
        options={options}
        value={currentValue}
        isClearable={isClearable}
        placeholder={placeholder}
        selectedOptionStyle="check"
        chakraStyles={searchSelectStyles}
        onChange={triggerOnChangeHandlers}
        onBlur={triggerOnBlurHandlers}
      />
    </FormControl>
  );
};

const searchSelectStyles = {
  dropdownIndicator: (provided: any) => ({
    ...provided,
    bg: 'transparent',
    px: 2,
    cursor: 'inherit',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: 'none',
  }),
};

export default SearchSelect;
