import React, {useEffect, useState} from 'react'
import "./style.css";
import { useHistory } from 'react-router-dom';
import EstimateTable from "../estimateList/EstimateTable"
import Search from "../estimateList/Search";
import { estimateRows } from '../../dataSource';
import Pagination from '../estimateList/Pagination';
import { Link } from 'react-router-dom';




const ITEMS_PER_PAGE = 5;//Number of items per page




const Estimate = () => {
  const history = useHistory();
  const [data, setData] = useState(estimateRows);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDataItem, setFilteredDataItem] = useState([]);
  const [selectedEstimate, setSelectedEstimate] = useState(null) //state to hold selected data for details
 


  //Function to add new estimate
  const addNewEstimate = (newEstimate) => {
    setData([...data, newEstimate])// add new estimate to this list
    setSelectedEstimate(newEstimate);// set the new estimate to select for details view
    //Logic to send data to database here
    //i'm hook for updating...
  }

  const searchData = (data, query) => {
    return data.filter(item =>
      item.description.toLowerCase()?.includes(query.toLowerCase()) ||
      item.client.toLowerCase()?.includes(query.toLowerCase()) ||
      item.status.toLowerCase()?.includes(query.toLowerCase())
    )
  };


  //Function to handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); //Reset to first page when search query changes
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

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
  
  useEffect(() => {
    const filtered = searchData(data, searchQuery);
    setFilteredDataItem(filtered);

  }, [data, searchQuery]);

  // calculate pagination variables
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredDataItem.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDataItem.length / ITEMS_PER_PAGE);

 
   
  return (
    <div className='estimate'>
      <div className="estimateContainer">
        <div className="textITem">
          <p>ESTIMATES({data.length})</p>
        </div>
        <div className="top-container">
          <div className="createEstimate">
            <Link to="/estimate/create">
              <button >Create New</button>
            </Link>
          </div>
          <div className="conatinerRight">
            <Search onSearch={handleSearch} />
            Settings
          </div>
        </div>
        <EstimateTable
          data={currentItems} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <div className="messageBox">
        </div>
      </div>
    </div>
  )
}

export default Estimate;