const express = require('express');
const app = express();

const fs = require('fs').promises;

const { latestTrips } = require('./gtfsfetch');

const { spawnSync } = require('child_process');

const { Pool } = require('pg');
const { start } = require('repl');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

var zetData;
const pythonScriptPath = 'C:\\Users\\Public\\test\\script.py';
const stopsPath = './stops.json';

async function fetchStops() {
  try {
    const result = await pool.query(`SELECT * FROM stopsJson`);
    await fs.writeFile(stopsPath, JSON.stringify(result.rows[0].stops));
    console.log(`Stops.json created successfully`);
  } catch (error) {
    console.error('Error creating stops.json', error);
    process.exit(1);
  }
}

async function fetchAndRefreshData() {
  try {
    zetData = await latestTrips();
    console.log('Inital data downloaded');
  } catch (error) {
    console.error(error);
  }
  setInterval(async () => {
    try {
      zetData = await latestTrips();
      console.log('Data refreshed');
    } catch (error) {
      console.error('Error while refreshing data:', error);
    }
  }, 30000);
}

app.get('/api/route/:routeId', (req, res) => {
  const routeId = req.params.routeId;
  if (zetData.hasOwnProperty(routeId)) {
    //console.log(zetData[routeId]);
    res.json(zetData[routeId]);
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

app.get('/api/trip/:tripId', async (req, res) => {
  const tripId = req.params.tripId;
  try {
    const result = await pool.query(
      `SELECT get_trip_info('${tripId}') AS trip_info`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// let result = spawnSync('python', [pythonScriptPath]);
// if (result.error) {
//   console.error(`Error running Python script: ${result.error.message}`);
// } else {
//   console.log(`Python script output: ${result.stdout}`);
// }

async function startServer() {
  await fetchStops();
  fetchAndRefreshData();

  app.listen(8080, () => {
    console.log('Server started on port 8080');
  });
}

startServer();
