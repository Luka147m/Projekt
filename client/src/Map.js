import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import MapRouteLine from './MapRouteLine';
import Markers from './Markers';

const Map = ({
  routeData,
  tripInfo,
  setTripInfo,
  showTrips,
  setScrollToStop,
}) => {
  const [coordinates, setCoordinates] = useState(null);
  const [filteredRouteData, setFilteredRouteData] = useState(null);

  useEffect(() => {
    if (!tripInfo) {
      setCoordinates(null);
    }
  }, [tripInfo]);

  useEffect(() => {
    if (routeData) {
      if (!showTrips) {
        setFilteredRouteData(routeData);
      } else {
        const filteredData = routeData.filter((obj) =>
          showTrips.includes(obj.trip_id)
        );
        setFilteredRouteData(filteredData);
      }
    }
  }, [showTrips, routeData]);

  return (
    <MapContainer
      center={[45.808680463038435, 15.977835680373971]}
      zoom={13}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Markers
        routeData={filteredRouteData}
        tripInfo={tripInfo}
        setTripInfo={setTripInfo}
        setCoordinates={setCoordinates}
        setScrollToStop={setScrollToStop}
      />
      <MapRouteLine coordinates={coordinates} />
    </MapContainer>
  );
};

export default Map;
