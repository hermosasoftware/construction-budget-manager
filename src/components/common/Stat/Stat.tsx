import {
  Stat as ChakraStat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import React from 'react';
import { IStyledComponent } from '../../../types/global';

import styles from './Stat.module.css';

interface IStat extends IStyledComponent {
  title: string;
  content: string;
  helpText?: string;
}

const Stat: React.FC<IStat> = props => {
  const { className, style, title, content, helpText } = props;

  return (
    <div className={`${styles.stat__container} ${className}`} style={style}>
      <ChakraStat>
        <StatLabel>{title}</StatLabel>
        <StatNumber className={styles.msg_wrapper}>{content}</StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
      </ChakraStat>
    </div>
  );
};

export default Stat;
