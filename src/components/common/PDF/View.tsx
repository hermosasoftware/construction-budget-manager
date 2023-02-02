import { FC } from 'react';
import { View as PdfView } from '@react-pdf/renderer';
import { composePDF, composePreview } from './compose';

interface Props {
  className?: string;
  pdfMode?: boolean;
}

const View: FC<Props> = ({ className, pdfMode, children }) => {
  return (
    <>
      {pdfMode ? (
        <PdfView style={composePDF('view ' + (className ? className : ''))}>
          {children}
        </PdfView>
      ) : (
        <div className={composePreview('view ' + (className ? className : ''))}>
          {children}
        </div>
      )}
    </>
  );
};

export default View;
