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

const travellingSelectedIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/travSelected.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const stopIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/stanica.png',
  iconSize: [24, 24],
  iconAnchor: [16, 32],
});

const Markers = ({
  routeData,
  setTripInfo,
  tripInfo,
  setCoordinates,
  setScrollToStop,
  selectedMarker,
  setSelectedMarker,
  mapContext,
  setWatchedRoute,
}) => {
  const [animationDataArray, setAnimationDataArray] = useState([]);
  const [instanceMap, setInstanceMap] = useState({});
  const [oldSelected, setOldSelected] = useState(null);

  useEffect(() => {
    if (selectedMarker === null) {
      const oldInstance = instanceMap[oldSelected];
      if (oldInstance) {
        let marker = oldInstance.getMarker();
        marker.setIcon(travellingIcon);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarker]);

  const handleMarkerClick = (trip_id, stop_id, tram_id, route_id) => {
    setScrollToStop(stop_id);

    setWatchedRoute(route_id);

    const oldInstance = instanceMap[selectedMarker];
    if (oldInstance) {
      let marker = oldInstance.getMarker();
      marker.setIcon(travellingIcon);
    }

    const instance = instanceMap[tram_id];
    if (instance) {
      let marker = instance.getMarker();
      marker.setIcon(travellingSelectedIcon);
    }

    setSelectedMarker(tram_id);
    setOldSelected(tram_id);

    fetch(`/api/trip/${trip_id}`)
      .then((response) => response.json())
      .then((data) => {
        const tripInfoData = data[0];
        setTripInfo(tripInfoData);

        // console.log(tripInfoData.trip_info);
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

                // Ako postoji
                if (existingEntryIndex !== -1) {
                  // Ako je na drugoj stanici, redraw
                  if (
                    animationDataArray[existingEntryIndex].stop_id !==
                      tram.stop_id &&
                    animationDataArray[existingEntryIndex] !== undefined
                  ) {
                    animationDataArray.splice(existingEntryIndex, 1);
                    newAnimationDataArray.push({
                      id: tram.id,
                      moved: true,
                      movingCoordinates: movingCoord,
                      time: totalTimeInMillis,
                      stop_id: tram.stop_id,
                    });
                  }
                  if (
                    animationDataArray[existingEntryIndex].moved &&
                    animationDataArray[existingEntryIndex] !== undefined
                  ) {
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
                console.log('[Info] Tram ID not found in the array.');
              }
            })
            .catch((error) => {
              console.error('[Error]:', error);
            })
        );

        await Promise.all(fetchPromises);

        // Brise tramvaje koje vise ne pratimo
        const filteredAnimationDataArray = animationDataArray.filter((entry) =>
          routeData.some((tram) => tram.id === entry.id)
        );

        const markersToDelete = animationDataArray.filter(
          (entry) => !routeData.some((tram) => tram.id === entry.id)
        );

        markersToDelete.forEach((marker) => {
          removeInstanceById(marker.id);
        });

        setAnimationDataArray([
          ...filteredAnimationDataArray,
          ...newAnimationDataArray,
        ]);
      };

      animateMarkers();
    } else {
      Object.keys(instanceMap).forEach((id) => {
        removeInstanceById(id);
      });
      setAnimationDataArray([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeData]);

  useEffect(() => {
    animationDataArray.forEach((animationData) => {
      const { id, moved, movingCoordinates, time } = animationData;
      const instanceExists = !!instanceMap[id];
      if (instanceExists) {
        if (moved) {
          removeInstanceById(id);
        } else {
          return;
        }
      }

      if (routeData) {
        let icon = travellingIcon;

        if (selectedMarker === id) {
          icon = travellingSelectedIcon;
        }

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
            icon: icon,
          }
        );
        const popupContent = 'Predikcija Tramvaj ' + id;
        instance.bindPopup(popupContent, { offset: L.point(0, -24) });
        instance._id = id;
        mapContext.addLayer(instance);
        setInstanceMap((prevInstanceMap) => ({
          ...prevInstanceMap,
          [id]: instance,
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationDataArray, mapContext]);

  const removeInstanceById = (id) => {
    mapContext.eachLayer((layer) => {
      if (layer instanceof L.Polyline && layer._id === id) {
        mapContext.removeLayer(layer);
        setInstanceMap((prevInstanceMap) => {
          const newMap = { ...prevInstanceMap };
          delete newMap[id];
          return newMap;
        });
      }
    });
  };

  //Redo poslije
  const calculateOffset = (index) => {
    const offsetAngle = (index % 8) * (Math.PI / 4);
    const offsetDistance = 0.0001;
    const offsetX = Math.cos(offsetAngle) * offsetDistance;
    const offsetY = Math.sin(offsetAngle) * offsetDistance;
    return [offsetX, offsetY];
  };

  return (
    <div>
      {routeData &&
        routeData.map((tram, index) => (
          <Marker
            key={tram.id}
            position={[
              parseFloat(tram.stop_lat) + calculateOffset(index)[0],
              parseFloat(tram.stop_lon) + calculateOffset(index)[1],
            ]}
            icon={selectedMarker === tram.id ? hoverIcon : defaultIcon}
            eventHandlers={{
              click: () =>
                handleMarkerClick(
                  tram.trip_id,
                  tram.stop_id,
                  tram.id,
                  tram.route_id
                ),
            }}
          >
            <Popup autoPan={false} offset={L.point(0, -24)}>
              {'Tramvaj: ' + tram.id}
              <br />
              {'Ruta: ' + tram.route_id}
              <br />
              {'Trenutna stanica: ' + tram.stop_name}
            </Popup>
          </Marker>
        ))}

      {tripInfo &&
        tripInfo.trip_info.map((stop) => (
          <Marker
            key={stop.stop_id}
            position={[parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)]}
            icon={stopIcon}
          >
            <Popup autoPan={false} offset={L.point(0, -24)}>
              {'Stanica: ' + stop.stop_name}
            </Popup>
          </Marker>
        ))}
    </div>
  );
};

export default Markers;
