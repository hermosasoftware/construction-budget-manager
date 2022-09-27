import * as React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';

interface Props {
  component: any;
}

const AuthRoute = ({ component: Component, ...rest }: Props) => {
  const appUser = useAppSelector(state => state.session.user);
  return appUser ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default AuthRoute;
