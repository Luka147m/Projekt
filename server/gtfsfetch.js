const GtfsRealtimeBindings = require("gtfs-realtime-bindings");
const fs = require("fs");

const feedUrl = "https://www.zet.hr/gtfs-rt-protobuf";

var data = {};
const stopDetails = JSON.parse(fs.readFileSync("stops.json", "utf-8"));

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
        stop = stopTimeUpdate.stopId;

        for (const obj of stopDetails) {
            if (obj.stop_id === stop) {
                data[trip.routeId].push({
                    trip_id: trip.tripId,
                    stop_id: stop,
                    stop_name: obj.stop_name,
                    stop_lat: obj.stop_lat,
                    stop_lon: obj.stop_lon,
                });
            }
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
