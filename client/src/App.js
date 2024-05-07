import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar.js';
import Clock from 'react-clock';
import Map from './Map.js';

import 'react-clock/dist/Clock.css';

function App() {
  const [route, setRoute] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);
  const [showTrips, setShowTrips] = useState(null);
  const [scrollToStop, setScrollToStop] = useState(null);
  const [time, setTime] = useState(new Date());
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [clockType, setClockType] = useState('analog');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
        // console.log(data);
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

  const toggleClockType = () => {
    setClockType(clockType === 'analog' ? 'digital' : 'analog');
  };

  return (
    <div className="container">
      <Sidebar
        setRoute={setRoute}
        tripInfo={tripInfo}
        routes={routes}
        setTripInfo={setTripInfo}
        setRouteData={setRouteData}
        setShowTrips={setShowTrips}
        scrollToStop={scrollToStop}
        setSelectedMarker={setSelectedMarker}
      />
      <Map
        routeData={routeData}
        tripInfo={tripInfo}
        showTrips={showTrips}
        setTripInfo={setTripInfo}
        setScrollToStop={setScrollToStop}
        selectedMarker={selectedMarker}
        setSelectedMarker={setSelectedMarker}
      />
      <div className="clock-container" onClick={toggleClockType}>
        {clockType === 'analog' ? (
          <Clock
            className="analog-clock"
            locale="hr"
            value={time}
            renderNumbers={true}
          />
        ) : (
          <div className="digital-clock">
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
