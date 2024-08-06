import React, {useState} from 'react';
import "./style.css";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ActiveData from './ActiveData';
import RecycleBin from './RecycleBin';


const Settings = ({items, deletedItems}) => {
    const [openSetting, setOpenSetting] = useState(false);
    const [activeView,setActiveView] = useState('ActiveData');
    

    const handleViewChange = (view) => {
        setActiveView(view);
    }

  return (
      <div className="settingsContainer">
          <div className='select-btn'>
              <span className="btn-text">Settings</span>
              <ArrowDownIcon style={{cursor: "pointer"}}  onClick={handleViewChange}/>
          </div>

         {openSetting && ( <ul className='list-items'>
              <li className='heading'>
                  <span>Display Only</span>
              </li>
              <li className='item'>
                  <input type='radio' name='active' value={activeView}/>
                  <span>Active Item</span>
              </li>
              <li className="item">
                  <input type='radio' name='deleted' value={deletedItems} />
                  <span>Deleted Item</span>
              </li>
          </ul> )}

          {activeView === 'ActiveData' && <ActiveData items={items} />}
          {activeView === 'RecycleBin' && <RecycleBin deletedItems={deletedItems}/>}

      </div>
  )
}

export default Settings;