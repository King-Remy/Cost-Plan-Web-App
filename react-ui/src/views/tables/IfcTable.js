import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Container, Row, Col, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams, useLocation } from 'react-router-dom';

const families = [
  'IfcWall', 'IfcOpeningElement', 'IfcBeam', 'IfcWindow', 'IfcColumn',
  'IfcMember', 'IfcRoof', 'IfcSlab', 'IfcDoor' ,'IfcStair', 'IfcStairFlight', 'IfcCovering', 'IfcFurniture',
  'IfcFlowTerminal', 'IfcBuildingElementProxy', 'IfcSanitaryTerminal',
  'IfcLightFixture', 'IfcFlowSegment'
];

const IfcTable2 = () => {
  const [familyData, setFamilyData] = useState({});
  const { id } = useParams();
  const location = useLocation();
  const { elements, code } = location.state || { elements: [], code: '' };

  useEffect(() => {
    const initialFamilyData = {};
    families.forEach(family => {
      initialFamilyData[family] = {
        rows: [],
        isCollapsed: false,
        status: "Not Required",  // Reset status to "Not Required"
        text: family
      };
    });

    if (elements && elements.length > 0) {
      elements.forEach(element => {
        const family = element.Family;
        if (initialFamilyData[family] && element.Type) {  // Only add rows with a value for "Type"
          initialFamilyData[family].rows.push({
            id: initialFamilyData[family].rows.length + 1,
            type: element.Type,
            area: element.Area ? element.Area.toFixed(2) : '',  // Round Area to 2 decimal places
            volume: element.Volume ? element.Volume.toFixed(2) : '',  // Round Volume to 2 decimal places
            length: element.Length ? element.Length.toFixed(2) : '',  // Round Thickness to 2 decimal places
            thickness: element.Thickness ? element.Thickness.toFixed(2) : ''  // Round Thickness to 2 decimal places
          });
        }
      });
    }

    setFamilyData(initialFamilyData);
  }, [elements]);

  const addRow = (family) => {
    setFamilyData(prevData => ({
      ...prevData,
      [family]: {
        ...prevData[family],
        rows: [...prevData[family].rows, { id: prevData[family].rows.length + 1, description: "", area: "", volume: "", thickness: "" }]
      }
    }));
  };

  const deleteRow = (family, id) => {
    setFamilyData(prevData => ({
      ...prevData,
      [family]: {
        ...prevData[family],
        rows: prevData[family].rows.filter(row => row.id !== id)
      }
    }));
  };

  const handleStatusChange = (family, newStatus) => {
    setFamilyData(prevData => ({
      ...prevData,
      [family]: {
        ...prevData[family],
        status: newStatus
      }
    }));
    localStorage.setItem(`$${family}_status`, newStatus);
  };

  const handleFamilyTextChange = (family, newText) => {
    setFamilyData(prevData => ({
      ...prevData,
      [family]: {
        ...prevData[family],
        text: newText
      }
    }));
  };

  const toggleCollapse = (family) => {
    setFamilyData(prevData => ({
      ...prevData,
      [family]: {
        ...prevData[family],
        isCollapsed: !prevData[family].isCollapsed
      }
    }));
  };

  const getButtonStyle = (buttonStatus, currentStatus) => {
    const baseStyle = {
      Thickness: '90px',
      height: '24px',
      fontSize: '0.7rem',
      padding: '0',
      border: '1px solid #ced4da',
      position: 'relative',
      overflow: 'hidden',
      fontWeight: 'bold'
    };

    const colors = {
      Complete: "#28a745",
      "Not Completed": "#ffc107",
      "Not Required": "#dc3545"
    };

    if (currentStatus === buttonStatus) {
      return {
        ...baseStyle,
        backgroundColor: colors[buttonStatus],
        color: 'white'
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'white',
      color: colors[buttonStatus],
      '::after': {
        content: '""',
        position: 'absolute',
        top: '2px',
        left: '2px',
        right: '2px',
        bottom: '2px',
        border: `1px solid $${colors[buttonStatus]}`,
        pointerEvents: 'none'
      }
    };
  };

  const tableStyle = {
    fontSize: '0.8rem',
  };

  const cellStyle = {
    padding: '0.25rem 0.5rem',
  };

  return (
    <Container className="p-2">
      {families.map(family => (
        <Card key={family} className="mb-2">
          <Card.Header
            onClick={() => toggleCollapse(family)}
            aria-controls={`collapse-content-$${family}`}
            aria-expanded={familyData[family]?.isCollapsed}
            style={{ cursor: 'pointer', padding: '0.5rem' }}
          >
            <Row className="align-items-center">
              <Col xs={6} className="d-flex align-items-center">
                <Form.Check type="checkbox" className="mr-2 mb-0" />
                <span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>{familyData[family]?.text}</span>
              </Col>
              <Col xs={6} className="d-flex justify-content-end">
                <div className="d-flex">
                  {["Complete", "Not Completed", "Not Required"].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      className="mr-1"
                      style={getButtonStyle(status, familyData[family]?.status)}
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(family, status); }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Collapse in={familyData[family]?.isCollapsed}>
            <div id={`collapse-content-${family}`}>
              <Card.Body className="p-2">
                <Row className="mb-2">
                  <Col>
                    <Form.Control 
                      size="sm" 
                      type="text" 
                      className="mb-1" 
                      value={familyData[family]?.text} 
                      onChange={(e) => handleFamilyTextChange(family, e.target.value)} 
                      style={{ fontSize: '1.5rem' }} 
                    />
                    <Form.Control size="sm" as="textarea" placeholder="Add internal notes here..." className="mb-2" style={{ padding: '0.5rem' }} />
                  </Col>
                </Row>
                {familyData[family]?.rows.length > 0 ? (
                  <Table bordered hover responsive className="mb-2" style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={cellStyle}>Type</th>
                        <th style={cellStyle}>Area</th>
                        <th style={cellStyle}>Volume</th>
                        <th style={cellStyle}>Length</th>
                        <th style={cellStyle}>Thickness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyData[family]?.rows.map(row => (
                        <tr key={row.id}>
                          <td style={cellStyle}>{row.type}</td>
                          <td style={cellStyle}><Form.Control size="sm" type="text" value={row.area} /></td>
                          <td style={cellStyle}><Form.Control size="sm" type="text" value={row.volume} /></td>
                          <td style={cellStyle}><Form.Control size="sm" type="text" value={row.length} /></td>
                          <td style={cellStyle}><Form.Control size="sm" type="text" value={row.thickness} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    You don't have any measurement elements here yet. Click the <Link to="/estimate">Create new</Link> button from the manage ifc page.
                  </p>
                )}
                <Row className="justify-content-end">
                  <Button size="sm" variant="success" className="mr-2 px-3 py-1">
                    Save
                  </Button>
                </Row>
              </Card.Body>
            </div>
          </Collapse>
        </Card>
      ))}
    </Container>
  );
};

export default IfcTable2;