import React,{useState, useEffect} from 'react';
import "./style.css";
import {templateColumns, templateRows } from '../../estimate/dataSource';
import { Link } from 'react-router-dom';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import Settings from './Settings';
// import {useHistory} from "react-router-dom";



const TemplateList = () => {

  // const history = useHistory();

  const [data, setData] = useState(templateRows);
  const [searchItem, setSearrchItem] = useState("");


  useEffect(()=> {
    const baseURL = "http://localhost:5000/api/estimates";
    const fetchData = async () => {
      try {
        const response = await fetch(baseURL)
        if(!response.ok){
          throw new Error("Network reaponse not ok")
        }else {
          const data = await response.json();
          setData(data)
          console.log(data)
        }
      } catch (error) {
        console.log("error")
      }
    }
    fetchData()
  },[]);



  const handleSearchData = (event) => {
    setSearrchItem(event.target.value);

  };

  

  
  return (
    <div className="dataContainer">
      <div className="itemContainer">
        <div className="leftContainer">
          <div className="textITem">
            <p>ESTIMATE TEMPLATES({data.length})</p>
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
            
            {templateColumns.map((col, index) => ( 
                <tr key={index}>
                <th>{col.id}</th>
                <th>{col.description}</th>
                <th>{col.buildingType}</th>
                <th>{col.job}</th>
                <th>{col.status}</th>
                <th>{col.date}</th>
                <th>{col.quoteTotal}</th>
                <th>{col.updated}</th>
                <th></th>
                </tr>
                ))}
            
          </thead>
          <tbody>
            {templateRows.map((row, id) => (
              <tr key={id}>
              <td><Link to="/estimate/list/:id/Costings" style={{textDecoration: "underline", color:"#ccc", fontWeight: "700", cursor:"pointer"}}>{row.id}</Link></td>
              <td><Link to="/estimate/list/:id/Costings" style={{textDecoration: "underline", color:"#ccc", fontWeight: "700", cursor: "pointer"}}>{row.description}</Link></td>
              <td>{row.buildingType}</td>
              <td>{row.job}</td>
              <td>{row.client}</td>
              <td>{row.date}</td>
              <td><strong>{row.quoteTotal}</strong></td>
              <td>{row.updated}</td>
              <td>
                <div className="addItem">
                  <button>
                    <AddOutlinedIcon  className="add-btn"/>
                  </button>
                </div>
              </td>
            </tr>))}
          </tbody>
        </table>
        
        
      </div>
    </div>

  )
}

export default TemplateList;