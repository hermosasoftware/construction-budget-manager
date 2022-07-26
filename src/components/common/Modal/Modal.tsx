import React, { ReactElement } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
} from '@chakra-ui/react';

import styles from './Modal.module.css';

interface IModal extends DrawerProps {
  showCloseButton?: boolean;
  modalHeader?: ReactElement | string;
  removeBodyPadding?: boolean;
}

const Modal: React.FC<IModal> = props => {
  const {
    children,
    isOpen,
    placement = 'right',
    size = 'md',
    showCloseButton,
    modalHeader,
    onClose,
    removeBodyPadding,
  } = props;

  const ModalBody = (
    <DrawerBody
      className={`${styles.modal_body} ${
        removeBodyPadding ? styles.no_body_padding : ''
      }`}
    >
      {children}
    </DrawerBody>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement={placement} size={size}>
      <DrawerOverlay />
      <DrawerContent>
        {showCloseButton && (
          <DrawerCloseButton className={styles.modal__close_btn} />
        )}
        {modalHeader ? (
          <>
            <DrawerHeader className={styles.modal_header}>
              {modalHeader}
            </DrawerHeader>
            {ModalBody}
          </>
        ) : (
          ModalBody
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default Modal;
