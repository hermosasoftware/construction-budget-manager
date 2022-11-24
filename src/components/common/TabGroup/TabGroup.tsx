import React, { useEffect, useMemo } from 'react';
import useToggleGroup, { TToggles } from '../../../hooks/useToggleGroup';
import { IStyledComponent } from '../../../types/global';

import styles from './TabGroup.module.css';

export type TTab = {
  id: string;
  name: string;
  selected?: boolean;
  isDisable?: boolean;
};

interface ITabGroup extends IStyledComponent {
  tabs: Array<TTab>;
  selectionType?: 'single' | 'multiple';
  variant?: 'rounded' | 'default';
  onSelectedTabChange?: (activeTabs: Array<string>) => void;
}

const buildTogglesInfo = (tabs: Array<TTab>) => {
  const togglesInfo: TToggles = {};
  tabs.forEach(tab => {
    togglesInfo[tab.id] = !!tab.selected;
  });
  return togglesInfo;
};

const TabGroup: React.FC<ITabGroup> = props => {
  const {
    tabs = [],
    selectionType = 'single',
    variant = 'default',
    onSelectedTabChange,
    className,
    style,
  } = props;

  const togglesInfo = useMemo(() => buildTogglesInfo(tabs), [tabs]);

  const { toggles, toggle, uniqueToggleOn } = useToggleGroup(togglesInfo);

  const handleTabClick = (tabId: string) => {
    if (selectionType === 'multiple') {
      toggle(tabId);
    } else {
      uniqueToggleOn(tabId);
    }
  };

  useEffect(() => {
    if (onSelectedTabChange) {
      const selectedTabIds: Array<string> = [];
      tabs.forEach(tab => {
        if (toggles[tab.id]) {
          selectedTabIds.push(tab.id);
        }
      });
      onSelectedTabChange(selectedTabIds);
    }
  }, [toggles, tabs]);

  return (
    <div
      className={`center-content-cross ${styles.tab_group} ${className}`}
      style={style}
      role="tablist"
    >
      {tabs?.map(tab => (
        <div
          key={`tab-group-option-${tab.id}`}
          role="tab"
          className={`${styles.tab_group__option} ${
            toggles[tab.id] ? styles?.[variant] : ''
          } ${tab.isDisable ? styles?.disabled : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          <p>{tab.name}</p>
        </div>
      ))}
    </div>
  );
};

export default TabGroup;
