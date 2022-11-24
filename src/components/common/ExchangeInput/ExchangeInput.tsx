import React from 'react';
import { ButtonProps, Flex } from '@chakra-ui/react';
import { Coins, Check, Pencil } from 'phosphor-react';
import { IStyledComponent } from '../../../types/global';
import Button from '../Button/Button';
import Input from '../Form/Elements/Input';

import styles from './ExhangeInput.module.css';

interface IStat extends IStyledComponent {
  editExchange: boolean;
}

const Stat: React.FC<IStat & ButtonProps> = props => {
  const { className, style, editExchange, isDisabled, ...rest } = props;

  return (
    <div className={`${styles.stat__container} ${className}`} style={style}>
      <Flex>
        <Input
          isDisabled={!editExchange}
          icon={<Coins size={20}></Coins>}
          type="number"
          name="exchange"
          containerStyle={{ width: '100px' }}
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
    </div>
  );
};

export default Stat;
