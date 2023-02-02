import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { Font } from '@react-pdf/renderer';
import App from './App';
import LangProvider from './providers/LangProvider';
import reportWebVitals from './reportWebVitals';
import { store } from './redux/store';
import { mavTheme } from './styles/theme';

import './index.css';
import './styles/theme.css';

Font.register({
  family: 'Segoe UI',
  fonts: [
    {
      src: '//c.s-microsoft.com/static/fonts/segoe-ui/west-european/normal/latest.ttf',
    },
    {
      src: '//c.s-microsoft.com/static/fonts/segoe-ui/west-european/bold/latest.ttf',
      fontWeight: 600,
    },
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={mavTheme}>
        <LangProvider>
          <App />
        </LangProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
