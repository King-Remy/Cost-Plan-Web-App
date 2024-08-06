import React, {useState} from 'react';
import "./style.css";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import ActiveData from './ActiveData';
// import RecycleBin from './RecycleBin';


const Settings = () => {
    const [openSetting, setOpenSetting] = useState(false);

    const  handleSetting = () => {
        setOpenSetting(true);
    }


    // const handleChangeViewType = (event) => {
    //     // setViewType(event.target.value);
    //   };

    

  return (
      <div className="settingsContainer">
          <div className='select-btn'>
              <span className="btn-text">Settings</span>
              <ArrowDownIcon style={{cursor: "pointer"}}  onClick={handleSetting}/>
          </div>

         {openSetting && ( <ul className='list-items'>
              <li className='heading'>
                  <span>Display Only</span>
              </li>
              <li className='item'>
                  <input type='radio' name='active' />
                  <span>Active Item</span>
              </li>
              <li className="item">
                  <input type='radio' name='deleted' />
                  <span>Deleted Item</span>
              </li>
              <li className="item">
                  <span>Reset to Default</span>
              </li>
          </ul> )}

      </div>
  )
}

export default Settings;