import {
  AlertDialog as ChakraAlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';

import styles from './AlertDialog.module.css';
import { useAppSelector } from '../../../redux/hooks';
import React from 'react';
import Button from '../Button/Button';

interface IAlertDialog {
  tittle: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const AlertDialog: React.FC<IAlertDialog> = ({
  tittle,
  content,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { appStrings } = useAppSelector(state => ({
    appStrings: state.settings.appStrings,
  }));
  const cancelRef = React.useRef(null);

  return (
    <ChakraAlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => onClose()}
    >
      <AlertDialogOverlay />
      <AlertDialogContent className={styles.content}>
        <AlertDialogHeader className={styles.header}>
          {tittle}
        </AlertDialogHeader>
        <AlertDialogBody className={styles.body}>{content}</AlertDialogBody>
        <AlertDialogFooter className={styles.footer}>
          <Button onClick={() => onClose()}>{appStrings.back}</Button>
          <Button colorScheme="red" color="white" onClick={() => onSubmit()}>
            {appStrings.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ChakraAlertDialog>
  );
};

export default AlertDialog;
