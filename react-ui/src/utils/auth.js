import { API_SERVER } from "../config/constant";
import axios from "axios";

axios.defaults.baseURL = API_SERVER

class AuthApi {
  static Login = (data) => {
    return axios.post(`${API_SERVER}/${base}/login`, data);
  };

  static Register = (data) => {
    return axios.post(`${API_SERVER}/${base}/register`, data);
  };

  static Logout = (data) => {
    return axios.post(`${API_SERVER}/${base}/logout`, data, { headers: { Authorization: `${data.token}` } });
  };
}

let base = "users";

export default AuthApi;
