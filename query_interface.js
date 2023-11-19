const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 5000;

app.use(bodyParser.json());

const db = new sqlite3.Database('logs.db');

// Log query endpoint
app.get('/query', (req, res) => {
  const { level, message, resourceId, timestamp, traceId, spanId, commit, parentResourceId } = req.query;

  const query = `
    SELECT * FROM logs
    WHERE
      (? IS NULL OR level = ?)
      AND (? IS NULL OR message LIKE ?)
      AND (? IS NULL OR resourceId = ?)
      AND (? IS NULL OR timestamp = ?)
      AND (? IS NULL OR traceId = ?)
      AND (? IS NULL OR spanId = ?)
      AND (? IS NULL OR commit = ?)
      AND (? IS NULL OR parentResourceId = ?)
  `;

  const params = [level, level, message, `%${message}%`, resourceId, resourceId, timestamp, timestamp, traceId, traceId, spanId, spanId, commit, commit, parentResourceId, parentResourceId];

  db.all(query, params, (err, logs) => {
    if (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    } else {
      res.json({ status: 'success', logs });
    }
  });
});

app.listen(port, () => {
  console.log(`Query Interface listening at http://localhost:${port}`);
});
