const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.port || 3001;

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware for cors
app.use(cors());

// parse application/json
app.use(bodyParser.json());

const alumno = require("./routes/alumno");
app.use("/alumno", alumno);

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
