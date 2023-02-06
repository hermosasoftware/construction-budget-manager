import ReactPDF from '@react-pdf/renderer';
import styles from '../../../styles/PDF/PDFStyles';
import stylesPreview from '../../../styles/PDF/PDFPreview.module.css';

export const composePDF = (classes: string): ReactPDF.Styles => {
  const css: ReactPDF.Styles = {};

  const classesArray: string[] = classes.replace(/\s+/g, ' ').split(' ');

  classesArray.forEach(className => {
    if (typeof styles[className] !== 'undefined') {
      Object.assign(css, styles[className]);
    }
  });

  return css;
};

export const composePreview = (classes: string) => {
  let css = '';

  const classesArray: string[] = classes.replace(/\s+/g, ' ').split(' ');

  classesArray.forEach(className => {
    if (typeof stylesPreview?.[className] !== 'undefined') {
      css += stylesPreview?.[className] + ' ';
    }
  });

  return css;
};
