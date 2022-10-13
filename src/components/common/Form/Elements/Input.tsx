import React, { useContext, useState } from 'react';
import {
  Input as ChakraInput,
  InputGroup,
  InputProps,
  InputRightElement,
} from '@chakra-ui/react';
import { FormContext } from '../Form';
import FormControl, { IFormControl } from '../Layout/FormControl/FormControl';
import Button from '../../Button/Button';
import { useAppSelector } from '../../../../redux/hooks';
import { IFormElementProps } from '../../../../types/forms';

export interface IInput extends IFormControl, IFormElementProps {
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  viewPassword?: boolean;
}

const Input: React.FC<IInput> = props => {
  const formControlProps: IFormControl = props;
  const {
    name,
    innerId,
    innerClassName,
    innerStyle,
    placeholder,
    type = 'text',
    viewPassword = true,
    value,
    onChange,
    onBlur,
    error,
    onKeyDown,
    sx,
    onFocus,
  } = props;

  const {
    formId,
    initialFormData,
    formData,
    errors,
    handleOnChange,
    handleOnBlur,
  } = useContext(FormContext);

  const [showPassword, setShowPassword] = useState(false);
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const handleOnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setShowPassword(prevState => !prevState);
  };

  const triggerOnChangeHandlers = (
    event: React.ChangeEvent<HTMLInputElement>,
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

  const finalInputProps: InputProps = {
    id: uuid,
    name,
    className: innerClassName,
    style: innerStyle,
    type: type === 'password' ? (showPassword ? 'text' : 'password') : type,
    value: currentValue,
    placeholder,
    onChange: triggerOnChangeHandlers,
    onBlur: triggerOnBlurHandlers,
    _placeholder: { color: 'text_ghost' },
    onKeyDown: onKeyDown,
    sx: sx,
    onFocus: onFocus,
  };

  return (
    <FormControl
      innerId={uuid}
      errorMessage={error || errors[name]}
      {...formControlProps}
    >
      <InputGroup>
        <ChakraInput {...finalInputProps} />
        {type === 'password' && viewPassword ? (
          <InputRightElement width={'var(--form-inner-input-width);'}>
            <Button {...showPasswordButtonStyles} onClick={handleOnClick}>
              {showPassword ? appStrings?.hide : appStrings?.show}
            </Button>
          </InputRightElement>
        ) : null}
      </InputGroup>
    </FormControl>
  );
};

const showPasswordButtonStyles = {
  colorScheme: 'accent',
  borderWidth: 'var(--btn-border-width-sm)',
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  style: { width: '100%', height: '100%' },
};

export default Input;
