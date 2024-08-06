import { ACCOUNT_INITIALISE, LOGIN, LOGOUT, REGISTER } from './actions';

const accountReducer = (state, action) => {
  switch (action.type) {
    case ACCOUNT_INITIALISE: {
      const { isLoggedIn, user } = action.payload;
      return {
        ...state,
        isLoggedIn,
        isInitialised: true,
        user
      };
    }
    case REGISTER: {
      const { user } = action.payload;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      const { user } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        user
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isLoggedIn: false,
        user: null
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default accountReducer;
