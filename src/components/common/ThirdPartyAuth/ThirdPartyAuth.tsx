import React from 'react';
import { AppleLogo, GoogleLogo } from 'phosphor-react';
import { IStyledComponent } from '../../../types/global';
import { useAppSelector } from '../../../redux/hooks';
import Button from '../Button/Button';

import styles from './ThirdPartyAuth.module.css';

interface IThirdPartyAuth extends IStyledComponent {}

const ThirdPartyAuth: React.FC<IThirdPartyAuth> = props => {
  const { className, style } = props;
  const appStrings = useAppSelector(state => state.settings.appStrings);

  return (
    <div
      className={`center-content-cross ${styles.main_container} ${className}`}
      style={style}
    >
      <p className={styles.content_label}>
        {appStrings?.Auth?.continueWithSocials}
      </p>
      <div className={`center-content ${styles.content_container}`}>
        <Button variant="outline" shape="max-rounded">
          <GoogleLogo size={16} />
        </Button>
        <Button variant="outline" shape="max-rounded">
          <AppleLogo size={16} weight="fill" />
        </Button>
      </div>
    </div>
  );
};

export default ThirdPartyAuth;
