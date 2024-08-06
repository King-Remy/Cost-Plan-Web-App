import React, { useContext, useState } from 'react';
import { ListGroup, Dropdown } from 'react-bootstrap';
import { Link ,useHistory} from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';

import ChatList from './ChatList';
import { ConfigContext } from '../../../../contexts/ConfigContext';

import avatar1 from '../../../../assets/images/user/avatar-1.jpg';
import AuthApi from '../../../../utils/auth';
import { useAuth } from '../../../../auth-context/auth.context';

const NavRight = () => {
  const configContext = useContext(ConfigContext);
  const { user, setUser } = useAuth();
  const { rtlLayout } = configContext.state;
  const history = useHistory();
  const [listOpen, setListOpen] = useState(false);

  const handleLogout = async () => {
    AuthApi?.Logout(user);
    setUser(null);
    localStorage.removeItem("user");
    return history.push("/auth/signin-1");
  };

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown alignRight={!rtlLayout}>
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="feather icon-bell icon" />
            </Dropdown.Toggle>
            <Dropdown.Menu alignRight className="notification notification-scroll">
              <div className="noti-head">
                <h6 className="d-inline-block m-b-0">Notifications</h6>
                <div className="float-right">
                  <Link to="#" className="m-r-10">
                    mark as read
                  </Link>
                  <Link to="#">clear all</Link>
                </div>
              </div>
              <PerfectScrollbar>
                
              </PerfectScrollbar>
              <div className="noti-footer">
                <Link to="#">show all</Link>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
        {/* <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown>
            <Dropdown.Toggle as={Link} variant="link" to="#" className="displayChatbox" onClick={() => setListOpen(true)}>
              <i className="icon feather icon-mail" />
            </Dropdown.Toggle>
          </Dropdown>
        </ListGroup.Item> */}
        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown alignRight={!rtlLayout} className="drp-user">
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="icon feather icon-settings" />
            </Dropdown.Toggle>
            <Dropdown.Menu alignRight className="profile-notification">
              <div className="pro-head">
                <img src={avatar1} className="img-radius" alt="User Profile" />
                <span>King Remy</span>
                <Link to="#" className="dud-logout" title="Logout">
                  <i className="feather icon-log-out" />
                </Link>
              </div>
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
              
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={handleLogout}>
                    <i className="feather icon-log-out" /> Logout
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>
      <ChatList listOpen={listOpen} closed={() => setListOpen(false)} />
    </React.Fragment>
  );
};

export default NavRight;
