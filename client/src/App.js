import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar.js';
import Clock from 'react-clock';
import Map from './Map.js';

import 'react-clock/dist/Clock.css';

function App() {
  // Odabrana ruta na list selectoru
  const [route, setRoute] = useState(null);
  // Lista sa svim mogucim rutama za odabrat
  const [routes, setRoutes] = useState(null);
  // Array s objektima tramvaja za odabranu rutu
  const [routeData, setRouteData] = useState(null);
  // Informacije o putovanju pojedinog tramvaja
  const [tripInfo, setTripInfo] = useState(null);
  // Za smjer filtriranje
  const [showTrips, setShowTrips] = useState(null);
  // Dokle scrolla prozorcic
  const [scrollToStop, setScrollToStop] = useState(null);
  // Sat
  const [time, setTime] = useState(new Date());
  // Odabrani marker
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
    if (route && route.length > 0) {
      const fetchDataForRoute = (routeValue) => {
        return fetch(`/api/route/${routeValue}`)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Pogreška u odgovoru');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            return [];
          });
      };

      // Promises za fetch svake rute
      const fetchPromises = route.map((routeValue) =>
        fetchDataForRoute(routeValue)
      );

      // Inicijalno
      // Zahtjevamo svaki fetch odjednom i cekamo sve
      Promise.all(fetchPromises)
        .then((allRouteData) => {
          // Kombiniramo sve podatke u jedno
          const combinedData = allRouteData.flat();
          // console.log(combinedData);
          setRouteData(combinedData);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      // Interval osvjezavanja podataka svakih 10sek
      const intervalId = setInterval(() => {
        Promise.all(fetchPromises)
          .then((allRouteData) => {
            const combinedData = allRouteData.flat();
            setRouteData(combinedData);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }, 10000);

      return () => clearInterval(intervalId);
    } else {
      setRouteData(null);
    }
  }, [route, routeData]);

  const toggleClockType = () => {
    setClockType(clockType === 'analog' ? 'digital' : 'analog');
  };

  return (
    <div className="container">
      <Sidebar
        route={route}
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
        route={route}
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
