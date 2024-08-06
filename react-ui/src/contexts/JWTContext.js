import React, { createContext, useEffect, useReducer } from 'react';
import jwtDecode from 'jwt-decode';
import { ACCOUNT_INITIALISE, LOGIN, LOGOUT } from '../store/actions';
import accountReducer from '../store/accountReducer';
import Loader from '../components/Loader/Loader';
import axios from '../utils/axios';


const initialState = {
  isLoggedIn: false,
  isInitialised: false,
  user: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }

  const decoded = jwtDecode(serviceToken);
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

const JWTContext = createContext({
  ...initialState,
  register: () => Promise.resolve(),
  login: () => Promise.resolve(),
  logout: () => { }
});

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  const login = async (email, password) => {
    const response = await axios.post('/users/login', { email, password });
    const { serviceToken, user } = response.data;
    setSession(serviceToken);
    dispatch({
      type: LOGIN,
      payload: {
        user
      }
    });
  };


  const register = async (username, email, password) => {
    // todo: this flow need to be recode as it not verified
    // const id = chance.bb_pin();
    const response = await axios.post('/users/register', {
      username,
      email,
      password
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      // const localUsers = window.localStorage.getItem('users');
      // users = [
      //   ...JSON.parse(localUsers),
      //   {
      //     username,
      //     email,
      //     password
      //   }
      // ];
    }
    window.localStorage.setItem('users', JSON.stringify(users));

   
  };


  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/users');
          const { user } = response.data;
          dispatch({
            type: ACCOUNT_INITIALISE,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          dispatch({
            type: ACCOUNT_INITIALISE,
            payload: {
              isLoggedIn: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: ACCOUNT_INITIALISE,
          payload: {
            isLoggedIn: false,
            user: null
          }
        });
      }
    };

    init();
  }, []);

  if (!state.isInitialised) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, register, logout }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
