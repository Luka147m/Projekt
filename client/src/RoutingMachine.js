import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';

const createRoutineMachineLayer = (props) => {
  const coordinates = props.coordinates.map(({ lat, lon }) => [lat, lon]);

  const instance = L.Routing.control({
    waypoints: coordinates.map((coord) => L.latLng(coord[0], coord[1])),
    lineOptions: {
      styles: [{ color: '#6FA1EC', weight: 4 }],
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: true,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);
export default RoutingMachine;
