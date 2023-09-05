const numberFormat = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: 'currency',
};

export const colonFormat = (number: number) =>
  number.toLocaleString('es-CR', {
    ...numberFormat,
    currency: 'CRC',
  });

export const dolarFormat = (number: number) =>
  number.toLocaleString('en-US', {
    ...numberFormat,
    currency: 'USD',
  });

export const isCurrency = (text: string) =>
  Number(text?.includes('₡') || text?.includes('$'));

export const currencyToNumber = (text: string) =>
  Number(
    text?.includes('₡')
      ? text?.replace(/[^0-9,-]/g, '')?.replace(/,/g, '.')
      : text?.replace(/[^0-9-.]/g, ''),
  );
