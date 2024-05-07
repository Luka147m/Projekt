const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const fs = require('fs');

const feedUrl = 'https://www.zet.hr/gtfs-rt-protobuf';
var data = {};
const lastSeenTimestamps = {};
const stopsData = JSON.parse(fs.readFileSync('stops.json', 'utf-8'));

async function fetchData() {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      const error = new Error(
        `${response.url}: ${response.status} ${response.statusText}`
      );
      error.response = response;
      throw error;
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    feed.entity.forEach((entity) => {
      if (entity) parseEntity(entity);
    });
  } catch (error) {
    console.log(error);
  }
}

// function parseEntity(entity) {
//   const id = entity.id;
//   const trip = entity.tripUpdate.trip;
//   const stopTimeUpdates = entity.tripUpdate.stopTimeUpdate;

//   if (!data[trip.routeId]) {
//     data[trip.routeId] = [];
//   }

//   for (const stopTimeUpdate of stopTimeUpdates) {
//     if (stopsData.hasOwnProperty(stopTimeUpdate.stopId)) {
//       const stopData = stopsData[stopTimeUpdate.stopId];
//       data[trip.routeId].push({
//         id: id,
//         trip_id: trip.tripId,
//         route_id: trip.routeId,
//         stop_id: stopTimeUpdate.stopId,
//         stop_name: stopData.stop_name,
//         stop_lat: stopData.stop_lat,
//         stop_lon: stopData.stop_lon,
//       });
//     }
//   }
// }

function checkAndRemoveOutdatedEntities() {
  const currentTime = Date.now();
  const timeoutThreshold = 60000;
  for (const routeId in data) {
    for (let i = data[routeId].length - 1; i >= 0; i--) {
      const entityId = data[routeId][i].id;
      if (currentTime - lastSeenTimestamps[entityId] > timeoutThreshold) {
        data[routeId].splice(i, 1);
        delete lastSeenTimestamps[entityId];
      }
    }
  }
}

setInterval(checkAndRemoveOutdatedEntities, 60000);

function parseEntity(entity) {
  const id = entity.id;
  const trip = entity.tripUpdate.trip;
  const stopTimeUpdates = entity.tripUpdate.stopTimeUpdate[0];
  lastSeenTimestamps[id] = Date.now();

  if (!data[trip.routeId]) {
    data[trip.routeId] = [];
  }

  let entityIndex = -1;
  for (let i = 0; i < data[trip.routeId].length; i++) {
    if (data[trip.routeId][i].id === id) {
      entityIndex = i;
      break;
    }
  }

  if (entityIndex !== -1) {
    if (stopsData.hasOwnProperty(stopTimeUpdates.stopId)) {
      const stopData = stopsData[stopTimeUpdates.stopId];
      data[trip.routeId][entityIndex] = {
        id: id,
        trip_id: trip.tripId,
        route_id: trip.routeId,
        stop_id: stopTimeUpdates.stopId,
        stop_name: stopData.stop_name,
        stop_lat: stopData.stop_lat,
        stop_lon: stopData.stop_lon,
      };
    }
  } else {
    if (stopsData.hasOwnProperty(stopTimeUpdates.stopId)) {
      const stopData = stopsData[stopTimeUpdates.stopId];
      data[trip.routeId].push({
        id: id,
        trip_id: trip.tripId,
        route_id: trip.routeId,
        stop_id: stopTimeUpdates.stopId,
        stop_name: stopData.stop_name,
        stop_lat: stopData.stop_lat,
        stop_lon: stopData.stop_lon,
      });
    }
  }
}

async function latestTrips() {
  await fetchData();
  fs.writeFileSync('./backup/last.json', JSON.stringify(data));
  return data;
}

module.exports = {
  latestTrips,
};
