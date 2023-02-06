import { FC } from 'react';
import { Page as PdfPage } from '@react-pdf/renderer';
import { composePDF, composePreview } from './compose';

interface Props {
  className?: string;
  pdfMode?: boolean;
}

const Page: FC<Props> = ({ className, pdfMode, children }) => {
  return (
    <>
      {pdfMode ? (
        <PdfPage
          size="A4"
          style={composePDF('page ' + (className ? className : ''))}
        >
          {children}
        </PdfPage>
      ) : (
        <div className={composePreview('page ' + (className ? className : ''))}>
          {children}
        </div>
      )}
    </>
  );
};

export default Page;
