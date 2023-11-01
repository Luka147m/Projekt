const express = require("express");
const { latestTrips } = require("./gtfsfetch");
const app = express();

const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Zet",
    password: "admin",
    port: 5432,
});

var zetData;

async function fetchAndRefreshData() {
    try {
        zetData = await latestTrips();
        console.log("Prvi podatci dohvaćeni");
    } catch (error) {
        console.error(error);
    }
    setInterval(async () => {
        try {
            zetData = await latestTrips();
            console.log("Refreshani podaci");
        } catch (error) {
            console.error("Problem tijekom refreshanja podataka:", error);
        }
    }, 30000);
}

fetchAndRefreshData();

app.get("/api/route/:routeId", (req, res) => {
    const routeId = req.params.routeId;
    if (zetData.hasOwnProperty(routeId)) {
        //console.log(zetData[routeId]);
        res.json(zetData[routeId]);
    } else {
        res.status(404).json({ error: "Route not found" });
    }
});

app.get("/api/trip/:tripId", async (req, res) => {
    const tripId = req.params.tripId;
    try {
        const result =
            await pool.query(`SELECT json_agg(jsonb_build_object('lat', stop_lat, 'lon', stop_lon)) 
      FROM route WHERE trip_id = '${tripId}'`);
        res.json(result.rows);
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(8080, () => {
    console.log("Server pokrenut na portu 8080");
});
