import React, { useState } from 'react';
import Button from '../Button/Button';
import { Field } from 'formik';
import * as yup from 'yup';
import styles from './Counter.module.css';
import { FormControl, Input, Tooltip } from '@chakra-ui/react';
import { WarningCircle } from 'phosphor-react';

interface ICounterProps {
  min?: number;
  max: number;
  id: string;
  errors: any;
  touched: any;
  isDisabled?: boolean;
  handleOnChange?: Function;
}

const Counter = (props: ICounterProps) => {
  const {
    min = 0,
    max,
    isDisabled,
    handleOnChange,
    id,
    errors,
    touched,
  } = props;

  const [value, setValue] = useState<number>(min);

  const increase = () => {
    const nextValue = value + 1;
    if (nextValue <= max) {
      setValue(nextValue);
      handleOnChange && handleOnChange(nextValue);
    }
  };

  const decrease = () => {
    const nextValue = value - 1;
    if (nextValue >= min) {
      setValue(nextValue);
      handleOnChange && handleOnChange(nextValue);
    }
  };

  const isInvalid = !!errors[id] && touched[id];

  const handleErrorMessage = (message: string) => {
    return message?.replace(id, 'This value ');
  };

  return (
    <div className={styles.counterContainer}>
      <Button
        className={`${styles.counterButton} ${styles.leftButton}`}
        onClick={decrease}
        disabled={isDisabled}
      >
        {`-`}
      </Button>
      <FormControl className={styles.counterInput}>
        <Field
          as={Input}
          name={id}
          isInvalid={isInvalid && !isDisabled}
          disabled={isDisabled}
          type="number"
        />
      </FormControl>
      <Button
        className={`${styles.counterButton} ${styles.rightButton}`}
        onClick={increase}
        disabled={isDisabled}
      >
        {`+`}
      </Button>
      {isInvalid && (
        <Tooltip label={`${handleErrorMessage(errors[id])}`} fontSize="large">
          <WarningCircle className={styles.warningIcon} />
        </Tooltip>
      )}
    </div>
  );
};

export default Counter;
