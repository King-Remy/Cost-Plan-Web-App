import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../../auth-context/auth.context';



const AuthGuard = ({ children }) => {
  const { user } = useAuth();

  if (!user || !user.token || user.token === "") {
    return <Redirect to="/auth/signin-1" />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default AuthGuard;
