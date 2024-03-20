const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Your MySQL username
  password: "poorna@209", // Your MySQL password
  database: "businessquant",
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

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

// app.get("/", (req, res) => {
//   const get_qry = "select * from businessquant_info;";
//   connection.query(get_qry, (err, results) => {
//     if (err) {
//       console.error("Error fetching users:", err);
//       res.status(500);
//       res.send("Error fetching users");
//       return;
//     }
//     res.send(results);
//   });
// });

app.get("/search/", async (req, res) => {
  // Api/ticker=ZS&column=revenue,gp&period=5y
  const { ticker, revenue, gp, period } = req.query;
  const periodInYears = period ? period.slice(0, 1) : 0;

  console.log(ticker, revenue, gp, periodInYears);

  const get_search_qry = `select * from businessquant_info where ticker like '${
    ticker || "%%"
  }'and revenue>=${revenue || "revenue"} and gp>=${
    Array.isArray(gp) ? gp[0] : 0
  } and date<=DATE_SUB(NOW(), INTERVAL ${periodInYears} YEAR);`;
  console.log(get_search_qry, "poorna search qry is printing");
  connection.query(get_search_qry, (err, result) => {
    if (err) {
      throw new Error(`there is problem :${err}`);
      res.status(500);
      res.send("Error occured");
    }
    res.send(result);
  });
});

let start_time = null;
let end_time = null;

function create_rows(ar) {
  start_time = new Date().toLocaleString();
  console.log(`start time ${start_time}`);
  let value = null;

  ar.forEach((element, ind) => {
    value = ind;
    const { ticker, date, revenue, gp, fcf, capex } = element;
    // console.log(ticker, date, revenue, gp, fcf, capex);
    const create_qry = `insert into businessquant_info(ticker,date,revenue,gp,fcf,capex) values(
        '${ticker}',STR_TO_DATE(
      "${date}",
      "%m/%d/%Y"
    ),${revenue || 0},${gp || 0},${fcf || 0},${capex || 0}
    );`;
    // console.log(create_qry);
    connection.query(create_qry, (err) => {
      if (err) {
        console.error("Error fetching users:", err);
        // res.status(500);
        // res.send("Error fetching users");
        throw new Error("Something went wrong!");
        return;
      }
    });
  });
  end_time = new Date().toLocaleString();
  console.log(`start time ${start_time}`);
  console.log(`end time ${end_time}`);
  console.log("created_sucessfully");
  console.log(value);
}
// let total_time = end_time.getTime() - start_time.getTime();
// total_time = total_time / (1000 * 60);
// console.log(`$total time in minutes is {total_time} `);
