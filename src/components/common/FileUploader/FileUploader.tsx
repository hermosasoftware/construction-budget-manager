import { InputProps, InputGroup, Input } from '@chakra-ui/react';
import { Pencil, Plus } from 'phosphor-react';
import { useContext, useMemo, useState } from 'react';
import FormControl, {
  IFormControl,
} from '../Form/Layout/FormControl/FormControl';
import { useAppSelector } from '../../../redux/hooks';
import { IFormElementProps } from '../../../types/forms';
import Button from '../Button/Button';
import { FormContext } from '../Form/Form';

import styles from './FileUploader.module.css';

export enum EFileTypes {
  any = '',
  image = 'image/*',
  video = 'video/*',
  audio = 'audio/*',
  pdf = '.pdf',
  xml = '.xml',
}
interface IFileUploader extends IFormControl, IFormElementProps {
  buttonLabel?: String;
  acceptedFiles?: EFileTypes[];
}

const FileUploader: React.FC<IFileUploader & InputProps> = props => {
  const formControlProps: IFormControl = props;
  const {
    name,
    label,
    buttonLabel,
    acceptedFiles = [EFileTypes.any],
    innerId,
    error,
    onChange,
  } = props;

  const { formId, errors, handleOnChange } = useContext(FormContext);

  const appStrings = useAppSelector(state => state.settings.appStrings);

  const [isUploaded, setIsUploaded] = useState<any>();

  const inputAcceptedFiles = useMemo<string>(() => {
    return acceptedFiles?.join(', ');
  }, [acceptedFiles]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = event.target.files?.[0];
      setIsUploaded(value);
      if (onChange) onChange({ name, value });
      else if (handleOnChange) handleOnChange({ name, value });
    } catch (err) {
      console.error(err);
    }
  };

  const uuid = innerId || `${formId}-${name}`;
  let hiddenInput: HTMLInputElement | null;

  return (
    <FormControl
      innerId={uuid}
      label={label}
      errorMessage={error || errors[name]}
      {...formControlProps}
    >
      <Button
        variant="ghost_outlined"
        className={`${styles.button} ${isUploaded ? styles.isUploaded : ''}`}
        onClick={() => hiddenInput?.click()}
        rightIcon={!isUploaded ? <Plus /> : <Pencil weight="fill" />}
      >
        {!isUploaded ? buttonLabel : appStrings.fileLoaded}
      </Button>
      <InputGroup>
        <Input
          name={name}
          hidden
          type="file"
          accept={inputAcceptedFiles}
          ref={inputFile => (hiddenInput = inputFile)}
          onChange={upload}
        />
      </InputGroup>
    </FormControl>
  );
};

export default FileUploader;
