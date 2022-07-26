import React from 'react';
import * as yup from 'yup';

export type TAppLang = 'es' | 'en';
export type TObjectKey = string | number | symbol;
export type TObject<V = any, K extends TObjectKey = string> = {
  [key in K]: V;
};
export type TChildren = React.ReactNode | React.ReactElement | JSX.Element;

export interface IStyledComponent {
  className?: string;
  style?: React.CSSProperties;
}

export type TValidationSchema = yup.ObjectSchema<any>;
