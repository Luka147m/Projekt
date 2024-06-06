import { useEffect } from 'react';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const TripTimeline = ({ tripInfo, scrollToStop, routeDetails }) => {
  useEffect(() => {
    if (scrollToStop) {
      const elementToScrollTo = document.getElementById(`${scrollToStop}`);
      if (elementToScrollTo) {
        elementToScrollTo.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [scrollToStop, tripInfo]);

  return (
    <div className="info-container">
      <div className="sticky-header">
        <h4>Informacije o putu</h4>
        {routeDetails !== null && (
          <div>
            <h2>
              {routeDetails.route_id} {routeDetails.route_long_name}
            </h2>
            <h3>Smjer: {routeDetails.trip_headsign}</h3>
          </div>
        )}
      </div>
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
                borderRight: '7px solid rgb(33, 150, 243)',
              }}
              date={'Vrijeme dolaska ' + stop.arrival_time}
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
                Vrijeme potrebno do sljedeće stanice {stop.time_till_next_stop}
              </p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

export default TripTimeline;
