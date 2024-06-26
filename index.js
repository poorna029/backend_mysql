const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

// Create a MySQL connection
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root", // Your MySQL username
//   password: "poorna@209", // Your MySQL password
//   database: "businessquant",
// });

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "poorna@209",
  database: "businessquant",
  waitForConnections: true,
  // connectionLimit: 10, // Adjust connection limit as needed
  // queueLimit: 0
});

// Connect to MySQL
// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to MySQL:", err);
//     return;
//   }
//   console.log("Connected to MySQL");
// });

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Start the Express server
const PORT = process.env.PORT || 3000;

const results = [];

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.get("/search/", async (req, res) => {
  // Api/ticker=ZS&column=revenue,gp&period=5y
  const { ticker, revenue, gp, period } = req.query;
  const periodInYears = period ? period.slice(0, 1) : 0;

  // console.log(ticker, revenue, gp, periodInYears);

  const get_search_qry = `select * from businessquant_info where ticker like '${
    ticker || "%%"
  }'and revenue>=${revenue || "revenue"} and gp>=${
    Array.isArray(gp) ? gp[0] : 0
  } and date<=DATE_SUB(NOW(), INTERVAL ${periodInYears} YEAR);`;
  // console.log(get_search_qry, "poorna search qry is printing");
  connection.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return;
    }
    connection.query(get_search_qry, (error, results, fields) => {
      // Handle query results
      res.send(results);
      connection.release(); // Release the connection back to the pool
    });
  });
});

// connection.end((err) => {
//   if (err) {
//     console.error("Error closing connection:", err);
//     return;
//   }
//   console.log("Connection to MySQL closed");
// });

connection.on("error", (err) => {
  console.error("Pool error:", err);
});
