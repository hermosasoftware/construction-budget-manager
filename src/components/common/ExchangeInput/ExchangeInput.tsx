import React from 'react';
import { ButtonProps, Text, Flex, VStack } from '@chakra-ui/react';
import { Check, Pencil } from 'phosphor-react';
import { useAppSelector } from '../../../redux/hooks';
import { IStyledComponent } from '../../../types/global';
import Button from '../Button/Button';
import Input from '../Form/Elements/Input';

import styles from './ExhangeInput.module.css';

interface IStat extends IStyledComponent {
  editExchange: boolean;
}

const Stat: React.FC<IStat & ButtonProps> = props => {
  const { className, style, editExchange, isDisabled, ...rest } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  return (
    <div className={`${styles.stat__container} ${className}`} style={style}>
      <VStack align="start">
        <Text as="sup" style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
          {appStrings.currencyExchange}
        </Text>
        <Flex>
          <Input
            isDisabled={!editExchange}
            icon={'₡'}
            type="number"
            name="exchange"
            containerStyle={{ width: '90px' }}
          />

          {editExchange && (
            <Button type="submit" style={{ height: 40 }}>
              <Check size={20} />
            </Button>
          )}
          {!editExchange && (
            <Button {...rest} style={{ height: 40 }} isDisabled={isDisabled}>
              <Pencil size={20} />
            </Button>
          )}
        </Flex>
      </VStack>
    </div>
  );
};

export default Stat;
