import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from '@chakra-ui/react';
import Button from '../Button/Button';
import { CheckCircle } from 'phosphor-react';

import styles from './ModalDialog.module.css';
import { useAppSelector } from '../../../redux/hooks';

interface IModalDialog {
  tittle: string;
  content: string;
  isOpen: boolean;
  closeModalDialog: () => void;
}

const ModalDialog: React.FC<IModalDialog> = ({
  tittle,
  content,
  isOpen,
  closeModalDialog,
}) => {
  const { appStrings } = useAppSelector(state => ({
    appStrings: state.settings.appStrings,
  }));

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={() => closeModalDialog()}
      >
        <ModalOverlay />
        <ModalContent className={styles.content}>
          <ModalHeader className={styles.header}>
            <CheckCircle className={styles.icon} />
            {tittle}
          </ModalHeader>
          <ModalBody className={styles.body}>{content}</ModalBody>
          <ModalFooter className={styles.footer}>
            <Button variant="outline" onClick={() => closeModalDialog()}>
              {appStrings?.Global?.back}
            </Button>
            <Button>{appStrings?.Global?.confirm}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalDialog;
