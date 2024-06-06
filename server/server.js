const express = require('express');
const app = express();

const fs = require('fs');

const { latestTrips } = require('./gtfsfetch');

const { spawnSync } = require('child_process');

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

var zetData;
const pythonScriptPath = '../scripts/script.py';
const stopsPath = './stops.json';

async function fetchStops() {
  try {
    const result = await pool.query(`SELECT * FROM stopsJson`);
    fs.writeFileSync(stopsPath, JSON.stringify(result.rows[0].stops));
    console.log(`[Info] Stops.json created successfully`);
  } catch (error) {
    console.error('[Error] Creating stops.json', error);
    process.exit(1);
  }
}

async function fetchAndRefreshData() {
  try {
    zetData = await latestTrips();
    console.log('[Info] Inital data downloaded');
  } catch (error) {
    console.error(error);
  }
  setInterval(async () => {
    try {
      zetData = await latestTrips();
      console.log('[Info] Data refreshed');
    } catch (error) {
      console.error('[Error] Refreshing data:', error);
    }
  }, 15000);
}

app.get('/api/routeDetails/:tripId', async (req, res) => {
  const tripId = req.params.tripId;
  try {
    const result = await pool.query(`SELECT get_trip_details('${tripId}');`);
    res.json(result.rows);
  } catch (error) {
    console.error('[Error] Executing query', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/route/:routeId', (req, res) => {
  const routeId = req.params.routeId;
  if (zetData.hasOwnProperty(routeId)) {
    res.json(zetData[routeId]);
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

app.get('/api/findRoute/:stops', async (req, res) => {
  const stops = req.params.stops.split('_');
  try {
    const result = await pool.query(
      `SELECT find_routes_between_stops('${stops[0]}', '${stops[1]}') AS routes`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[Error] Executing query', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/stops', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT stop_name FROM stops`);
    res.json(result.rows);
  } catch (error) {
    console.error('[Error] Executing query', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/routes', (req, res) => {
  res.json(Object.keys(zetData));
});

app.get('/api/trip/:tripId', async (req, res) => {
  const tripId = req.params.tripId;
  try {
    const result = await pool.query(
      `SELECT get_trip_info('${tripId}') AS trip_info`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[Error] executing query', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// let result = spawnSync('python', [pythonScriptPath]);
// if (result.error) {
//   console.error(`[Error] Running Python script: ${result.error.message}`);
// } else {
//   console.log(`[Info] Python script output:\n ${result.stdout}`);
// }

async function startServer() {
  await fetchStops();
  fetchAndRefreshData();

  app.listen(8080, () => {
    console.log('[Info] Server started on port 8080');
  });
}

startServer();
