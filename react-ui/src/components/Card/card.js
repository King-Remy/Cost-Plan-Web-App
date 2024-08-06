import { useState } from 'react';

const CustomCard = ({ icon, title, body, onClick }) => {
  const [isHover, setIsHover] = useState(false);

  const customStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    width: '250px',
    cursor: 'pointer',
    backgroundColor: isHover ? 'rgba(0,0,0,0.1)' : 'white'
  };

  const handleMouseOn = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      style={customStyle}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseOn}
      onClick={() => {
        onClick();
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={() => onClick()}
      role="button"
      tabIndex={'0'}
    >
      <div style={{ marginBottom: '10px' }}>{icon}</div>
      <h5 style={{ fontWeight: 'bold' }}>{title}</h5>
      <p style={{ color: 'gray' }}>{body}</p>
    </div>
  );
};

export { CustomCard };
