import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';
import JWTSignup from './JWTSignup';

const SignUp1 = () => {
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
          <Card className="borderless">
            <Row className="align-items-center">
              <Col>
                <Card.Body className="text-center">
                  <div className="mb-4">
                  <h4 className='mb-4'>Step Associates Ltd</h4>
                    <i className="feather icon-user-plus auth-icon" />
                  </div>
                 
                  <JWTSignup />
                 
                  <p className="mb-4">
                    Already have an account?{' '}
                    <NavLink to="/auth/signin-1" className="f-w-400">
                      Login
                    </NavLink>
                  </p>
                  {/* <p className="mb-0 text-muted">

                    <a target="_blank" rel="noreferrer" href="https://appseed.us/product/datta-able-pro/full-stack/react/">Download</a>
                    {' - '}
                    <a target="_blank" rel="noreferrer" href="https://appseed.us/support">Support</a>
                </p> */}
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SignUp1;
