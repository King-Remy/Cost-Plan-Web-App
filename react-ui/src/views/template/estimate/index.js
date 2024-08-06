import React, { useCallback, useEffect } from 'react';

import { Row, Col, Card, Button } from 'react-bootstrap';
import IFCFileUpload from '../../extensions/IFCFileUpload';
import DashboardTable from '../../tables/DashboardTable';

const DashDefault = () => {
    
  return (
    <React.Fragment>

      <IFCFileUpload/>
      <DashboardTable/>

      
    </React.Fragment>
    
  );
};

export default DashDefault;
