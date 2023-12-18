import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Polyline } from 'react-leaflet';

const MapRouteLine = ({ coordinates }) => {
  return (
    <div>
      {coordinates && <Polyline positions={coordinates} color='blue' />}
    </div>
  );
};

export default MapRouteLine;
