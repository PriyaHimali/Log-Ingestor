const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('logs.db');

// Log ingestion endpoint
app.post('/ingest', (req, res) => {
  const logData = req.body;

  db.run(
    'INSERT INTO logs (level, message, resourceId, timestamp, traceId, spanId, commit, parentResourceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      logData.level,
      logData.message,
      logData.resourceId,
      logData.timestamp,
      logData.traceId,
      logData.spanId,
      logData.commit,
      logData.metadata ? logData.metadata.parentResourceId : null,
    ],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      } else {
        res.json({ status: 'success' });
      }
    }
  );
});

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, level TEXT, message TEXT, resourceId TEXT, timestamp TEXT, traceId TEXT, spanId TEXT, commit TEXT, parentResourceId TEXT)'
  );
});

app.listen(port, () => {
  console.log(`Log Ingestor listening at http://localhost:${port}`);
});
