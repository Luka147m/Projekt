import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar.js';
import Map from './Map.js';

function App() {
  const [route, setRoute] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);

  useEffect(() => {
    fetch(`/api/routes`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Pogreška u odgovoru');
        }
      })
      .then((data) => {
        setRoutes(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

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
      <Sidebar
        setRoute={setRoute}
        tripInfo={tripInfo}
        routes={routes}
        setTripInfo={setTripInfo}
      />
      <Map
        routeData={routeData}
        tripInfo={tripInfo}
        setTripInfo={setTripInfo}
      />
    </div>
  );
}

export default App;
