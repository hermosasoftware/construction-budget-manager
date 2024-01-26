import { IService } from '../types/service';
import { toastError } from '../utils/toast';

// Exchange API URL
const apiUrl = 'https://tipodecambio.paginasweb.cr/api';

export const getDollarExchange = ({
  appStrings,
  successCallback,
  errorCallback,
}: IService) => {
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      successCallback && successCallback(data?.venta);
    })
    .catch(errorMessage => {
      toastError(appStrings.errorWhileLogIn, errorMessage);
      errorCallback && errorCallback();
    });
};
