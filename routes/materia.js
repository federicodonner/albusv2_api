const express = require("express");
const router = express.Router();
const client = require("../config/db");
const { body, validationResult } = require("express-validator");
const messages = require("../data/messages");

// Create a new materia
router.post(
  "/",
  body("nombre").exists(),
  body("nombre").escape(),
  async (req, res) => {
    // Validates that the parameters are correct
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }
    // Loads the data into variables to use
    const nombre = req.body.nombre;

    // Verifies that the materia doesn't exist
    let sql = `SELECT * FROM materia WHERE nombre = '${nombre}'`;
    const materiaExistente = await client.query(sql);

    if (materiaExistente.err) {
      throw materiaExistente.err;
    }

    if (materiaExistente.rows.length > 0) {
      return res.status(409).json({ message: "La materia ya existe." });
    }

    // Create the materia
    sql = `INSERT INTO materia (nombre) VALUES ('${nombre}') RETURNING nombre`;

    const materia = await client.query(sql);
    if (materia.err) {
      throw materia.err;
    }

    return res.status(201).json(materia.rows[0]);
  }
);

module.exports = router;
