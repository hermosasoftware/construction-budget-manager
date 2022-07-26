import React from 'react';
import {
  FormControl as ChakraFormControl,
  FormHelperText,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';
import { Circle } from 'phosphor-react';
import { IStyledComponent } from '../../../../../types/global';

import styles from './FormControl.module.css';

export interface IFormControl {
  containerId?: string;
  containerClassName?: IStyledComponent['className'];
  containerStyle?: IStyledComponent['style'];
  innerId?: string;
  label?: string;
  labelPlacement?: 'top' | 'inline';
  hasBulletPoint?: boolean;
  isRequired?: boolean;
  helperText?: string;
  errorMessage?: string;
}

const FormControl: React.FC<IFormControl> = props => {
  const {
    containerId,
    containerClassName,
    containerStyle,
    innerId,
    label,
    labelPlacement = 'top',
    hasBulletPoint,
    isRequired,
    helperText,
    errorMessage,
    children,
  } = props;

  const helperMessage = errorMessage ? (
    <FormErrorMessage>{errorMessage}</FormErrorMessage>
  ) : (
    helperText && <FormHelperText>{helperText}</FormHelperText>
  );

  return (
    <>
      <ChakraFormControl
        id={containerId}
        className={containerClassName}
        style={containerStyle}
        isRequired={isRequired}
        label={label}
        isInvalid={!!errorMessage}
      >
        {labelPlacement === 'top' ? (
          <>
            {label && (
              <FormLabel htmlFor={innerId} className={styles.form_label}>
                {hasBulletPoint && <Circle height={5} weight="fill" />}
                {label}
              </FormLabel>
            )}
            {children}
            {helperMessage}
          </>
        ) : (
          <>
            <div
              className={`center-content-cross ${styles.inline_style__container}`}
            >
              <div className={styles.inline_style__left}>
                {label && (
                  <FormLabel
                    htmlFor={innerId}
                    className={`center-content-cross ${styles.inline_style__label}`}
                  >
                    {hasBulletPoint && <Circle height={5} weight="fill" />}
                    {label}
                    {helperMessage}
                  </FormLabel>
                )}
              </div>
              <div className={styles.inline_style__right}>{children}</div>
            </div>
          </>
        )}
      </ChakraFormControl>
    </>
  );
};

export default FormControl;
