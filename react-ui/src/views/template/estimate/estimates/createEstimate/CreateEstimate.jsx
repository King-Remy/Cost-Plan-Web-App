import React, {useState} from 'react';
import BackArrowIcon from "@mui/icons-material/ArrowBack";
import IconImage from "../../../../../assets/images/1-storey.png";
import { Link } from 'react-router-dom';
import "./style.css";
import NewEstimate from "../createEstimate/NewEstimate";

const CreateEstimate = ({addNewEstimate}) => {
  const [openForm, setOpenForm] = useState(false);

  const handleOpenForm = () => {
    setOpenForm(true);
  }

  const handleCloseForm = () => {
    setOpenForm(false);
  }

  return (
    <div className="newEstimate">
      <div className="newEstimateContainer">
        <Link to="/estimate/list" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="backbtn">
            <button className='btnBack'>
              <BackArrowIcon className="icon" />
              <span>Back</span>
            </button>
          </div>
        </Link>
        <div className="titleTop">
          <span>Create an Estimate</span>
        </div>
        <div className="textTop">
          <p>Select a template to start creating your estimate. All templates <br />
            are customizable to help you get quotes out quickly.
          </p>
        </div>
        
        <div className="card" onClick={handleOpenForm}>
          <div className="leftContent">
              <div className="dotContainer">
                <div className="group-menu">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          <div className="cardContainer">
            <div className="logoContent">
              <div className="buildIcon">
                <img src={IconImage} alt="BuildingIcon" />
              </div>
            </div>
            
          </div>
          <div className="caption">
            <h4>New Rules of Measurement (NRM)</h4>
          </div>
          <div className="textCard">
            <p>
              NRM template to help<br /> speed up the estimation process.
            </p>
          </div>
        </div>
      </div>
      {openForm && ( <NewEstimate 
      addNewEstimate={addNewEstimate}
      handleCloseForm={handleCloseForm}/> )}
    </div>
    )
}

export default CreateEstimate