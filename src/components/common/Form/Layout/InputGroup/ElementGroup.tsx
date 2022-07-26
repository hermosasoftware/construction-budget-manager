import React from 'react';

import styles from './ElementGroup.module.css';

interface IElementGroup {}

const ElementGroup: React.FC<IElementGroup> = props => {
  const { children } = props;
  return <div className={`flex ${styles.input_group}`}>{children}</div>;
};

export default ElementGroup;
