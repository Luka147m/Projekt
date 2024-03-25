import { Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// import { useEffect, useState } from 'react';

const customIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/tram.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const Markers = ({
  routeData,
  tripInfo,
  setTripInfo,
  setCoordinates,
  setScrollToStop,
}) => {
  const handleMarkerClick = (tripId, stop_id) => {
    setScrollToStop(stop_id);
    fetch(`/api/trip/${tripId}`)
      .then((response) => response.json())
      .then((data) => {
        const tripInfoData = data[0];
        setTripInfo(tripInfoData);

        const newCoordinates = tripInfoData.trip_info.map((tram) => ({
          lat: parseFloat(tram.stop_lat),
          lon: parseFloat(tram.stop_lon),
        }));

        setCoordinates(newCoordinates);
      })
      .catch((error) => {
        console.error('Error fetching route data:', error);
      });
  };

  return (
    <div>
      {routeData &&
        routeData.map((tram, index) => (
          <Marker
            key={index}
            position={[parseFloat(tram.stop_lat), parseFloat(tram.stop_lon)]}
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(tram.trip_id, tram.stop_id),
            }}
          >
            <Popup>{tram.route_id + ' ' + tram.stop_name}</Popup>
          </Marker>
        ))}
      ;
    </div>
  );
};

export default Markers;
