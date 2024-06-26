import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import BrandPoster from '../../common/BrandPoster/BrandPoster';
import LoginFormEmail, {
  ILoginFormEmailData,
} from '../../forms/LoginForm/LoginFormEmail';
import LoginFormPassword, {
  ILoginFormPasswordData,
} from '../../forms/LoginForm/LoginFormPassword';
import { logIn, verifyEmail } from '../../../providers/userAuthContextProvider';
import Button from '../../common/Button/Button';

import styles from './Login.module.css';

interface ILogin {}

const LogIn: React.FC<ILogin> = props => {
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const appUser = useAppSelector(state => state.session.user);
  const [loginPhase, setLoginPhase] = useState('email');
  const [email, setEmail] = useState('');

  const handleOnEmailSubmit = async (data: ILoginFormEmailData) => {
    const { email } = data;
    const successCallback = () => {
      setLoginPhase('password');
      setEmail(email);
    };
    await verifyEmail({ email, appStrings, successCallback });
  };
  const handleOnPasswordSubmit = async (data: ILoginFormPasswordData) => {
    const { password } = data;
    await logIn({ email, password, appStrings });
  };

  useEffect(() => {
    if (appUser) navigate('/projects');
  }, [appUser]);

  return (
    <div className="fill-parent flex">
      <BrandPoster />
      <div
        className={`fill-parent center-content scroll ${styles.login__content}`}
      >
        <div className={`center-content ${styles.login__form_container}`}>
          {loginPhase === 'email' ? (
            <LoginFormEmail
              className={styles.login__form}
              onSubmit={handleOnEmailSubmit}
            />
          ) : (
            <>
              <Button
                className={styles.back_button}
                onClick={() => setLoginPhase('email')}
                variant="unstyled"
                title={appStrings?.back}
              >
                &larr; {appStrings.goBack}
              </Button>
              <LoginFormPassword
                className={styles.login__form}
                onSubmit={handleOnPasswordSubmit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogIn;
