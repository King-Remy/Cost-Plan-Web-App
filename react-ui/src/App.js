import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// import { FirebaseProvider } from './contexts/FirebaseContext';
// import { JWTProvider } from "./contexts/JWTContext";
//import { Auth0Provider } from "./contexts/Auth0Context";

import routes, { renderRoutes } from './routes';
import { AuthProvider } from './auth-context/auth.context';
let user = localStorage.getItem("user");
user = JSON.parse(user);

const App = () => {
  return (
    <React.Fragment>
      <Router >
        <AuthProvider userData={user}>{renderRoutes(routes)}</AuthProvider>
      </Router>
    </React.Fragment>
  );
};

export default App;
