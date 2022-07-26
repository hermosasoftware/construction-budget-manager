import { IStyledComponent, TObject } from './global';

export type TFormErrors<T> = Partial<{ [key in keyof T]: string }>;
export type TFormDataElement<T> = {
  name: Extract<keyof T, string>;
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
  error?: string;
}
