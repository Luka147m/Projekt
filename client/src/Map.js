import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import MapRouteLine from './MapRouteLine';
import Markers from './Markers';

const Map = ({ routeData, tripInfo, setTripInfo }) => {
  const [coordinates, setCoordinates] = useState(null);
  useEffect(() => {
    if (!tripInfo) {
      setCoordinates(null);
    }
  }, [tripInfo]);

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
      <Markers
        routeData={routeData}
        tripInfo={tripInfo}
        setTripInfo={setTripInfo}
        setCoordinates={setCoordinates}
      />
      <MapRouteLine coordinates={coordinates} />
    </MapContainer>
  );
};

export default Map;
