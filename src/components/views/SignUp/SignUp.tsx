import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import BrandPoster from '../../common/BrandPoster/BrandPoster';
import EmailSentConfirmation from '../../common/EmailSentConfirmation/EmailSentConfirmation';
import ThirdPartyAuth from '../../common/ThirdPartyAuth/ThirdPartyAuth';
import ToggleGroup from '../../common/ToggleGroup/ToggleGroup';
import SignUpForm, { ISignUpFormData } from '../../forms/SignUpForm/SignUpForm';
import { signUp } from '../../../services/authService';

import styles from './SignUp.module.css';

interface ISignUp {}

enum EStrategies {
  form = 'form_strategy',
  confirmation = 'confirmation_strategy',
}

const SignUp: React.FC<ISignUp> = props => {
  const navigate = useNavigate();
  const [formEmail, setFormEmail] = useState('');
  const [strategy, setStrategy] = useState<EStrategies>(EStrategies.form);
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const handleOnSignUpToggleClick = () => {
    if (strategy === EStrategies.confirmation) {
      setFormEmail('');
      setStrategy(EStrategies.form);
    }
  };

  const toggleOptions = [
    {
      id: 'login',
      name: appStrings?.logIn,
      onClick: () => navigate('/login'),
    },
    {
      id: 'signUp',
      name: appStrings?.signUpFree,
      onClick: handleOnSignUpToggleClick,
    },
  ];

  const handleOnFormSubmit = async (formData: ISignUpFormData) => {
    const signedUpUser = await signUp(formData);
    if (signedUpUser) {
      setFormEmail(signedUpUser.email || 'jesusac1992@gmail.com');
      setStrategy(EStrategies.confirmation);
    }
  };

  return (
    <div className="fill-parent flex">
      <BrandPoster />
      <div
        className={`fill-parent center-content scroll ${styles.signup__content} ${styles[strategy]}`}
      >
        <div className={`center-content ${styles.signup__form_container}`}>
          <ToggleGroup selectedOption="signUp" options={toggleOptions} />
          {strategy === EStrategies.form ? (
            <SignUpForm
              className={styles.signup__form}
              onSubmit={handleOnFormSubmit}
            />
          ) : (
            <EmailSentConfirmation
              className={styles.signup__email_confirmation}
              email={formEmail}
            />
          )}
          <ThirdPartyAuth className={styles.signup__third_parties} />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
