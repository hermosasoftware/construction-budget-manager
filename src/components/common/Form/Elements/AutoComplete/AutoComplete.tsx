import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Input as ChakraInput,
  Collapse,
  InputGroup,
  InputLeftElement,
  InputProps,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { FormContext } from '../../Form';
import FormControl, {
  IFormControl,
} from '../../Layout/FormControl/FormControl';
import { IFormElementProps } from '../../../../../types/forms';
import Downshift from 'downshift';
import styles from './AutoComplete.module.css';

interface ISuggestion {
  value: string;
}

export interface IInput extends IFormControl, IFormElementProps {
  icon?: any;
  placeholder?: string;
  isDisabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
  suggestions: ISuggestion[];
}

const AutoComplete: React.FC<IInput> = props => {
  const formControlProps: IFormControl = props;
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFirstCharge, setIsFirstCharge] = useState(true);
  const {
    name,
    icon,
    innerId,
    innerClassName,
    innerStyle,
    placeholder,
    isDisabled = false,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    onKeyDown,
    sx,
    onFocus,
    suggestions,
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

  const customOnChangeHandler = (value: string) => {
    if (onChange) onChange({ name, value });
    else if (handleOnChange) handleOnChange({ name, value });
  };

  const suggestionFilter = (item: any, inputValue: string | null) =>
    !inputValue || item.value?.toUpperCase().includes(inputValue.toUpperCase());

  const uuid = innerId || `${formId}-${name}`;

  const finalInputProps: InputProps = {
    id: uuid,
    name,
    className: innerClassName,
    style: innerStyle,
    type,
    value: currentValue,
    placeholder,
    isDisabled,
    onChange: triggerOnChangeHandlers,
    onBlur: triggerOnBlurHandlers,
    _placeholder: { color: 'text_ghost' },
    onKeyDown: onKeyDown,
    sx: sx,
    onFocus: onFocus,
  };

  const stateReducer = (state: any, changes: any) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.mouseUp:
        return { ...changes, inputValue: state.inputValue };
      case Downshift.stateChangeTypes.blurInput:
        if (isFirstCharge) {
          setIsFirstCharge(false);
          return { ...changes, inputValue: currentValue };
        }
        return changes;
      default:
        return changes;
    }
  };

  return (
    <FormControl
      innerId={uuid}
      errorMessage={error || errors[name]}
      {...formControlProps}
    >
      <Downshift
        onChange={selection => {
          customOnChangeHandler(selection.value);
          setSelectedOption(selection.value);
        }}
        itemToString={item => (item ? item.value : '')}
        onInputValueChange={value => {
          if (value !== selectedOption) {
            customOnChangeHandler(value);
          }
        }}
        stateReducer={stateReducer}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          selectedItem,
          getRootProps,
          setState,
        }) => {
          return (
            <>
              <div {...getRootProps({}, { suppressRefError: true })}>
                <InputGroup>
                  {icon && (
                    <InputLeftElement children={icon}></InputLeftElement>
                  )}
                  <ChakraInput
                    {...finalInputProps}
                    {...getInputProps()}
                    onClick={() => {
                      if (!inputValue) setState({ isOpen: true });
                    }}
                  />
                </InputGroup>
              </div>
              {isOpen ? (
                <UnorderedList
                  {...getMenuProps()}
                  className={styles.list_container}
                >
                  <Collapse in={isOpen} animateOpacity>
                    {
                      <Box>
                        {suggestions
                          .filter(item => suggestionFilter(item, inputValue))
                          .map((item, index) => (
                            <ListItem
                              {...getItemProps({
                                key: item.value,
                                index,
                                item,
                              })}
                              className={styles.list_item}
                            >
                              {item.value}
                            </ListItem>
                          ))}
                      </Box>
                    }
                  </Collapse>
                </UnorderedList>
              ) : null}
            </>
          );
        }}
      </Downshift>
    </FormControl>
  );
};

export default AutoComplete;
