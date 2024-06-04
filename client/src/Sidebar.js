import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import 'react-vertical-timeline-component/style.min.css';
import './App.css';

const Sidebar = ({
  route,
  setRoute,
  routes,
  setTripInfo,
  setSelectedMarker,
}) => {
  const [options, setOptions] = useState('');
  const [stops, setStops] = useState(null);
  const [selectedValue1, setSelectedValue1] = useState(null);
  const [selectedValue2, setSelectedValue2] = useState(null);
  const [noRoutesFound, setNoRoutesFound] = useState(false);

  const addValueToRoute = (newValue) => {
    setRoute((prevRoute) => {
      if (prevRoute && prevRoute.includes(newValue)) {
        return prevRoute;
      }
      return [...(prevRoute || []), newValue];
    });
  };

  const deleteValueFromRoute = (indexToRemove) => {
    setRoute((prevRoute) => {
      const updatedRoute = prevRoute.filter(
        (_, index) => index !== indexToRemove
      );
      return updatedRoute.length > 0 ? updatedRoute : null;
    });
  };

  useEffect(() => {
    // console.log('[Info] Fetch all stops');
    fetch(`/api/stops`)
      .then((response) => response.json())
      .then((data) => {
        const stopNamesArray = data.map((stop) => ({
          value: stop.stop_name,
          label: stop.stop_name,
        }));
        // console.log(stopNamesArray);
        setStops(stopNamesArray);
      });
  }, []);

  useEffect(() => {
    if (routes) {
      setOptions(routes.map((number) => ({ value: number, label: number })));
      setTripInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  const handleRouteChange = async (choice) => {
    if (choice) {
      setTripInfo(null);
      setSelectedMarker(null);
      const selectedValue = choice.value;
      addValueToRoute(selectedValue);
    }
  };

  const findRoute = () => {
    if (selectedValue1 !== null || selectedValue2 !== null) {
      fetch(`/api/findRoute/${selectedValue1}_${selectedValue2}`)
        .then((response) => response.json())
        .then((data) => {
          // console.log(data[0].routes[0]);
          if (data[0]?.routes[0]?.length === 0) {
            setNoRoutesFound(true);
            setTimeout(() => {
              setNoRoutesFound(false);
            }, 5000);
          } else {
            const stringifiedNumbers = data[0].routes[0].map((number) =>
              number.toString()
            );
            setRoute(stringifiedNumbers);
          }
        });
    }
  };

  return (
    <div className="sidebar-component">
      <h1>Zet tracker</h1>
      {routes && (
        <Select
          options={options}
          isClearable={false}
          isSearchable={true}
          onChange={handleRouteChange}
          className="main-select"
        />
      )}
      <fieldset className="routeFind-box">
        <legend>Pronađi liniju</legend>
        <h4>Polazište:</h4>
        <Select
          options={stops}
          isClearable={false}
          isSearchable={true}
          onChange={(selectedOption) => {
            setSelectedValue1(selectedOption.value);
          }}
          className="selectBox"
        />
        <h4>Odredište:</h4>
        <Select
          options={stops}
          isClearable={false}
          isSearchable={true}
          onChange={(selectedOption) => {
            setSelectedValue2(selectedOption.value);
          }}
          className="selectBox"
        />
        <button className="customBtn" onClick={() => findRoute()}>
          Pronađi
        </button>
        {noRoutesFound && (
          <div className="no-routes-message">
            Nije pronađena nijedna linija!
          </div>
        )}
      </fieldset>

      {route && (
        <fieldset className="selected-routes">
          <legend>Odabrane rute: </legend>
          <div className="routeScroll">
            {route.map((value, index) => (
              <div className="selected" key={index}>
                <p>{value}</p>
                <button
                  className="customBtn"
                  onClick={() => deleteValueFromRoute(index)}
                >
                  Obriši
                </button>
              </div>
            ))}
          </div>
          {route.length > 3 && (
            <button className="customBtn" onClick={() => setRoute(null)}>
              Obriši sve
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
};

export default Sidebar;
