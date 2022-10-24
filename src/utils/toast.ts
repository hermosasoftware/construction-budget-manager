import { createStandaloneToast } from '@chakra-ui/react';

const toast = createStandaloneToast();

export const toastSuccess = (title: string, description: string) =>
  toast({
    title,
    description,
    status: 'success',
    duration: 3000,
    isClosable: true,
    position: 'top-right',
  });

export const toastError = (title: string, description: string) =>
  toast({
    title,
    description,
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'top-right',
  });
