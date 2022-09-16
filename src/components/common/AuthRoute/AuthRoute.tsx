import * as React from 'react';
import { Navigate, Route } from 'react-router-dom';

interface Props {
  component: any;
  // path: string;
  exact?: boolean;
}

const AuthRoute = ({ component: Component, exact, ...rest }: Props) => {
  const isAuth = false;
  debugger;
  return isAuth ? <Component {...rest} /> : <Navigate to="/login" />;
  // <Route
  //   path={path}
  //   element={(props: any) => {
  //     debugger;
  //     return <Component {...props} />;
  //   }}
  // />
};

export default AuthRoute;
