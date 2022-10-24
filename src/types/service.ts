import { TObject } from './global';

export interface IService {
  appStrings: TObject<any, string>;
  successCallback?: Function;
  errorCallback?: Function;
}
