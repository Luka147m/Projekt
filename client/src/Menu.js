import React, { useState } from 'react';

const Menu = ({ setRoute }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setRoute(inputValue);
    }
  };

  return (
    <div className='menu-component'>
      <h1>Zet tracker</h1>
      <input
        type='text'
        value={inputValue}
        placeholder='Unesi broj linije!'
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      <button onClick={() => setRoute(inputValue)}>Prikaži</button>
    </div>
  );
};

export default Menu;
