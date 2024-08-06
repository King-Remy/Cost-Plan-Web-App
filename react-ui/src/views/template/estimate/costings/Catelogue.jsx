import React, {useState} from 'react';
import "./style.css";
import KeyboardBackIcon from "@mui/icons-material/ArrowBackIos";
import KeyboardForwardIcon from "@mui/icons-material/ArrowForwardIos";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const Catelogue = () => {
const [isExpended, setIsExpended] = useState(false);

const toggleCatelogue = () => {
    setIsExpended(true);
}

const closeCatelogue = () => {
    setIsExpended(false)
}

  return (
      <div className="categorySidebar">
          <div className="sidebarContainer">
              <div className="btn-forward">
                  <button onClick={toggleCatelogue}>
                      <KeyboardBackIcon style={{ fontSize: "16px", cursor: "pointer" }} />
                  </button>
                  <hr />
              </div>
              <div className="container-control">
                  <div className={`expend-container ${isExpended ? 'expanded' : 'collapsed'}`}>
                      <div className="title-expend">
                          <button onClick={closeCatelogue}>
                              <KeyboardForwardIcon style={{ fontSize: "16px", cursor: "pointer" }} />
                          </button>
                          <span>All</span>
                      </div>
                      <div className="expand-content">
                          <div className="content-left">
                              <span className="catSpan-exp">Catelogues</span>
                              <span className="reciSpan-exp">Recipes</span>
                          </div>
                          <div className="content-right">
                              <div className="search-input">
                                  <SearchOutlinedIcon className="search" />
                                  <input
                                      type="text"
                                      name=""
                                  />
                              </div>
                              <div className="title-cat">
                                  <span>My Catelogues</span>
                                  <KeyboardForwardIcon style={{ fontSize: "12px" }} />
                                  <span classNam="count">1</span>
                              </div>
                              <div className="context-text">
                                  <div className="text-heading">
                                      <h4>Connect to your suppliers</h4>
                                      <button>X</button>
                                  </div>
                                  <div className="textItem">
                                      <span>
                                          Connect with suppliers and access their<br />
                                          complete catelogues, including live prices.
                                          Add their items to your estimate and receive <br />
                                          automatic notifications for any price updates.
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="mini-container">
                      <span className="catSpan">Catelogues</span>
                      <span className="reciSpan">Recipes</span>
                  </div>

              </div>

          </div>

      </div>
  )
}

export default Catelogue;