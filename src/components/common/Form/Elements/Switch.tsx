import React, { useContext } from 'react';
import { Switch as ChakraSwitch } from '@chakra-ui/react';
import FormControl, { IFormControl } from '../Layout/FormControl/FormControl';
import { IFormElementProps } from '../../../../types/forms';
import { FormContext } from '../Form';

interface ISwitch extends IFormControl, IFormElementProps {
  isChecked?: boolean;
}

const Switch: React.FC<ISwitch> = props => {
  const formControlProps: IFormControl = props;
  const { name, isChecked, onChange, innerId, innerClassName, innerStyle } =
    props;

  const { formId, initialFormData, formData, updateFormData } =
    useContext(FormContext);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.currentTarget;
    if (onChange) onChange({ name, value: checked });
    if (updateFormData) updateFormData?.({ name, value: checked });
  };

  const uuid = innerId || `${formId}-${name}`;
  const value =
    isChecked ?? formData?.[name] ?? initialFormData?.[name] ?? false;

  return (
    <FormControl innerId={uuid} {...formControlProps}>
      <ChakraSwitch
        id={uuid}
        name={name}
        className={innerClassName}
        style={innerStyle}
        isChecked={value}
        defaultChecked={value}
        onChange={handleOnChange}
      />
    </FormControl>
  );
};

export default Switch;
