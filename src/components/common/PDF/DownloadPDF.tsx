import { FC, useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { composePreview } from './compose';

interface Props {
  fileName: string;
}

const Download: FC<Props> = ({ fileName, children }) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(false);

    const timeout = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [fileName, children]);

  return (
    <div
      className={composePreview('download-pdf ' + (!show ? 'loading' : ''))}
      title="Save PDF"
    >
      {show && (
        <PDFDownloadLink
          document={<>{children}</>}
          fileName={`${fileName}.pdf`}
          aria-label="Save PDF"
        ></PDFDownloadLink>
      )}
    </div>
  );
};

export default Download;
