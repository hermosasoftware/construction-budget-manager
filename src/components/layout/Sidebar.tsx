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
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchInput from '../common/SearchInput/SearchInput';
import MenuBar from './MenuBar';
import menuItems from '../../config/sidebarItems';
import { useAppSelector } from '../../redux/hooks';
import { List } from 'phosphor-react';
import { useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { ReactComponent as Logo } from '../../assets/img/coto-logo.svg';

import styles from './Sidebar.module.css';
import { useDispatch } from 'react-redux';
import { auth } from '../../config/firebaseConfig';
import { logout } from '../../redux/reducers/sessionSlice';

const smVariant = { navigation: 'drawer', navigationButton: true };
const mdVariant = { navigation: 'sidebar', navigationButton: false };

const blacklist = ['/login', '/signup', '/forgot-password'];

const Sidebar = () => {
  const location = useLocation();
  const { appStrings } = useAppSelector(state => ({
    ...state.settings,
  }));

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const SideBarContent = () => (
    <Box className={styles.sideBar}>
      <Stack className={styles.sideBar_container}>
        <Stack className="center-content-cross">
          <Logo className={styles.logo} />
          <SearchInput placeholder={appStrings?.search} />
          <MenuBar menuItems={menuItems(appStrings)} />
        </Stack>

        <HStack className={styles.account}>
          <Image
            className={styles.account_image}
            src="https://picsum.photos/24/24"
          />
          <VStack className={styles.account_info}>
            <Text>{appStrings?.testUserName}</Text>
            <Text className={styles.account_job__text}>
              {appStrings?.testUserJob}
            </Text>
          </VStack>
          <Button onClick={singOut}>{appStrings?.logOut}</Button>
        </HStack>
      </Stack>
    </Box>
  );

  const shouldBeDisplayed = !blacklist.includes(location.pathname);

  const singOut = () => {
    dispatch(logout());
    auth.signOut();
    navigate('/login');
  };

  return shouldBeDisplayed ? (
    variants?.navigation === 'sidebar' ? (
      <SideBarContent />
    ) : (
      <>
        <Drawer isOpen={isSidebarOpen} placement="top" onClose={toggleSidebar}>
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
    )
  ) : null;
};

export default Sidebar;
