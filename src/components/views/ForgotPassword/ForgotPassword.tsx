import React, { useState } from 'react';
import { useAppSelector } from '../../../redux/hooks';
import { TObject } from '../../../types/global';
import BrandPoster from '../../common/BrandPoster/BrandPoster';
import EmailSentConfirmation from '../../common/EmailSentConfirmation/EmailSentConfirmation';
import ToggleGroup from '../../common/ToggleGroup/ToggleGroup';
import ForgotPasswordForm from '../../forms/ForgotPasswordForm/ForgotPasswordForm';

import styles from './ForgotPassword.module.css';

interface IForgotPassword {}

enum EStrategies {
  form = 'form_strategy',
  confirmation = 'confirmation_strategy',
}

const ForgotPassword: React.FC<IForgotPassword> = props => {
  const [formEmail, setFormEmail] = useState('');

  const [strategy, setStrategy] = useState<EStrategies>(EStrategies.form);
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const handleOnRestorePasswordToggleClick = () => {
    if (strategy === EStrategies.confirmation) {
      setFormEmail('');
      setStrategy(EStrategies.form);
    }
  };

  const toggleOptions = [
    {
      id: 'restorePassword',
      name: appStrings?.Global?.restorePassword,
      onClick: handleOnRestorePasswordToggleClick,
    },
  ];

  const handleOnFormSubmit = (data: TObject) => {
    console.log('Forgot Password Form: ', data);
    setFormEmail(data.email || 'jesusac1992@gmail.com');
    setStrategy(EStrategies.confirmation);
  };

  return (
    <div className="fill-parent flex">
      <BrandPoster />
      <div
        className={`fill-parent center-content scroll ${styles.forgot_password__content} ${styles[strategy]}`}
      >
        <div
          className={`center-content ${styles.forgot_password__form_container}`}
        >
          <ToggleGroup
            selectedOption="restorePassword"
            options={toggleOptions}
          />
          {strategy === EStrategies.form ? (
            <ForgotPasswordForm
              className={styles.forgot_password__form}
              onSubmit={handleOnFormSubmit}
            />
          ) : (
            <EmailSentConfirmation
              className={styles.forgot_password__email_confirmation}
              email={formEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
