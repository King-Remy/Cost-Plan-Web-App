import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Row, Col, Card, Table, Button, Tooltip, OverlayTrigger, Form, Pagination, ButtonToolbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { API_SERVER } from '../../config/constant';
import HandleAsyncError from '../template/estimate/HandleAsyncError';
import { useAuth } from '../../auth-context/auth.context';
import CircularStatic from '../template/estimate/CircularStatic';

function DashboardTable() {
  const [models, setModels] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [count, setCount] = useState(0);
  const [deleted, setDeleted] = useState('');
  const [selected, setSelected] = useState([]);
  const [modelElements, setModelElements] = useState(null);  // New state for model elements
  const [modelCode, setModelCode] = useState(null);  // New state for model code
  const handleAsyncError = HandleAsyncError();
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const history = useHistory();

  const headCells = [
    { id: 'filename', label: 'File Name' },
    { id: 'estimate', label: 'Estimate', render: data => renderCreateNewButton(data) },
    { id: '', label: '', render: data => renderProgress(data.progress, data.date) },
    { id: 'status', label: 'Status', render: data => renderStatus(data.status) },
    { id: 'download', label: 'Download', render: data => renderDownloadButton(data) }
  ];

  function EnhancedTableToolbar({ numSelected, onDelete }) {
    return (
      <ButtonToolbar>
        {numSelected > 0 && (
          <Button variant="danger" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        )}
      </ButtonToolbar>
    );
  }

  function computeRelativeDates(date) {
    var offset = date.getTimezoneOffset();
    date = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes() - offset,
      date.getUTCSeconds()
    )
  );

  var now = new Date();
  var difference = (now - date) / 1000; // convert from ms to s
  let [divisor, unit] = [[3600 * 24 * 8, null], [3600 * 24 * 7, "weeks"], [3600 * 24, "days"], [3600, "hours"], [60, "minutes"], [1, "seconds"]].filter(a => difference / a[0] > 1.)[0];
  if (unit) {
    var relativeTime = Math.floor(difference / divisor);
    if (relativeTime == 1) { unit = unit.slice(0, -1); } // Remove the 's' in units if only 1
    return (<span className="abs_time" title={date.toLocaleString()}>{relativeTime} {unit} ago</span>)
  } else {
    return date.toLocaleString();
  }
  }

  function renderStatus(status) {
    switch (status) {
      case 'info':
        return <OverlayTrigger placement="top" overlay={<Tooltip>Info</Tooltip>}>
          <span>ℹ️</span>
        </OverlayTrigger>;
      case 'error':
        return <OverlayTrigger placement="top" overlay={<Tooltip>Error</Tooltip>}>
          <span style={{ color: 'red' }}>⚠️</span>
        </OverlayTrigger>;
      default:
        return <span>{status}</span>;
    }
  }

  function renderProgress(progress, date) {
    if (progress === 100) {
      return <span>{computeRelativeDates(new Date(date))}</span>;
    } else if (progress === -1) {
      return <span>In queue</span>;
    } else if (progress === -2) {
      return <span>An error occurred</span>;
    } else {
      return <CircularStatic value={progress} />;
    }
  }

  const renderDownloadButton = (model) => (
    <Button onClick={(event) => { event.stopPropagation(); handleDownload(model); }} variant="primary">Download</Button>
  );

  const renderCreateNewButton = (model) => (
    <Button variant="primary" onClick={(event) => { event.stopPropagation(); handleCreateNew(model); }}>Create New</Button>
  );

  const handleCreateNew = (model) => {
    const token = user?.token;
    fetch(`${API_SERVER}/model_elements/${model.id}`, {
      headers: {
        Authorization: token
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Model Elements:', data.elements);
          setModelElements(data.elements);  // Set the element data
          setModelCode(data.code);  // Set the model code
          history.push(`/estimate/list/${data.code}`, { elements: data.elements, code: data.code });  // Navigate to /estimate/list/:id with elements and code
        } else {
          console.error('Error:', data.msg);
        }
      })
      .catch(handleAsyncError);
  };

  

  const handleDownload = (model) => {
    const token = user?.token
    fetch(`${API_SERVER}/download/${model.id}`, {
      headers: {
        Authorization: token
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.filename}.ifc`; // Assuming the file type is known
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(handleAsyncError);
  };

  useEffect(() => {
    fetch(`${API_SERVER}/models_paginated/${page * rowsPerPage}/${page * rowsPerPage + rowsPerPage}`, {headers: { Authorization: user.token }})
      .then(response => response.json())
      .then(json => {
        setModels(json.models);
        setCount(json.count);
        if (json.models.some(m => (m.progress < 100))) {
          setTimeout(() => {setProgress(progress + 1)}, 5000)
        }
      }).catch(handleAsyncError);
  }, [page, rowsPerPage,deleted, progress, handleAsyncError]);

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = models.map(n => n.id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  useEffect(() => {
    if (deleted) {
      fetch(`${API_SERVER}/delete/${deleted}`, {
        method: 'POST',
        headers: {
          Authorization: user?.token
        }
      })
      .then(response => response.json())
      .then(() => {
        // Update models to remove deleted items
        setModels(models.filter(model => !deleted.split('.').includes(model.id.toString()))); 
        setSelected([]);
        setDeleted('');
      })
      .catch(handleAsyncError);
    }
  }, [deleted, models, user?.token]);

  const handleClick = (event, id) => {
    setSelected([id]);
  };

  const onDelete = () => {
    setDeleted(selected.join('.'));
  };

  const isSelected = name => selected.indexOf(name) !== -1;

  // Calculate the total number of pages
  const totalPages = Math.ceil(count / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

return (
  <Row>
      <Col>
        <Card>
          <Card.Header>
            <Card.Title as="h5">IFC Table</Card.Title>
          </Card.Header>
          <Card.Body>
            <EnhancedTableToolbar numSelected={selected.length} onDelete={onDelete} />
            <Table responsive>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selected.length === models.length}
                      indeterminate={selected.length > 0 && selected.length < models.length}
                      onChange={handleSelectAllClick}
                    />
                  </th>
                  {headCells.map(headCell => (
                    <th key={headCell.id}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-${headCell.id}`}>{headCell.label}</Tooltip>}
                      >
                        <span>{headCell.label}</span>
                      </OverlayTrigger>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((model, index) => {
                  const isItemSelected = isSelected(model.id);
                  return (
                    <tr key={model.id} selected={isItemSelected} onClick={event => handleClick(event, model.id)}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${index}` }}
                        />
                      </td>
                      {headCells.map(cell => (
                        <td key={cell.id}>{cell.render ? cell.render(model) : model[cell.id]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(0)} disabled={page === 0} />
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item key={index} active={index === page} onClick={() => handlePageChange(index)}>
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1} />
              <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={page === totalPages - 1} />
            </Pagination>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default DashboardTable;