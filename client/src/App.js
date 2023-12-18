import React, { useEffect, useState } from 'react';
import './App.css';
import Menu from './Menu.js';
import Map from './Map.js';

function App() {
  const [route, setRoute] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);

  useEffect(() => {
    if (route) {
      const fetchData = () => {
        fetch(`/api/route/${route}`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Pogreška u odgovoru');
            }
          })
          .then((data) => {
            // console.log(data);
            setRouteData(data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      };
      fetchData();

      const intervalId = setInterval(fetchData, 10000);

      return () => clearInterval(intervalId);
    }
  }, [route]);

  return (
    <div className='container'>
      <Menu setRoute={setRoute} tripInfo={tripInfo} />
      <Map
        routeData={routeData}
        tripInfo={tripInfo}
        setTripInfo={setTripInfo}
      />
    </div>
  );
}

export default App;
