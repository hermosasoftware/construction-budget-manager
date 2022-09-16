import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProjectsByName,
  getProjectsByStatus,
} from '../../../services/ProjectService';
import { IProject } from '../../../types/project';
import SearchInput from '../../common/SearchInput/SearchInput';
import TabGroup from '../../common/TabGroup/TabGroup';
import TableView from '../../common/TableView/TableView';
import { tableHeader } from '../PlayGround';
import styles from './Projects.module.css';

export default function Projects() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const toast = useToast();

  const handleSearch = async (event: { target: { value: String } }) => {
    const [errors, resProjects] = await getProjectsByName(event.target.value);
    if (!errors) {
      setProjects(resProjects);
    } else {
      toast({
        title: 'Error al extraer la informacion',
        description: errors + '',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  useEffect(() => {
    const getProjects = async (status: boolean) => {
      const [errors, resProjects] = await getProjectsByStatus(status);
      if (!errors) {
        setProjects(resProjects);
      } else {
        toast({
          title: 'Error al extraer la informacion',
          description: errors + '',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    };
    getProjects(true);
  }, [toast]);

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
      <SearchInput onChange={handleSearch}></SearchInput>
      <TableView
        headers={tableHeader}
        items={projects as []}
        boxStyle={{ width: '95%', margin: '20px 0 0 20px' }}
      />
    </div>
  );
}
