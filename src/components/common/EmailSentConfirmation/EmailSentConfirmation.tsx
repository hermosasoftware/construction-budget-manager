import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import { IStyledComponent } from '../../../types/global';
import { interpolate } from '../../../utils/translations';
import Button from '../Button/Button';

interface IEmailSentConfirmation extends IStyledComponent {
  email: string;
}

const EmailSentConfirmation: React.FC<IEmailSentConfirmation> = props => {
  const { email, className, style } = props;
  const navigate = useNavigate();
  const appStrings = useAppSelector(state => state.settings.appStrings);

  const confirmationMessage = interpolate(appStrings?.Auth?.weHaveSentAnEmail, {
    formEmail: email,
  });

  const handleOnClick = () => navigate('/login');

  return (
    <div className={`center-content ${className}`} style={style}>
      <p>{confirmationMessage}</p>
      <Button className="submit-button" onClick={handleOnClick}>
        {appStrings?.Global?.goToLogin}
      </Button>
    </div>
  );
};

export default EmailSentConfirmation;
