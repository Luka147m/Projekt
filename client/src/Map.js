import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import RoutingMachine from './RoutingMachine';
import MarkerClusterGroup from 'react-leaflet-markercluster';

const Map = ({ routeData, setTripInfo }) => {
  const customIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/tram.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const handleMarkerClick = (tripId) => {
    fetch(`/api/trip/${tripId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setTripInfo(data);
      })
      .catch((error) => {
        console.error('Error fetching route data:', error);
      });
  };

  return (
    <MapContainer
      center={[45.808680463038435, 15.977835680373971]}
      zoom={13}
      zoomControl={false}
    >
      <ZoomControl position='bottomright' />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {/* <MarkerClusterGroup>
        {markerData.map((tram, index) => (
          <Marker
            key={index}
            position={[parseFloat(tram.stop_lat), parseFloat(tram.stop_lon)]}
            icon={customIcon}
          >
            <Popup>
              {tram.route_id} {tram.stop_name}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup> */}

      {routeData !== null &&
        routeData.map((tram, index) => (
          <Marker
            key={index}
            position={[parseFloat(tram.stop_lat), parseFloat(tram.stop_lon)]}
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(tram.trip_id),
            }}
          >
            <Popup>{tram.route_id + tram.stop_name}</Popup>
          </Marker>
        ))}
      {/* {coordinates.length > 0 && (
        <Polyline
          positions={coordinates.map((coord) => [coord.lat, coord.lon])}
          color='blue'
        />
      )} */}
      {/* {coordinates.length > 0 && <RoutingMachine coordinates={coordinates} />} */}
    </MapContainer>
  );
};

export default Map;
