import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Text, HStack, VStack } from '@chakra-ui/react';
import { Plus } from 'phosphor-react';
import { IMenuItems } from '../../types/sidebar';

import styles from './MenuBar.module.css';

interface IMenuBarProps {
  menuItems: IMenuItems[];
}

const MenuBar: React.FC<IMenuBarProps> = ({ menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [optionSelected, setOptionSelected] = useState<String>(
    `/${location.pathname.split('/')[1]}`,
  );

  function handleClick(redirectTo: String) {
    navigate(redirectTo.toString());
  }

  useEffect(() => {
    setOptionSelected(`/${location.pathname.split('/')[1]}`);
  }, [location.pathname]);

  return (
    <VStack className={styles.menu_container}>
      {menuItems.map(menuItem => (
        <VStack
          key={`menu-item-${menuItem.id}`}
          className={styles.menu_section}
        >
          <Text className={styles.menu_tittle}>{menuItem.title}</Text>
          {menuItem.options.map(option => (
            <HStack
              key={`menu-option-${option.name}`}
              className={styles.menu_item}
              onClick={() => handleClick(option.redirectTo)}
            >
              <Text
                className={`${styles.item_text} ${
                  option.hasIcon ? styles.item_text__width : ''
                } ${
                  optionSelected === option.redirectTo
                    ? styles.item_text__selected
                    : ''
                }`}
              >
                {option.name}
              </Text>
              {option.hasIcon ? <Plus /> : null}
            </HStack>
          ))}
        </VStack>
      ))}
    </VStack>
  );
};

export default MenuBar;
