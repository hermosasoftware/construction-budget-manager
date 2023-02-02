import { FC } from 'react';
import { Text as PdfText } from '@react-pdf/renderer';
import { composePDF, composePreview } from './compose';

interface Props {
  className?: string;
  pdfMode?: boolean;
  children?: string;
}

const Text: FC<Props> = ({ className, pdfMode, children }) => {
  return (
    <>
      {pdfMode ? (
        <PdfText style={composePDF('span ' + (className ? className : ''))}>
          {children}
        </PdfText>
      ) : (
        <span
          className={composePreview('span ' + (className ? className : ''))}
        >
          {children}
        </span>
      )}
    </>
  );
};

export default Text;
