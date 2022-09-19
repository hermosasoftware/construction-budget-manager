import * as React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';

interface Props {
  component: any;
  // path: string;
  exact?: boolean;
}

const AuthRoute = ({ component: Component, exact, ...rest }: Props) => {
  const appUser = useAppSelector(state => state.session.user);
  return appUser ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default AuthRoute;
