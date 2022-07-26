import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changeAppStrings } from '../redux/reducers/settingsSlice';
import { TAppLang } from '../types/global';

import en from '../assets/i18n/languages/en.json';
import es from '../assets/i18n/languages/es.json';

const LangProvider: React.FC<{}> = props => {
  const dispatch = useAppDispatch();
  const appLang = useAppSelector(state => state.settings.appLang);
  const [langLoaded, setLangLoaded] = useState(false);

  const appString = useMemo(() => {
    switch (appLang) {
      case 'en':
        return en;
      case 'es':
      default:
        return es;
    }
  }, [appLang]);

  useEffect(() => {
    dispatch(changeAppStrings(appString));
    if (!langLoaded) {
      setLangLoaded(true);
    }
  }, [appString]);

  return <>{langLoaded ? props.children : null}</>;
};

export const supportedLangs: Array<TAppLang> = ['es', 'en'];

export default LangProvider;
