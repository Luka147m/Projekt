const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const fs = require('fs');

const feedUrl = 'https://www.zet.hr/gtfs-rt-protobuf';

var data = {};
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
    data = {};
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        parseTripUpdate(entity.tripUpdate);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function parseTripUpdate(tripUpdate) {
  const trip = tripUpdate.trip;
  const stopTimeUpdates = tripUpdate.stopTimeUpdate;

  if (!data[trip.routeId]) {
    data[trip.routeId] = [];
  }

  for (const stopTimeUpdate of stopTimeUpdates) {
    if (stopsData.hasOwnProperty(stopTimeUpdate.stopId)) {
      const stopData = stopsData[stopTimeUpdate.stopId];
      data[trip.routeId].push({
        trip_id: trip.tripId,
        route_id: trip.routeId,
        stop_id: stopTimeUpdate.stopId,
        stop_name: stopData.stop_name,
        stop_lat: stopData.stop_lat,
        stop_lon: stopData.stop_lon,
      });
    }
  }
}

module.exports = {
  latestTrips,
};

async function latestTrips() {
  await fetchData();
  return data;
}
