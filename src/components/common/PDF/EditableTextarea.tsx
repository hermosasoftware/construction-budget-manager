import { FC } from 'react';
import { Text } from '@react-pdf/renderer';
import { composePDF, composePreview } from './compose';
import { Textarea } from '@chakra-ui/react';

interface Props {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  pdfMode?: boolean;
}

const EditableTextarea: FC<Props> = ({
  className,
  placeholder,
  value,
  onChange,
  pdfMode,
}) => {
  return (
    <>
      {pdfMode ? (
        <Text style={composePDF('span ' + (className ? className : ''))}>
          {value || '...'}
        </Text>
      ) : (
        <Textarea
          className={composePreview('input ' + (className ? className : ''))}
          placeholder={placeholder || '...'}
          value={value || ''}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          size="sm"
        />
      )}
    </>
  );
};

export default EditableTextarea;
