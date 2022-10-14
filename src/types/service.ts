import { TObject } from './global';

export interface IService {
  toast: Function;
  appStrings: TObject<any, string>;
  successCallback?: Function;
  errorCallback?: Function;
}
