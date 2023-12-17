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

const Map = ({ markerData, isChecked }) => {
  const [routeData, setRouteData] = useState(null);
  const coordinates = routeData
    ? routeData[0]
      ? routeData[0].json_agg
      : []
    : [];

  const customIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/tram.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  useEffect(() => {
    if (isChecked) {
      const tripId = markerData[0].trip_id;
      fetch(`/api/trip/${tripId}`)
        .then((response) => response.json())
        .then((data) => {
          setRouteData(data);
        })
        .catch((error) => {
          console.error('Error fetching route data:', error);
        });
    } else {
      setRouteData(null);
    }
  }, [isChecked, markerData]);

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
      {markerData.map((stop, index) => (
        <Marker
          key={index}
          position={[parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)]}
          icon={customIcon}
        >
          <Popup>{stop.stop_name}</Popup>
        </Marker>
      ))}
      {coordinates.length > 0 && (
        <Polyline
          positions={coordinates.map((coord) => [coord.lat, coord.lon])}
          color='blue'
        />
      )}
      {/* {coordinates.length > 0 && <RoutingMachine coordinates={coordinates} />} */}
    </MapContainer>
  );
};

export default Map;
