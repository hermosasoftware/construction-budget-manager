import React from 'react';
import { ButtonProps, Text, Flex, VStack } from '@chakra-ui/react';
import { Check, Pencil } from 'phosphor-react';
import { useAppSelector } from '../../../redux/hooks';
import { IStyledComponent } from '../../../types/global';
import Button from '../Button/Button';
import Input from '../Form/Elements/Input';

import styles from './AdminFeeInput.module.css';

interface IStat extends IStyledComponent {
  editAdminFee: boolean;
}

const Stat: React.FC<IStat & ButtonProps> = props => {
  const { className, style, editAdminFee, isDisabled, ...rest } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  return (
    <div className={`${styles.stat__container} ${className}`} style={style}>
      <VStack align="start">
        <Text as="sup" style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
          {appStrings.adminFee}
        </Text>
        <Flex>
          <Input
            isDisabled={!editAdminFee}
            icon={'%'}
            type="number"
            name="adminFee"
            containerStyle={{ width: '90px' }}
          />

          {editAdminFee && (
            <Button type="submit" style={{ height: 40 }}>
              <Check size={20} />
            </Button>
          )}
          {!editAdminFee && (
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
