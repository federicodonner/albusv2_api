import express from "express";
import cors from "cors";
import pkg from "body-parser";
const { urlencoded, json } = pkg;

const PORT = process.env.port || 3001;

const app = express();

app.use(urlencoded({ extended: false }));
app.use(json());

// // Middleware for cors
app.use(cors());

// Middleware for authentication
import authentication from "./middleware/authentication.js";
app.use("/materia", authentication);

// Routes
import alumno from "./routes/operacionesAlumno.js";
app.use("/operacionesalumno", alumno);

import profesor from "./routes/profesor.js";
app.use("/profesor", profesor);

import materia from "./routes/materia.js";
app.use("/materia", materia);

import oauthRoute from "./routes/oauth.js";
app.use("/oauth", oauthRoute);

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
