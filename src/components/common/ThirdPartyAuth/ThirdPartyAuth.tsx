import React from 'react';
import { AppleLogo, GoogleLogo } from 'phosphor-react';
import { IStyledComponent } from '../../../types/global';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import Button from '../Button/Button';
import { googleSignIn } from '../../../providers/userAuthContextProvider';
import { useNavigate } from 'react-router-dom';
import styles from './ThirdPartyAuth.module.css';
import { useToast } from '@chakra-ui/react';
import { changeUser } from '../../../redux/reducers/sessionSlice';

interface IThirdPartyAuth extends IStyledComponent {}

const ThirdPartyAuth: React.FC<IThirdPartyAuth> = props => {
  const { className, style } = props;
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const dispatch = useAppDispatch();
  const toast = useToast();

  const handleOnClickGoogle = async () => {
    const [errors, user] = await googleSignIn();
    if (errors && !user) {
      toast({
        title: appStrings?.errorWhileLogIn,
        description: errors + '',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <div
      className={`center-content-cross ${styles.main_container} ${className}`}
      style={style}
    >
      <p className={styles.content_label}>{appStrings?.continueWithSocials}</p>
      <div className={`center-content ${styles.content_container}`}>
        <Button
          variant="outline"
          shape="max-rounded"
          onClick={handleOnClickGoogle}
        >
          <GoogleLogo size={16} />
        </Button>
        <Button variant="outline" shape="max-rounded">
          <AppleLogo size={16} weight="fill" />
        </Button>
      </div>
    </div>
  );
};

export default ThirdPartyAuth;
