import {
  InputProps,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
} from '@chakra-ui/react';
import { Plus } from 'phosphor-react';
import Button from '../Button/Button';

import styles from './FileUploader.module.css';
interface IFileUploader {
  label?: string;
  buttonLabel?: String;
}

const FileUploader: React.FC<IFileUploader & InputProps> = props => {
  const { label, buttonLabel } = props;
  let hiddenInput: HTMLInputElement | null;

  return (
    <FormControl label={label}>
      {label && <FormLabel>{label}</FormLabel>}
      <Button
        variant="outline"
        className={styles.button}
        onClick={() => hiddenInput?.click()}
        rightIcon={<Plus />}
      >
        {buttonLabel}
      </Button>
      <InputGroup>
        <Input
          hidden
          type="file"
          ref={inputFile => (hiddenInput = inputFile)}
        />
      </InputGroup>
    </FormControl>
  );
};

export default FileUploader;
