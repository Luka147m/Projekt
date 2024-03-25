import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const Sidebar = ({
  setRoute,
  tripInfo,
  routes,
  setTripInfo,
  setShowTrips,
  setRouteData,
  scrollToStop,
}) => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [options, setOptions] = useState('');

  const [selectedOption, setSelectedOption] = useState('svi');

  const handleOptionChange = (event) => {
    const optionValue = event.target.value;
    setSelectedOption(optionValue);
  };

  useEffect(() => {
    if (routeInfo) {
      setTripInfo(null);

      const tripIds = [];

      routeInfo[0].route_info.forEach((route) => {
        // console.log('Usporedujem ' + route.trip_headsign + ' sa ' + optionValue);
        // Z.kolodvor i Zap. kolodvor .... isuse kriste
        if (
          selectedOption === 'svi' ||
          route.trip_headsign.trim() === selectedOption.trim()
        ) {
          tripIds.push(route.trip_id);
        }
      });
      // console.log(tripIds);
      setShowTrips(tripIds);
    }
  }, [selectedOption, routeInfo, setShowTrips, setTripInfo]);

  useEffect(() => {
    if (routes) {
      setOptions(routes.map((number) => ({ value: number, label: number })));
      setTripInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  const handleRouteChange = async (choice) => {
    if (choice) {
      setRouteData(null);
      setTripInfo(null);
      setSelectedOption('svi');

      const selectedValue = choice.value;
      setRoute(selectedValue);

      fetch(`/api/routeInfo/${selectedValue}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Pogreška u odgovoru');
          }
        })
        .then((data) => {
          setRouteInfo(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  };

  useEffect(() => {
    if (scrollToStop) {
      const elementToScrollTo = document.getElementById(`${scrollToStop}`);
      if (elementToScrollTo) {
        elementToScrollTo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [scrollToStop, tripInfo]);

  return (
    <div className="sidebar-component">
      <h1>Zet tracker</h1>
      {routes && (
        <Select
          options={options}
          isClearable={false}
          isSearchable={true}
          onChange={handleRouteChange}
        />
      )}

      {routeInfo && (
        <div className="selector-div">
          <h2>{routeInfo[0].route_info[0].route_long_name}</h2>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value={routeInfo[0].route_info[0].route_long_name.split('-')[0]}
                checked={
                  selectedOption ===
                  routeInfo[0].route_info[0].route_long_name.split('-')[0]
                }
                onChange={handleOptionChange}
              />
              {routeInfo[0].route_info[0].route_long_name.split('-')[0]}
            </label>
            <label>
              <input
                type="radio"
                value="svi"
                checked={selectedOption === 'svi'}
                onChange={handleOptionChange}
              />
              Svi
            </label>
            <label>
              <input
                type="radio"
                value={routeInfo[0].route_info[0].route_long_name.split('-')[1]}
                checked={
                  selectedOption ===
                  routeInfo[0].route_info[0].route_long_name.split('-')[1]
                }
                onChange={handleOptionChange}
              />
              {routeInfo[0].route_info[0].route_long_name.split('-')[1]}
            </label>
          </div>
        </div>
      )}
      {tripInfo && (
        <div className="timeline-container">
          <VerticalTimeline layout={'1-column-left'} lineColor="#000">
            {tripInfo.trip_info.map((stop, index) => (
              <VerticalTimelineElement
                id={`${stop.stop_id}`}
                key={index}
                contentStyle={{
                  background: 'rgb(33, 150, 243)',
                  color: '#fff',
                  padding: '10px',
                }}
                contentArrowStyle={{
                  borderRight: '7px solid  rgb(33, 150, 243)',
                }}
                date={stop.arrival_time}
                icon={
                  <img
                    src={process.env.PUBLIC_URL + 'stanica.png'}
                    alt="stanica"
                    height="35px"
                    width="auto"
                  />
                }
                iconStyle={{
                  background: 'rgb(33, 150, 243)',
                  color: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                data-id={stop.stop_id}
              >
                <h3 className="vertical-timeline-element-title">
                  {stop.stop_name}
                </h3>
                <p>
                  Vrijeme potrebno do sljedeće stanice{' '}
                  {stop.time_till_next_stop}
                </p>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
