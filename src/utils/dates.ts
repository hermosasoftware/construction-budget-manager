import DateUtils from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { TAppLang } from '../types/global';

require('dayjs/locale/es');
DateUtils.extend(customParseFormat);

export const isDate = (date: any) => {
  return (
    DateUtils.isDayjs(date) ||
    Object.prototype.toString.call(date) === '[object Date]'
  );
};

export const isValidDate = (
  date: any,
  lang: TAppLang,
  opts?: { format?: string; strict?: boolean },
): Date | boolean => {
  const { format, strict } = opts ?? {};
  let parsedDate;
  if (typeof date === 'string') {
    parsedDate = DateUtils(date, format ?? 'YYYY-MM-DD', lang, strict);
  } else if (isDate(date) || typeof date === 'number') {
    parsedDate = DateUtils(date);
  }
  return parsedDate?.isValid() ? parsedDate.toDate() : false;
};

export const formatDate = (date?: Date | string, format?: string) => {
  if (typeof date === 'string') return date;
  if (!date || !format) return 'undefined date';
  return DateUtils(date).format(format).toString();
};
