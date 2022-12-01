const express = require("express");
const router = express.Router();
const client = require("../config/db");
const {
  check,
  escape,
  validationResult,
  isNumeric,
} = require("express-validator");
var messages = require("../data/messages");

// Returns all materias for the student to select
router.get("/materia", async (req, res) => {
  let sql = "SELECT * FROM materia";
  let materias = await client.query(sql);
  if (materias.err) {
    throw materias.err;
  }

  return res.status(200).json(materias.rows);
});

// Returns all alumnos from the selected subject
router.get(
  "/materia/:materiaId",
  [check("materiaId").escape(), check("materiaId").isNumeric()],
  async (req, res) => {
    const materiaId = req.params.materiaId;

    console.log(materiaId);
    if (!materiaId) {
      return res.status(400).json({ message: messages.MISSING_SUBJECT_ID });
    }

    // Verifies that the subject exists
    let sql = `SELECT * FROM materia WHERE id = ${materiaId}`;
    let materias = await client.query(sql);
    if (materias.err) {
      throw materias.err;
    }

    if (!materias.rows.length) {
      return res.status(200).json({ message: messages.SUBJECT_DOESNT_EXIST });
    }

    // If the subject exists, fetches the students
    // Doesn't return the email because it's a public endpoint
    sql = `SELECT a.id, a.nombre, a.apellido FROM alumno_x_materia axm LEFT JOIN alumno a ON axm.alumnoId = a.id WHERE axm.materiaId = ${materiaId}`;
    let alumnos = await client.query(sql);
    if (alumnos.err) {
      throw alumnos.err;
    }

    if (!alumnos.rows.length) {
      return res.status(200).json({ message: messages.NO_STUDENTS_IN_SUBJECT });
    }

    return res.status(200).json(alumnos.rows);
  }
);
module.exports = router;
