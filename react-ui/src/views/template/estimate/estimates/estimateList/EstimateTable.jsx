import React,{useState, useEffect} from 'react';
import "./style.css";
import {useHistory} from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import CopyIcon from "@mui/icons-material/ContentCopy";
import { estimateColumns} from '../../dataSource';
import { Link } from 'react-router-dom';
import CopyConfirmation from '../../../dialogbox/confirmationmsg/CopyConfirmation';
import DuplicateForm from './DuplicateForm';
// import DeleteConfirmation from "../../../dialogbox/confirmationmsg/DeleteConfirmation";



const EstimateTable = ({data}) => {
    // const [data, setData] = useState(estimateRows);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [items, setItems]=useState("");
    const [copyRowIndex, setCopyRowIndex] = useState(null);
    
    
    const history = useHistory();


  //handle copy function
  const handleCopy = (index) => {
    setCopyRowIndex(index);
    setShowConfirmation(true);
  };

  const handleConfirmationCopy = () => {
    //logic to duplicate
    const newItems = [...items];
    //update state or perform necessary actions
    const copiedItem = {...newItems[copyRowIndex]};
    newItems.splice(copyRowIndex + 1, 0, copiedItem);
    setItems(newItems);
    setShowConfirmation(false);
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  }


  const handleSort = (column) => {
    if(column === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  //Function to compare value for sorting
  const compareValues = (key, order = 'asc') => {
    return function(a, b) {
      if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = (typeof a[key] === "string") ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if(varA > varB) {
        comparison = 1;
      } else if(varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      )
    }
  }

  // sort data based on current sortBy and sortOrder
  let sortedData = [...data];
  if(sortBy) {
    sortedData = sortedData.sort(compareValues(sortBy, sortOrder));
  }
 
  return (
    <div className="dataContainer">
      <div className="itemContainer">
        <div className="leftContainer">
        </div>
      </div>
      <div className="containerGroup">
      </div>
      <div className='table-data'>
        
        <table className='tableContainer'>
          <thead>
            
            {estimateColumns.map((col, index) => ( 
                <tr key={index}>
                <th onClick={() => handleSort('id')}>
                  {col.id} {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th onClick={() => handleSort('description')}>
                  {col.description} {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('buildingType')}>
                  {col.buildingType} {sortBy === 'buildingType' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th onClick={() => handleSort('status')}>
                  {col.status} {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th onClick={() => handleSort('job')}>
                  {col.job} {sortBy === 'job' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th onClick={() => handleSort('client')}>
                  {col.client} {sortBy === 'job' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th onClick={() => handleSort('date')}>
                  {col.date} {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th onClick={() => handleSort('quoteTotal')}>
                  {col.quoteTotal} {sortBy === 'quoteTotal' && (sortOrder === 'asc' ? '↑' : '↓')}
                
                </th>
                <th></th>
                </tr>
                ))}
            
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
              <td><Link to="/estimate/list/:id/details" style={{textDecoration: "underline", color:"#494646", fontWeight: "700", cursor:"pointer"}}>{row.id}</Link></td>
              <td><Link to="/estimate/list/:id/details" style={{textDecoration: "underline", color:"#494646", fontWeight: "700", cursor: "pointer"}}>{row.description}</Link></td>
              <td>{row.buildingType}</td>
              <td>{row.status}</td>
              <td>{row.job}</td>
              <td>{row.client}</td>
              <td>{row.date}</td>
              <td><strong>{row.quoteTotal}</strong></td>
              <td className="table-button">
                <div className="copyButton">
                  <button >
                    <CopyIcon onClick={() => handleCopy(index)}/>
                  </button>
                </div>
                <div className="deleteButton">
                  <button >
                    <DeleteIcon />
                  </button>
                </div>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>
      {showConfirmation && ( 
          <CopyConfirmation 
          title="Copy Estimate ?"
          message="You about to make a copy of this estimate!"
          onConfirm={handleConfirmationCopy}
          onCancel={handleCloseConfirmation}
          /> )}
          {copyRowIndex !== null && ( 
            <DuplicateForm rowData={items[copyRowIndex]} onCancel={handleCloseConfirmation}/> )}
      </div>
  )
}

export default EstimateTable