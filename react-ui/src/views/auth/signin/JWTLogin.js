import React, { useState } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import {useHistory} from 'react-router-dom'
import AuthApi from '../../../utils/auth';
import { useAuth } from '../../../auth-context/auth.context';

const JWTLogin = () => {
  const [formData, setFormData] = useState({
    email   : "", // DEFAULT Auth HERE (email) 
		password: ""  // DEFAULT Auth HERE (password)                              
  });
  const [error, setError] = useState(undefined);
  const history = useHistory();
  const {user, setUser } = useAuth();


  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

 

  const handleLogin = (event) => {
     if (user && user?.token) {
    return history.push("/app/dashboard/default");
  }
  if (formData.email === "") {
    return setError("You must enter your email.");
  }
  if (formData.password === "") {
    return setError("You must enter your password");
  }
    event.preventDefault();
    AuthApi.Login(formData)
      .then((response) => {
        if (response.data.success) {
          setProfile(response);
        } else {
          setError(response.data.msg);
        }
      })
      .catch((error) => {
        // if (error.response) {
        //   setError(error.response.data.msg);
        // }
        // setError('There has been an error.');
      }
      );
  };
  const setProfile = async (response) => {
    let user = { ...response.data.user };
    user.token = response.data.token;
    user = JSON.stringify(user);
    setUser(user);
    localStorage.setItem("user", user);
    return history.push("/app/dashboard/default");
  };
  return (
    <React.Fragment>
          <form >
            <div className="form-group mb-3">
              <input
                required
                className="form-control"
                label="Email Address / Username"
                name="email"
                placeholder='Email Address'
                type="email"
                onChange={handleChange}
                defaultValue={formData.email}
              />
             
            </div>
            <div className="form-group mb-4">
              <input
                required
                className="form-control"
                label="Password"
                name="password"
                placeholder='password'
                type="password"
                onChange={handleChange}
                defaultValue={formData.password}
              />
           
            </div>

            <div className="custom-control custom-checkbox  text-left mb-4 mt-2">
              <input type="checkbox" className="custom-control-input" id="customCheck1" />
              <label className="custom-control-label" htmlFor="customCheck1">
                Save credentials.
              </label>
            </div>
              <Col sm={12}>
                <Alert className='text-danger'> {error}</Alert>
              </Col>
            <Row>
              <Col mt={2}>
                <Button className="btn-block mb-4" color="primary"  size="large" onClick={handleLogin} variant="primary">
                  Login
                </Button>
              </Col>
            </Row>
          </form>
       
    </React.Fragment>
  );
};

export default JWTLogin;
