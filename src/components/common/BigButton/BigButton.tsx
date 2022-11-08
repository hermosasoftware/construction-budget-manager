import React from 'react';
import { Text, VStack, BoxProps, Flex } from '@chakra-ui/react';

import styles from './BigButton.module.css';

interface IBigButtonProps {
  title: string;
  description?: string;
  illustration?: React.ReactElement;
  imageSRC?: string;
  onboardingCompletedSteps?: number;
}

const BigButton: React.FC<IBigButtonProps & BoxProps> = props => {
  const {
    title,
    description,
    illustration,
    imageSRC,
    onboardingCompletedSteps,
    ...rest
  } = props;

  const buildClassNames = (): string => {
    let className: string = styles.big_button;
    if (
      onboardingCompletedSteps !== undefined &&
      onboardingCompletedSteps < 3
    ) {
      className += ` ${styles.incomplete_steps}`;
    }
    return className;
  };

  return (
    <Flex className={buildClassNames()} role="button" {...rest}>
      <VStack className={`center-content ${styles.left_container}`}>
        <Text className={styles.left_container__title}>{title}</Text>
        {!!description && (
          <Text
            className={`${styles.left_container__subtitle} ${styles.msg_wrapper}`}
          >
            {description}
          </Text>
        )}
      </VStack>
      <VStack className={`center-content`}>
        {illustration}
        {onboardingCompletedSteps !== undefined && (
          <Text className={styles.right_container__current_step}>
            {onboardingCompletedSteps}/3
          </Text>
        )}
      </VStack>
    </Flex>
  );
};

export default BigButton;
