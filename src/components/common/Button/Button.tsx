import React from 'react';
import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';
import {
  ButtonStyles,
  TButtonShapes,
  DEFAULT_SHAPE,
} from '../../../styles/Button/ButtonStyles';

import styles from './Button.module.css';

export interface IButton extends ButtonProps {
  shape?: TButtonShapes;
}

const Button: React.FC<IButton> = props => {
  const chakraProps: ButtonProps = props;
  const { children, className, shape = DEFAULT_SHAPE } = props;

  const finalProps = {
    ...ButtonStyles.baseStyle,
    ...ButtonStyles.shapes?.[shape],
    ...chakraProps,
    className: `${styles.button} ${className}`,
  };

  return <ChakraButton {...finalProps}>{children}</ChakraButton>;
};

export default Button;
