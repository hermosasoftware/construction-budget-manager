import { SystemStyleObject } from '@chakra-ui/react';
import React from 'react';
import { IStyledComponent, TObject } from './global';

export type TFormErrors<T> = Partial<{ [key in keyof T]: string }>;
export type TFormDataElement<T> = {
  name: string; //Extract<keyof T, string>; - Need to review this with Chris
  value: any;
};

export interface IFormElementProps<T extends TObject = TObject> {
  name: string;
  innerId?: string;
  innerClassName?: IStyledComponent['className'];
  innerStyle?: IStyledComponent['style'];
  value?: any;
  onChange?: (data: TFormDataElement<T>) => void;
  onBlur?: (data: TFormDataElement<T>) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  error?: string;
  sx?: SystemStyleObject;
}
