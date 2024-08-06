import React,{useState} from 'react';
import "./style.css";
import AppsIcon from "@mui/icons-material/Apps";
import {preliminariesCol, preliminariesRows} from "../../estimate/dataSource"


const Preliminaries = () => {
  const [data, setData] = useState(preliminariesRows)
  return (
    <div className="container-tap">
      <div className="heading-container">
        <div className="heading-left">Preliminaries</div>
        <div className="heading-right">
          <div className="heading-right-total">Total(Ex)<span>$0.00</span></div>
          <div className="heading-right-quote">Quote Total <span>$0.00</span></div>
        </div>
      </div>

      <table style={{width:"100%", borderCollapse: "collapse"}}>
        <thead>
          {preliminariesCol.map((colP, index) => (
            <tr key={index}>
            <th></th>
            <th></th>
            <th className="expand-column">{colP.description}</th>
            <th>{colP.type}</th>
            <th>{colP.qty}</th>
            <th>{colP.uom}</th>
            <th>{colP.unit_cost}</th>
            <th>{colP.total}</th>
            <th>{colP.markup}</th>
            <th>{colP.vat}</th>
            <th>{colP.quoteTotal}</th>
          </tr>))}
          
        </thead>
        <tbody>
          {preliminariesRows.map((preRow, index) => 
            (<tr key={index}>
            <td><AppsIcon style={{fontSize: '13px'}}/></td>
            <td>{preRow.id}</td>
            <td>{preRow.description}</td>
            <td>{preRow.total}</td>
            <td>{preRow.qty}</td>
            <td>{preRow.uom}</td>
            <td>{preRow.unit_cost}</td>
            <td>{preRow.total}</td>
            <td></td>
            <div className='detailAmount'>
            <span className="vat">{preRow.vat}</span>
            <span className="quoteTotal">{preRow.quoteTotal}</span>
            </div>
          </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Preliminaries;