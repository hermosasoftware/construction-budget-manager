import React from 'react';
import TabGroup from '../../common/TabGroup/TabGroup';
import TableView from '../../common/TableView/TableView';
import { tableData, tableHeader } from '../PlayGround';
import styles from './Projects.module.css';

export default function Projects() {
  return (
    <div className={`${styles.projects_container}`}>
      <h1 className={`${styles.title}`}>Proyectos</h1>
      <TabGroup
        className={`${styles.tabs}`}
        tabs={[
          { id: 'product', name: 'Proyectos Activos', selected: true },
          { id: 'services', name: 'Proyectos Inactivos' },
        ]}
        onSelectedTabChange={activeTabs =>
          console.log('Single - Active Tabs: ', activeTabs)
        }
      />
      <TableView
        headers={tableHeader}
        items={tableData}
        boxStyle={{ width: '95%', margin: '20px 0 0 20px' }}
      />
    </div>
  );
}
