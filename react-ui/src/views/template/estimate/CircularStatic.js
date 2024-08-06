import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';

function CircularProgressWithLabel({ value }) {
  return (
    <div style={{ position: 'relative', width: '50px', height: '50px' }}>
      <ProgressBar now={value} label={`${Math.round(value)}%`} variant="info" isLabelVisible={true} style={{ width: '100%', height: '100%' }} />
      <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          color: '#6c757d'
        }}>
        {/* {`${Math.round(value)}%`} */}
      </div>
    </div>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function CircularStatic({ value }) {
  return <CircularProgressWithLabel value={value} />;
}