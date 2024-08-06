import React, {useState} from 'react';
import "./style.css";
import KeyboardForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Catelogue from "../../estimate/costings/Catelogue";
import AppsIcon from "@mui/icons-material/Apps";
import Preliminaries  from "../../estimate/costings/Preliminaries";
import { costing } from '../dataSource';



const Costings = ({cost, index}) => {
  const [costData, setCostData] = useState(costing)
  const [openItemIndex, setOpenItemIndex] = useState(null);

  const handleTitleClick = (index) => {
    setOpenItemIndex(openItemIndex === index ? null : index);
  };
 
  return (
    <div className="cost">
    <div className="costContainer">
      <div className="topheaderText">
        {/* <h5>Your trial ends in 14 days. Please <span>subscribe</span></h5> */}
      </div>
     <div className="top_middleground">
      <div className="top">
        <div className="arrow_back">
          <KeyboardBackIcon className="arrowIcon"/>
        </div>
        <div className="text_item">
          <span>Kitchen and Bathroom Template</span>
        </div>
        <div className="template_span">
          <span>TEMPLATE</span>
        </div>
      </div>
      <hr />
      <div className="middle">
        <div className="middleTop">
          <button className="btnTemplate">Use Template</button>
          <div className="Quote">
            <div className="QuoteTitle">
              <span>Quote Total</span>
            </div>
            <div className="QuoteTotal">
              <span>$0.00</span>
            </div>
          </div>
        </div>
        <hr />
        <div className="middleBottom">
          <div className="middle_item_left">
            <div className="estimate_details">
              <span>Estimate Details</span>
            </div>
            <div className="estimate_costing">
              <span>Estimate Costings</span>
            </div>
          </div>
          <div className="middle_item_right">
            <div className="right_item">
            <div className="prepare_quote">
              <button className='btnQuote'>Prepare Quote</button>
            </div>
            <div className='forwardQuote'>
              <KeyboardForwardIcon className='icon_quote'/>
            </div>
            <div className="upwardArrow">
            <ArrowUpIcon />
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    <div className="controller">
      <div className="bottom">
        <div className="containerBottom">
        <div className="bottomContainerLeft">
          <div className="bottomLeftTop">
            <span>Costings</span>
          </div>
          {costing.map((cost, index) => (
            <div className="table-content" key={index} onClick={handleTitleClick} style={{cursor: "pointer"}}>
            <div className="appContain"><AppsIcon style={{fontSize: '13px'}}/></div>
            <div className="serialNo">{cost.id}</div>
            <div className="tag">{cost.tag}</div>
            <div className="description">{cost.name}</div>
            <div className="amount">{cost.amount}</div>
          </div>
          ))}
           {openItemIndex === index && ( <Preliminaries  setCostData={setCostData}/> )}
        </div>
        
        </div>
      </div>
      
      <Catelogue />
     </div>
      <div className="footer_section">
      <div className="footer_content">
        <div className="sub_total">
          <span className="subtotalEx">Sub Total (Ex)</span>
          <span className="amount">$0.00</span>
        </div>
        <div className="markup_amount">
          <span className="markup_amount">Markup</span>
          <span className="markup_amount">$0.00</span>
        </div>
        <div className="vat_amount">
          <span className="vat_title">VAT</span>
          <span className="vat_total">$0.00</span>
        </div>
        <div className="quote_total">
          <span className="quote_title">Quote Total</span>
          <span className="quote_total">$0.00</span>
        </div>
      </div>
    </div>
    </div>
    
  </div>
  )
}

export default Costings