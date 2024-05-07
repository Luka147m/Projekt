import { Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.motion/dist/leaflet.motion.js';
import { useEffect } from 'react';

const defaultIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/tram.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const hoverIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/tramHover.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const travellingIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/travHover.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const Markers = ({
  routeData,
  tripInfo,
  setTripInfo,
  setCoordinates,
  coordinates,
  setScrollToStop,
  selectedMarker,
  setSelectedMarker,
  mapContext,
}) => {
  // const [movingCoordinates, setMovingCoordinates] = useState(null);
  // const [time, setTime] = useState(null);
  // const [motionPolyline, setMotionPolyline] = useState(null);

  const handleMarkerClick = (tripId, stop_id, index) => {
    setScrollToStop(stop_id);

    setSelectedMarker(index);

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
      });
  };

  useEffect(() => {
    if (routeData) {
      const animateMarkers = async () => {
        const animationDataArray = [];

        // Create an array of promises for all fetch requests
        const fetchPromises = routeData.map((tram) =>
          fetch(`/api/trip/${tram.trip_id}`)
            .then((response) => response.json())
            .then((data) => {
              const tripInfoData = data[0];
              const startIndex = tripInfoData.trip_info.findIndex(
                (entry) => entry.stop_id === tram.stop_id
              );

              if (startIndex !== -1) {
                const relevantEntries =
                  tripInfoData.trip_info.slice(startIndex);

                let totalTimeInMillis = 0;
                for (let i = 0; i < relevantEntries.length; i++) {
                  const timeParts =
                    relevantEntries[i].time_till_next_stop.split(':');
                  const hours = parseInt(timeParts[0]);
                  const minutes = parseInt(timeParts[1]);
                  const seconds = parseInt(timeParts[2]);
                  totalTimeInMillis +=
                    (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
                }

                const movingCoord = relevantEntries.map((entry) => ({
                  lat: parseFloat(entry.stop_lat),
                  lon: parseFloat(entry.stop_lon),
                }));

                animationDataArray.push({
                  movingCoordinates: movingCoord,
                  time: totalTimeInMillis,
                });
              } else {
                console.log('Stop ID not found in the array.');
              }
            })
            .catch((error) => {
              console.error('Error fetching route data:', error);
            })
        );

        // Wait for all fetch requests to complete
        await Promise.all(fetchPromises);
        return animationDataArray;
      };

      animateMarkers().then((animationDataArray) => {
        animationDataArray.forEach((animationData) => {
          const { movingCoordinates, time } = animationData;

          const instance = L.motion.polyline(
            [movingCoordinates],
            {
              color: 'transparent',
            },
            {
              auto: true,
              duration: time,
            },
            {
              removeOnEnd: true,
              showMarker: true,
              icon: travellingIcon,
            }
          );

          mapContext.addLayer(instance);
        });
      });
    }
  }, [routeData, mapContext]);

  return (
    <div>
      {routeData &&
        routeData.map((tram) => (
          <Marker
            key={tram.id}
            position={[parseFloat(tram.stop_lat), parseFloat(tram.stop_lon)]}
            icon={selectedMarker === tram.id ? hoverIcon : defaultIcon}
            eventHandlers={{
              click: () =>
                handleMarkerClick(tram.trip_id, tram.stop_id, tram.id),
            }}
          >
            <Popup offset={L.point(0, -24)}>
              {'Tramvaj: ' + tram.id}
              <br />
              {'Ruta: ' + tram.route_id}
              <br />
              {'Trenutna stanica: ' + tram.stop_name}
            </Popup>
          </Marker>
        ))}
      ;
    </div>
  );
};

export default Markers;
