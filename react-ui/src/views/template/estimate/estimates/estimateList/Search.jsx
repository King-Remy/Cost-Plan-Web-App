import React, {useState} from 'react';
import "./style.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const Search = ({onSearch}) => {
  const [query, setQuery] = useState('');


  const handleSearchData = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    
  };


  return (
    <div className="searchItemEstimate">

      <SearchOutlinedIcon className="searchIcon" />
      <input
        type="text"
        placeholder='Search...'
        value={query}
        onChange={handleSearchData}
      />

    </div>
  )
}

export default Search