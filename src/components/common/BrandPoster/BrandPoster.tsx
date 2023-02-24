import React from 'react';
import { IStyledComponent } from '../../../types/global';
import { ReactComponent as Logo } from '../../../assets/img/coto-logo.svg';

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
        <Logo className={styles.mav_logo} />
      </div>
    </div>
  );
};

export default BrandPoster;
