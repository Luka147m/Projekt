import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const Sidebar = ({ setRoute, tripInfo, setTripInfo, routes }) => {
  const [options, setOptions] = useState('');

  useEffect(() => {
    if (routes) {
      setOptions(routes.map((number) => ({ value: number, label: number })));
      setTripInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  return (
    <div className='sidebar-component'>
      <h1>Zet tracker</h1>
      {routes && (
        <Select
          options={options}
          isClearable={false}
          isSearchable={true}
          onChange={(choice) => setRoute(choice.value)}
        />
      )}
      {tripInfo && (
        <VerticalTimeline
          layout={'1-column-left'}
          lineColor='#000'
          className='timeline-container'
        >
          <h2 className='h2-title-sidebar'>
            {tripInfo.trip_info[0].stop_headsign}
          </h2>
          {tripInfo.trip_info.map((stop, index) => (
            <VerticalTimelineElement
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
              icon={null}
              iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
            >
              <h3 className='vertical-timeline-element-title'>
                {stop.stop_name}
              </h3>
              <p>
                Vrijeme potrebno do sljedeće stanice {stop.time_till_next_stop}
              </p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      )}
    </div>
  );
};

export default Sidebar;
