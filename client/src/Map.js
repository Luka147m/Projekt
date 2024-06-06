import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import MapRouteLine from './MapRouteLine';
import Markers from './Markers';

const Map = ({
  route,
  routeData,
  tripInfo,
  setTripInfo,
  setScrollToStop,
  selectedMarker,
  setSelectedMarker,
  setRouteDetails,
}) => {
  const [coordinates, setCoordinates] = useState(null);
  const [mapContext, setMapContext] = useState();
  const [watchedRoute, setWatchedRoute] = useState(null);

  useEffect(() => {
    if (!tripInfo || !route || !route.includes(watchedRoute)) {
      setCoordinates(null);
      setTripInfo(null);
    }
  }, [tripInfo, route, watchedRoute, setTripInfo]);

  const MapClickHandler = () => {
    useMapEvents({
      click: () => {
        setSelectedMarker(null);
        setWatchedRoute(null);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[45.808680463038435, 15.977835680373971]}
      zoom={13}
      zoomControl={false}
      whenReady={(event) => setMapContext(event.target)}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Markers
        routeData={routeData}
        tripInfo={tripInfo}
        setTripInfo={setTripInfo}
        setCoordinates={setCoordinates}
        coordinates={coordinates}
        setScrollToStop={setScrollToStop}
        selectedMarker={selectedMarker}
        setSelectedMarker={setSelectedMarker}
        mapContext={mapContext}
        setWatchedRoute={setWatchedRoute}
        setRouteDetails={setRouteDetails}
      />
      <MapRouteLine coordinates={coordinates} />
      <MapClickHandler />
    </MapContainer>
  );
};

export default Map;
