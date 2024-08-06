import React from 'react';
import { Card } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

// import FirebaseLogin from './FirebaseLogin';

import JWTLogin from './JWTLogin';

const Signin1 = () => {
  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
              <div className="mb-4">
                <h4 className='mb-4'></h4>
                <i className="feather icon-unlock auth-icon" />
              </div>
              <JWTLogin />
              {/* <p className="mb-2 text-muted">
                Forgot password?{' '}
                <NavLink to="/auth/reset-password-1" className="f-w-400">
                  Reset
                </NavLink>
              </p> */}
              <p className="mb-4 text-muted">
                Don’t have an account?{' '}
                <NavLink to="/auth/signup-1" className="f-w-400">
                  Sign Up
                </NavLink>
              </p>
              {/* <p className="mb-0 text-muted">

              <a target="_blank" rel="noreferrer" href="https://appseed.us/product/datta-able-pro/full-stack/react/">Download</a>
              {' - '}
              <a target="_blank" rel="noreferrer" href="https://appseed.us/support">Support</a>
              </p> */}
              {/* <Alert variant="primary" className="text-left mt-3">
                Username:
                <CopyToClipboard text="demo@gmail.com">
                  <Button variant="outline-primary" as={Link} to="#" className="badge mx-2 mb-2" size="sm">
                    {' '}
                    <i className="fa fa-user mr-1" /> demo@gmail.com{' '}
                  </Button>
                </CopyToClipboard>
                <br />
                Password:
                <CopyToClipboard text="123456">
                  <Button variant="outline-primary" as={Link} to="#" className="badge mx-2" size="sm">
                    {' '}
                    <i className="fa fa-lock mr-1" /> 123456{' '}
                  </Button>
                </CopyToClipboard>
              </Alert> */}
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
