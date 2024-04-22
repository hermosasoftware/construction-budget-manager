import {
  Stack,
  Text,
  VStack,
  Image,
  HStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  Box,
  Button,
  useColorModeValue,
  Spacer,
} from '@chakra-ui/react';
import { Outlet, useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import menuItems from '../../config/sidebarItems';
import { useAppSelector } from '../../redux/hooks';
import { List } from 'phosphor-react';
import { useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { ReactComponent as Logo } from '../../assets/img/coto-logo.svg';
import { auth } from '../../config/firebaseConfig';
import { listenersList } from '../../services/herperService';
import { isAdmin } from '../../utils/permisions';

import styles from './Sidebar.module.css';

const smVariant = { navigation: 'drawer', navigationButton: true };
const mdVariant = { navigation: 'sidebar', navigationButton: false };

const Sidebar = () => {
  const { appStrings } = useAppSelector(state => ({
    ...state.settings,
  }));
  const sessionUser = useAppSelector(state => state.session.user);
  const navigate = useNavigate();
  const bg = useColorModeValue(
    'var(--chakra-colors-side_bar_background)',
    'var(--chakra-colors-side_bar_background_dark)',
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const SideBarContent = () => (
    <Box className={styles.sideBar} bg={bg}>
      <Stack className={styles.sideBar_container}>
        <Stack className="center-content-cross">
          <Logo className={styles.logo} />
          <MenuBar
            menuItems={menuItems(appStrings, isAdmin(sessionUser!))}
            toggleSidebar={toggleSidebar}
          />
        </Stack>

        <HStack className={styles.account}>
          <Image
            className={styles.account_image}
            src="https://picsum.photos/24/24"
          />
          <VStack className={styles.account_info}>
            <Text>{sessionUser?.name}</Text>
            <Text className={styles.account_job__text}>
              {appStrings[sessionUser?.role!]}
            </Text>
          </VStack>
          <Spacer />
          <Button onClick={singOut}>{appStrings?.logOut}</Button>
        </HStack>
      </Stack>
    </Box>
  );

  const singOut = async () => {
    for await (const listener of listenersList) {
      await listener.stop();
    }
    await auth.signOut();
    navigate('/login');
  };

  return (
    <>
      {variants?.navigation === 'sidebar' ? (
        <SideBarContent />
      ) : (
        <>
          <Drawer
            isOpen={isSidebarOpen}
            placement="top"
            onClose={toggleSidebar}
          >
            <DrawerOverlay />
            <DrawerContent>
              <SideBarContent />
            </DrawerContent>
          </Drawer>
          <List
            className={styles.sidebar_icon}
            size={40}
            weight="fill"
            onClick={toggleSidebar}
          />
        </>
      )}
      <Outlet />
    </>
  );
};

export default Sidebar;
