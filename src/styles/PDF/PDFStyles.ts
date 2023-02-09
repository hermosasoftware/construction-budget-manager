import { CSSProperties } from 'react';

interface CSSClasses {
  [key: string]: CSSProperties;
}

const colorDark = '#222';
const colorDark2 = '#666';
const colorGray = '#e3e3e3';
const colorWhite = '#fff';

const styles: CSSClasses = {
  dark: {
    color: colorDark,
  },

  white: {
    color: colorWhite,
  },

  'bg-dark': {
    backgroundColor: colorDark2,
  },

  'bg-gray': {
    backgroundColor: colorGray,
  },

  flex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },

  'w-auto': {
    flex: 1,
    paddingRight: '8px',
  },

  'ml-30': {
    flex: 1,
  },

  'w-100': {
    width: '100%',
  },

  'w-80': {
    width: '80%',
  },

  'w-60': {
    width: '60%',
  },

  'w-55': {
    width: '55%',
  },

  'w-50': {
    width: '50%',
  },

  'w-45': {
    width: '45%',
  },

  'w-48': {
    width: '48%',
  },

  'w-40': {
    width: '40%',
  },

  'w-20': {
    width: '20%',
  },

  'w-18': {
    width: '18%',
  },

  'w-17': {
    width: '17%',
  },

  'w-15': {
    width: '15%',
  },

  'w-10': {
    width: '10%',
  },

  row: {
    borderBottom: `1px solid ${colorGray}`,
  },

  'mt-100': {
    marginTop: '100px',
  },

  'mt-40': {
    marginTop: '40px',
  },

  'mt-30': {
    marginTop: '30px',
  },

  'mt-20': {
    marginTop: '20px',
  },

  'mt-10': {
    marginTop: '10px',
  },

  'mb-5': {
    marginBottom: '5px',
  },

  'p-4-8': {
    padding: '4px 8px',
  },

  'p-5': {
    padding: '5px',
  },

  'pb-10': {
    paddingBottom: '10px',
  },

  left: {
    textAlign: 'left',
  },
  center: {
    textAlign: 'center',
  },

  right: {
    textAlign: 'right',
  },

  bold: {
    fontWeight: 'bold',
  },

  'fs-10': {
    fontSize: '10pt',
  },

  'fs-20': {
    fontSize: '20pt',
  },

  'fs-30': {
    fontSize: '30pt',
  },

  'fs-45': {
    fontSize: '45pt',
  },

  page: {
    fontFamily: 'Segoe UI',
    fontSize: '11pt',
    color: '#555',
    padding: '40px 35px',
  },

  span: {
    padding: '4px 0 4px 0',
  },

  logo: {
    display: 'block',
  },
};

export default styles;
