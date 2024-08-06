import React, {useState} from 'react';
import Duplex_Logo from "../../../../../assets/images/1-storey.png";
import { useHistory } from 'react-router-dom';

const NewEstimate = ({addNewEstimate, handleCloseForm}) => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        description: '',
        buildingType: '',
        job_location: '',
        client: '',
        includeTemplateQuantities: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
          ...formData,
          [name]: type === 'checkbox' ? checked : value,
        });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        // addNewEstimate(formData); // Add new estimate to parent component state (Estimate.js)
        setFormData({
          description: '',
          buildingType: '',
          client: '',
          job: '',
          includeTemplateQuantities: false,
        });
        handleCloseForm(); // Close modal after submission

        history.push("/estimate/list/id/details");
      };
    
  return (
    <div className="new-container">
        <div className="content-container">
        <div className="top-left">
            <div className="logo_titleHeader">
                <div className="logo">
                    <img src={Duplex_Logo} alt='logo' />
                </div>
                <div className="textLogo">
                    <div className="duplexText">
                        <span>New Rules of Measurement (NRM) Template</span>
                    </div>
                    <span className="descTitle">New Rules of Measurement (NRM) template to help speed up the estimation process.</span>
                </div>
            </div>
        </div>
        <div className="container-right">
            <div className="contentRightContentContainer">
                <div className="text_title">
                    <span>Configuration</span>
                </div>
                <div className="include_wrapper">
                    <span>Include</span>
                    <div className="include_box">
                    <input 
                    type='checkbox' 
                    name='include'
                    checked={formData.includeTemplateQuantities}
                    onChange={handleChange}/>
                    <label htmlFor='include'>Include template quantities</label>
                    </div>
                </div>
                <form  onSubmit={handleSubmit}>
                    <div className="form-group">
                    <label htmlFor='description'>Description</label>
                    <input type='text' 
                    name='description' 
                    value={formData.description} 
                    placeholder='Untitled Estimate' 
                    onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                    <label htmlFor='buildingType'>Building Type</label>
                    <input type='text' 
                    name='buildingType' 
                    value={formData.buildingType} 
                    placeholder='Building Type' 
                    onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                    <label htmlFor='Job_location'>Job Location</label>
                    <input type='text' 
                    name='Job_location' 
                    value={formData.job_location} 
                    placeholder='Job Location' 
                    onChange={handleChange}/>
                    </div>
                    <div className="form-group">
                    <label htmlFor='client'>Client Name</label>
                    <input type='text' 
                    name='client' 
                    value={formData.client} 
                    placeholder='Client' 
                    onChange={handleChange}/>
                    </div>
                    <div className="btn_control">
                        <button className='btnWhite' onClick={handleCloseForm}>Cancel</button>
                        <button className='btnGreen' type="submit">Use Template</button>
                    </div>
                </form>
            </div>
        </div>
     </div>
  </div>
  )
}

export default NewEstimate