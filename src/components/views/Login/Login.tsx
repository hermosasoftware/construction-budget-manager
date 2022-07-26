import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import BrandPoster from '../../common/BrandPoster/BrandPoster';
import ThirdPartyAuth from '../../common/ThirdPartyAuth/ThirdPartyAuth';
import ToggleGroup from '../../common/ToggleGroup/ToggleGroup';
import LoginForm, { ILoginFormData } from '../../forms/LoginForm/LoginForm';
import { logIn } from '../../../services/authService';
import { changeUser } from '../../../redux/reducers/sessionSlice';
import { useToast } from '@chakra-ui/react';

import styles from './Login.module.css';

interface ILogin {}

const LogIn: React.FC<ILogin> = props => {
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const toggleOptions = [
    { id: 'login', name: appStrings?.Auth?.logIn },
    {
      id: 'signUp',
      name: appStrings?.Auth?.signUpFree,
      onClick: () => navigate('/signup'),
    },
  ];

  const handleOnFormSubmit = async (data: ILoginFormData) => {
    const { id, email, password } = data;
    const [errors, user] = await logIn(id || email, password);
    if (!errors && user) {
      dispatch(changeUser(user));
      navigate('/onboarding');
    } else {
      toast({
        title: appStrings?.Global?.errorWhileLogIn,
        description: errors,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <div className="fill-parent flex">
      <BrandPoster />
      <div
        className={`fill-parent center-content scroll ${styles.login__content}`}
      >
        <div className={`center-content ${styles.login__form_container}`}>
          <ToggleGroup selectedOption="login" options={toggleOptions} />
          <LoginForm
            className={styles.login__form}
            onSubmit={handleOnFormSubmit}
          />
          <ThirdPartyAuth className={styles.login__third_parties} />
        </div>
      </div>
    </div>
  );
};

export default LogIn;
