import React from 'react';
import { IStyledComponent } from '../../../types/global';
import { ReactComponent as MavLogo } from '../../../assets/img/mav-logo.svg';

import styles from './BrandPoster.module.css';

interface IBrandPoster extends IStyledComponent {}

const BrandPoster: React.FC<IBrandPoster> = props => {
  const { className, style } = props;

  return (
    <div
      className={`fill-parent-vertical ${styles.brand_poster__container} ${className}`}
      style={style}
    >
      <div
        className={`center-content fill-parent-vertical ${styles.brand_poster}`}
      >
        <MavLogo className={styles.mav_logo} />
      </div>
    </div>
  );
};

export default BrandPoster;
