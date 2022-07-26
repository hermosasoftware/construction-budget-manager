import React, { useContext } from 'react';
import { Select as ChakraSelect, SelectProps } from '@chakra-ui/react';
import FormControl, { IFormControl } from '../Layout/FormControl/FormControl';
import { FormContext } from '../Form';
import { IFormElementProps } from '../../../../types/forms';

interface ISelect extends IFormControl, IFormElementProps {
  options: Array<{ id: string; name: string }>;
  placeholder?: string;
}

const Select: React.FC<ISelect> = props => {
  const formControlProps: IFormControl = props;
  const {
    name,
    innerId,
    innerClassName,
    innerStyle,
    options = [],
    placeholder,
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
    handleOnChange,
    handleOnBlur,
  } = useContext(FormContext);

  const triggerOnChangeHandlers = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value } = event.currentTarget;
    if (onChange) onChange({ name, value });
    else if (handleOnChange) handleOnChange({ name, value });
  };

  const currentValue =
    value ?? formData?.[name] ?? initialFormData?.[name] ?? '';

  const triggerOnBlurHandlers = () => {
    if (onBlur) onBlur({ name, value: currentValue });
    else if (handleOnBlur) handleOnBlur({ name, value: currentValue });
  };

  const uuid = innerId || `${formId}-${name}`;

  const finalSelectProps: SelectProps = {
    id: uuid,
    name: name,
    className: innerClassName,
    style: innerStyle,
    placeholder: placeholder,
    value: currentValue,
    variant: 'outline',
    onChange: triggerOnChangeHandlers,
    onBlur: triggerOnBlurHandlers,
  };

  return (
    <FormControl
      innerId={uuid}
      errorMessage={error || errors[name]}
      {...formControlProps}
    >
      <ChakraSelect {...finalSelectProps}>
        {options.map(option => (
          <option key={`${uuid}-option-${option.id}`} value={option.id}>
            {option.name}
          </option>
        ))}
      </ChakraSelect>
    </FormControl>
  );
};

export default Select;
