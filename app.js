const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.port || 3001;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// // Middleware for cors
app.use(cors());

// Middleware for authentication
var authenticationMiddleware = require("./middleware/authentication");
app.use("/materia", authenticationMiddleware.authentication);

// Routes
const alumno = require("./routes/operacionesAlumno");
app.use("/operacionesalumno", alumno);

const profesor = require("./routes/profesor");
app.use("/profesor", profesor);

const materia = require("./routes/materia");
app.use("/materia", materia);

var oauthRoute = require("./routes/oauth");
app.use("/oauth", oauthRoute);

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
