const express = require("express");
const router = express.Router();
const client = require("../config/db");
const { check, body, validationResult } = require("express-validator");
const messages = require("../data/messages");
const { returnCurrentSemesterYear } = require("../utils/utils");

// Returns all materias for the student to select
router.get("/materia", async (req, res) => {
  let sql = "SELECT * FROM materia";
  let materias = await client.query(sql);
  if (materias.err) {
    throw materias.err;
  }

  return res.status(200).json(materias.rows);
});

// Returns all alumnos from the selected materia
router.get(
  "/materia/:materiaId",
  check("materiaId").exists(),
  check("materiaId").escape(),
  check("materiaId").isNumeric(),
  async (req, res) => {
    // Validates that the parameters are correct
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }
    // Loads the data into variables to use
    const materiaId = req.params.materiaId;

    // Verifies that the subject exists
    let sql = `SELECT * FROM materia WHERE id = ${materiaId}`;
    let materias = await client.query(sql);
    if (materias.err) {
      throw materias.err;
    }

    if (!materias.rows.length) {
      return res.status(404).json({ message: messages.SUBJECT_DOESNT_EXIST });
    }

    // If the subject exists, fetches the students that are enrolled into the subject
    // this semester and this year
    // Doesn't return the email because it's a public endpoint
    const currentSemesterYear = returnCurrentSemesterYear();
    sql = `SELECT a.id, a.nombre, a.apellido FROM alumno_x_materia axm LEFT JOIN alumno a ON axm.alumnoId = a.id WHERE axm.materiaId = ${materiaId} AND semestre = ${currentSemesterYear[0]} AND ano = ${currentSemesterYear[1]}`;
    let alumnos = await client.query(sql);
    if (alumnos.err) {
      throw alumnos.err;
    }

    if (!alumnos.rows.length) {
      return res.status(204).send();
    }

    return res.status(200).json(alumnos.rows);
  }
);
module.exports = router;

// Creates new alumno
router.post(
  "/alumno",
  body("nombre").exists(),
  body("apellido").exists(),
  body("mail").exists(),
  body("materiaId").exists(),
  body("nombre").escape(),
  body("apellido").escape(),
  body("mail").isEmail(),
  body("materiaId").isNumeric(),
  async (req, res) => {
    // Validates that the parameters are correct
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      // Verifies if the error is the email
      if (errors.errors[0].param === "mail") {
        return res.status(400).json({ message: messages.EMAIL_ERROR });
      } else {
        return res.status(400).json({ message: messages.PARAMETERS_ERROR });
      }
    }

    // Stores the variables to use
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const mail = req.body.mail;
    const materiaId = req.body.materiaId;
    const currentSemesterYear = returnCurrentSemesterYear();

    // Verifies that the alumno doesn't exist in the database
    let sql = `SELECT id FROM alumno WHERE mail = '${mail}'`;
    const alumnosExistentes = await client.query(sql);
    if (alumnosExistentes.err) {
      throw alumnosExistentes.err;
    }

    // If the alumno exists, verify that they don't belong to the
    // class in this semester
    if (alumnosExistentes.rows.length > 0) {
      const alumnoId = alumnosExistentes.rows[0].id;
      sql = `SELECT * FROM alumno_x_materia WHERE materiaId = ${materiaId} AND alumnoId = ${alumnoId} AND semestre = ${currentSemesterYear[0]} AND ano = ${currentSemesterYear[1]}`;

      const materiasExistentes = await client.query(sql);
      if (materiasExistentes.err) {
        throw materiasExistentes.err;
      }

      // If they don't belong to the class, add them
      if (materiasExistentes.rows.length === 0) {
        sql = `INSERT INTO alumno_x_materia (alumnoId, materiaId, semestre, ano, puntaje) VALUES (${alumnoId}, ${materiaId}, ${currentSemesterYear[0]}, ${currentSemesterYear[1]}, 0)`;
        const addAlumno = await client.query(sql);
        if (addAlumno.err) {
          throw addAlumno.err;
        }
        return res.status(201).json({
          message: "Alumno existente, agregado a la materia seleccionada",
          alumnoId,
        });
      }
    } else {
      // If the alumno doesn't exist, create it
      sql = `INSERT INTO alumno (nombre, apellido, mail) VALUES ('${nombre}', '${apellido}', '${mail}') RETURNING id`;

      const newAlumno = await client.query(sql);
      if (newAlumno.err) {
        throw newAlumno.err;
      }
      // Add the alumno to the class
      sql = `INSERT INTO alumno_x_materia (alumnoId, materiaId, semestre, ano, puntaje) VALUES (${newAlumno.rows[0].id}, ${materiaId}, ${currentSemesterYear[0]}, ${currentSemesterYear[1]}, 0)`;
      return res.status(201).json({
        message: "Alumno creado correctamente",
        alumnoId: newAlumno.rows[0].id,
      });
    }

    // Creates the alumno in the database
  }
);
