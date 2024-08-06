import React,{useState, useEffect} from 'react';
import "./style.css";
import DeleteIcon from "@mui/icons-material/Delete";
import CopyIcon from "@mui/icons-material/ContentCopy";
import { estimateColumns, estimateRows} from '../../dataSource';
import { Link } from 'react-router-dom';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import Settings from './Settings';
import {useHistory} from "react-router-dom";
// import CopyConfirmation from '../../../dialogbox/confirmationmsg/CopyConfirmation';
// import DuplicateForm from './DuplicateForm';
// import DeleteConfirmation from "../../../dialogbox/confirmationmsg/DeleteConfirmation";
// import RecycleBin from './RecycleBin';


const EstimateList = () => {

  const history = useHistory();

  const [data, setData] = useState(estimateRows);
  const [searchItem, setSearchItem] = useState("");
  const [sortBy, setSortBy] = useState({ column: null, direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(0);
  // const [showConfirmation, setShowConfirmation] = useState(false);
  // const [items, setItems]=useState("");
  // const [deletedRowIndex, setDeletedRowIndex] = useState(false);
  // const [copyRowIndex, setCopyRowIndex] = useState(null);
  // const [deletedItems, setDeletedItems] = useState("")
  // const [deletedRow, setDeletedRow] = useState(null)
  const pageSize = 5 ;


  // useEffect(()=> {
  //   const baseURL = "http://localhost:5000/api/estimate";
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(baseURL)
  //       if(!response.ok){
  //         throw new Error("Network reaponse not ok")
  //       }else {
  //         const data = await response.json();
  //         setData(data)
  //         console.log(data)
  //       }
  //     } catch (error) {
  //       console.log("error")
  //     }
  //   }
  //   fetchData()
  // },[]);


  // Function to handle sorting
  const handleSort = (column) => {
    const newSortBy = {
      column,
      direction: sortBy.column === column && sortBy.direction === 'asc' ? 'desc' : 'asc',
    };
    setSortBy(newSortBy);
  };

  // Function to handle searching
  const handleSearchData = (e) => {
    setSearchItem(e.target.value);
    setCurrentPage(0); // Reset to the first page when searching
  };

  // Function to filter and paginate data
  
  const filteredData = data.filter((search) => 
    search.description.toLowerCase().includes(searchItem.toLowerCase()) ||
  search.client.toLowerCase().includes(searchItem.toLowerCase())
  )

  const pageCount = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  

  //handle copy function
  // const handleCopy = (index) => {
  //   setCopyRowIndex(index);
  //   setShowConfirmation(true);
  // };

  // const handleConfirmationCopy = () => {
  //   //logic to duplicate
  //   const newItems = [...items];
  //   //update state or perform necessary actions
  //   const copiedItem = {...newItems[copyRowIndex]};
  //   newItems.splice(copyRowIndex + 1, 0, copiedItem);
  //   setItems(newItems);
  //   setShowConfirmation(false);
  // }

  // const handleCloseConfirmation = () => {
  //   setShowConfirmation(false);
  // };

  // const handleDelete = (index) => {
  //   setDeletedRow(index);
  //   setShowConfirmation(true);
  // };

  // const handleConfirmationDelete = () => {
  //   //Logic here
  //   const deletedItems = items.splice(deletedRowIndex, 1)[0];//To remove from items array
  //   setItems([...items]); //update items array
  //   setDeletedItems([...deletedItems, deletedItems]);
  //   setShowConfirmation(false);
  // };

  // const handleCloseDeleteConfirmation = () => {
  //   setShowConfirmation(false);
  // }
  

  // const handleRecover  = (index) => {
  //   const recoveredItem = deletedItems.splice(index, 1)[0];
  //   setDeletedItems([...deletedItems]);
  //   setItems([...items, recoveredItem]);
  // }

  return (
    <div className="dataContainer">
      <div className="itemContainer">
        <div className="leftContainer">
          <div className="textITem">
            <p>ESTIMATES({data.length})</p>
          </div>
        </div>
      </div>
      <div className="containerGroup">
        <div className="leftContainerNew">

          <div className="createEstimate">
            <Link to="/estimate/create">
              <button >Create New</button>
            </Link>
          </div>
        </div>
        {/*======Search item and settings======*/}
        <div className="rightContainerSearch">
          <div className="searchItemEstimate">

            <SearchOutlinedIcon className="searchIcon" />
            <input
              type="text"
              placeholder='Search...'
              value={searchItem}
              onChange={handleSearchData}
            />

          </div>
          {/*======settings======*/}
          <Settings  />
         
        </div>

      </div>
      <div className='table-data'>
        
        <table className='tableContainer'>
          <thead>
            
            {estimateColumns.map((col, index) => ( 
                <tr key={index}>
                <th onClick={handleSort}>{col.id}
                {sortBy.column === 'id' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('description')}>{col.description}
                {sortBy.column === 'description' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('buildingType')}>{col.buildingType}
                {sortBy.column === 'buildingType' && (sortBy.direction === 'asc' ? '↑' : '↓') }
                </th>
                <th onClick={() => handleSort('job')}>{col.job}
                {sortBy.column === 'job' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>{col.status}
                {sortBy.column === 'status' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('date')}>{col.date}
                {sortBy.column === 'date' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('quoteTotal')}>{col.quoteTotal}
                {sortBy.column === 'quoteTotal' && (sortBy.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th></th>
                </tr>
                ))}
            
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
              <td><Link to="" style={{textDecoration: "underline", color:"#ccc", fontWeight: "700", cursor:"pointer"}}>{row.id}</Link></td>
              <td><Link to="" style={{textDecoration: "underline", color:"#ccc", fontWeight: "700", cursor: "pointer"}}>{row.description}</Link></td>
              <td>{row.buildingType}</td>
              <td>{row.job}</td>
              <td>{row.client}</td>
              <td>{row.date}</td>
              <td><strong>{row.quoteTotal}</strong></td>
              <td className="table-button">
                <div className="copyButton">
                  <button >
                    <CopyIcon />
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
          
        
        <button onClick={() => setCurrentPage((prevPage) => prevPage - 1)} disabled={currentPage === 0}>
          Prev
        </button>
        <button onClick={() => setCurrentPage((prevPage) => prevPage + 1)} disabled={currentPage === pageCount - 1}>
          Next
        </button>
        <span>
          Page {currentPage + 1} of {pageCount}
        </span>
       {/* {showConfirmation && ( 
          <CopyConfirmation 
          title="Copy Estimate ?"
          message="You about to make a copy of this estimate!"
          onConfirm={handleConfirmationCopy}
          onCancel={handleCloseConfirmation}
          /> )}
          {copyRowIndex !== null && ( 
            <DuplicateForm rowData={items[copyRowIndex]} onCancel={handleCloseConfirmation}/> )} */}
      </div>
     {/* {showConfirmation && ( 
      <DeleteConfirmation
      title= "Delete Estimate"
      message= "You can recover this Estimate by selecting 'Setting', then 'Deleted Items'" 
      onCancel={handleCloseDeleteConfirmation}
      onConfirm={handleConfirmationDelete }/> )}

      <RecycleBin deletedItems={deletedItems} onRecover={handleRecover} /> */}
     </div>

  )
}

export default EstimateList;