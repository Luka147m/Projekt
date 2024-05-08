import { Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.motion/dist/leaflet.motion.js';
import { useEffect, useState } from 'react';

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
  setTripInfo,
  setCoordinates,
  setScrollToStop,
  selectedMarker,
  setSelectedMarker,
  mapContext,
}) => {
  const [animationDataArray, setAnimationDataArray] = useState([]);
  const [instanceIds, setInstanceIds] = useState([]);
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
        const newAnimationDataArray = [];

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

                // Vrijeme za animaciju
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

                // Kordinate za animaciju
                const movingCoord = relevantEntries.map((entry) => ({
                  lat: parseFloat(entry.stop_lat),
                  lon: parseFloat(entry.stop_lon),
                }));

                // Provjeri postoji li animacija za taj tramvaj
                const existingEntryIndex = animationDataArray.findIndex(
                  (entry) => entry.id === tram.id
                );

                // console.log(existingEntryIndex);

                // Ako postoji
                if (existingEntryIndex !== -1) {
                  // Ako je na drugoj stanici, redraw
                  if (
                    animationDataArray[existingEntryIndex].stop_id !==
                    tram.stop_id
                  ) {
                    // console.log(
                    //   'pronasao ' +
                    //     animationDataArray[existingEntryIndex].stop_id +
                    //     ' ' +
                    //     tram.stop_id
                    // );
                    animationDataArray.splice(existingEntryIndex, 1);
                    newAnimationDataArray.push({
                      id: tram.id,
                      moved: true,
                      movingCoordinates: movingCoord,
                      time: totalTimeInMillis,
                      stop_id: tram.stop_id,
                    });
                  }
                  if (animationDataArray[existingEntryIndex].moved) {
                    animationDataArray.splice(existingEntryIndex, 1);
                    newAnimationDataArray.push({
                      id: tram.id,
                      moved: false,
                      movingCoordinates: movingCoord,
                      time: totalTimeInMillis,
                      stop_id: tram.stop_id,
                    });
                  }
                } else {
                  // Ako ne postoji dodaj
                  newAnimationDataArray.push({
                    id: tram.id,
                    moved: false,
                    movingCoordinates: movingCoord,
                    time: totalTimeInMillis,
                    stop_id: tram.stop_id,
                  });
                }
              } else {
                console.log('Stop ID not found in the array.');
              }
            })
            .catch((error) => {
              console.error('Error fetching route data:', error);
            })
        );

        await Promise.all(fetchPromises);

        // Brise tramvaje koje vise ne pratimo
        const filteredAnimationDataArray = animationDataArray.filter((entry) =>
          routeData.some((tram) => tram.id === entry.id)
        );

        setAnimationDataArray([
          ...filteredAnimationDataArray,
          ...newAnimationDataArray,
        ]);
      };

      animateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData]);

  useEffect(() => {
    animationDataArray.forEach((animationData) => {
      const { id, moved, movingCoordinates, time } = animationData;

      // console.log(`${id} tramvaj se pomakao ${moved}`);
      // console.log(instanceIds);
      const instanceExists = instanceIds.includes(id);
      if (instanceExists) {
        // console.log('postoji');
        if (moved) {
          // console.log('pomako se');
          removeInstanceById(id);
        } else {
          // console.log('skipp');
          // If the tram hasn't moved, skip adding a new instance
          return;
        }
      }

      // Create a new animation instance
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
      const popupContent = 'Predikcija Tramvaj ' + id;
      instance.bindPopup(popupContent, { offset: L.point(0, -24) });
      instance._id = id;
      mapContext.addLayer(instance);
      setInstanceIds((prevInstanceIds) => [...prevInstanceIds, id]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationDataArray, mapContext]);

  const removeInstanceById = (id) => {
    mapContext.eachLayer((layer) => {
      if (layer instanceof L.Polyline && layer._id === id) {
        mapContext.removeLayer(layer);
        // Remove the ID from the instanceIds state
        setInstanceIds((prevInstanceIds) =>
          prevInstanceIds.filter((instanceId) => instanceId !== id)
        );
      }
    });
  };

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
