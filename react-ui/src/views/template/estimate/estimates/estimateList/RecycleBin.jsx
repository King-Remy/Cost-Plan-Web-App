import React from 'react';
import "./style.css";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined"



const RecycleBin = ({deletedItem, onRecover}) => {
  return (
    <div className='table-data'>
        
        <table className='tableContainer'>
          
          <tbody>
            {deletedItem.map((row, index) => (
              <tr key={index}>
              <td><Link to="" style={{textDecoration: "underline", color:"#ccc", fontWeight: "700", cursor:"pointer"}}>{row.id}</Link></td>
              <td><Link to="" style={{textDecoration: "underline", color:"#ccc", fontWeight: "700", cursor: "pointer"}}>{row.description}</Link></td>
              <td>{row.buildingType}</td>
              <td>{row.job}</td>
              <td>{row.client}</td>
              <td>{row.date}</td>
              <td><strong>{row.quoteTotal}</strong></td>
              <td className="table-button">
                <div className="recover">
                  <button onClick={()=> onRecover(index)}>
                    <CachedOutlinedIcon />
                  </button>
                </div>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>
  )
}

export default RecycleBin