import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import BrandPoster from '../../common/BrandPoster/BrandPoster';
import ThirdPartyAuth from '../../common/ThirdPartyAuth/ThirdPartyAuth';
import LoginFormEmail, {
  ILoginFormEmailData,
} from '../../forms/LoginForm/LoginFormEmail';
import LoginFormPassword, {
  ILoginFormPasswordData,
} from '../../forms/LoginForm/LoginFormPassword';
import { logIn, verifyEmail } from '../../../providers/userAuthContextProvider';

import { useToast } from '@chakra-ui/react';

import styles from './Login.module.css';

interface ILogin {}

const LogIn: React.FC<ILogin> = props => {
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const toast = useToast();
  const [LoginPhase, setLoginPhase] = useState('email');
  const [Email, setEmail] = useState('');

  const handleOnFormSubmit = async (data: ILoginFormEmailData) => {
    const { email } = data;
    const response = await verifyEmail(email);
    console.log(response);
    if (!response) {
      // dispatch(changeUser(user));
      setLoginPhase('password');
      setEmail(email);
      //navigate('/onboarding');
    } else {
      toast({
        title: appStrings?.Global?.errorWhileLogIn,
        description: response,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };
  const handleOnFormSubmit2 = async (data: ILoginFormPasswordData) => {
    const { password } = data;
    const [errors, user] = await logIn(Email, password);
    if (!errors && user) {
      // dispatch(changeUser(user));

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
          {LoginPhase === 'email' ? (
            <LoginFormEmail
              className={styles.login__form}
              onSubmit={handleOnFormSubmit}
            />
          ) : (
            <LoginFormPassword
              className={styles.login__form}
              onSubmit={handleOnFormSubmit2}
            />
          )}
          <ThirdPartyAuth className={styles.login__third_parties} />
        </div>
      </div>
    </div>
  );
};

export default LogIn;
