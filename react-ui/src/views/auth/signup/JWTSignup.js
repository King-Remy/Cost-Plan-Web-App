import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';

import { useHistory } from 'react-router-dom'
import AuthApi from '../../../utils/auth';

const JWTSignup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(undefined);
    const history = useHistory();

    const register = async (event) => {
        if (event) {
          event.preventDefault();
        }
        if (username === "") {
          return setError("You must enter your username.");
        }
        if (email === "") {
          return setError("You must enter your email.");
        }
        if (password === "") {
          return setError("You must enter a password.");
        }
        try {
          let response = AuthApi.Register({
            username,
            email,
            password,
          });
          if (response?.data && response?.data.success === false) {
            
            return setError(response?.data.msg);
          }
          return history.push("/auth/signin-1");
        } catch (err) {
            console.log('signup error:',err)
        //   if (err?.response) {
        //     return setError(err.response.data.msg);
        //   }
        //   return setError("There has been an error.");
        }
      };

    return (
                <form>
                    <div className="form-group mb-3">
                        <input
                            className="form-control" 
                            label="Username"
                            name="username"
                            placeholder='Username'
                            type="text"
                            onChange={(event) => {
                                setUsername(event.target.value);
                                setError(undefined);
                              }}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            className="form-control"
                            label="Email Address"
                            name="email"
                            placeholder='Email Address'
                            type="email"
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError(undefined);
                              }}
                        />
                        
                    </div>
                    <div className="form-group mb-4">
                        <input
                            className="form-control"
                            label="Password"
                            name="password"
                            placeholder='Password'
                            type="password"
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setError(undefined);
                              }}
                        />
                      
                    </div>

                    <div className="custom-control custom-checkbox  text-left mb-4 mt-2">
                        <input type="checkbox" className="custom-control-input" id="customCheck1"/>
                        <label className="custom-control-label" for="customCheck1">Agree <a href="/auth/signup"> terms</a>.</label>
                    </div>
                        <Col sm={12}>
                            <Alert className='text-danger'> {error}</Alert>
                        </Col>
                    <Row>
                        <Col mt={2}>
                            <Button className="btn-block mb-4" color="primary"  size="large" onClick={register} variant="primary">
                                Register
                            </Button>
                        </Col>
                    </Row>
                </form>
    );
};

export default JWTSignup;
