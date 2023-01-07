import { Router } from "express";
const router = Router();
import connectDatabase from "../config/db.js";
import { body, validationResult } from "express-validator";
import { hash as _hash } from "bcrypt";
import { generateToken } from "../utils/utils.js";
import { messages } from "../data/messages.js";

// Create a new profesor
router.post(
  "/",
  body("email").isEmail(),
  body("nombre").exists(),
  body("apellido").exists(),
  body("password").exists(),
  body("nombre").escape(),
  body("apellido").escape(),
  async (req, res) => {
    // Validates that the parameters are correct
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      // Verifies if the error is the email
      if (errors.errors[0].param === "email") {
        return res.status(400).json({ message: EMAIL_ERROR });
      } else {
        return res.status(400).json({ message: PARAMETERS_ERROR });
      }
    }
    // Loads the data into variables to use
    var nombre = req.body.nombre;
    var apellido = req.body.apellido;
    var email = req.body.email.toLowerCase();
    var password = req.body.password;

    // Verifies that the username is not already in use
    let sql = `SELECT * FROM profesor WHERE email = '${email}'`;
    let results = await query(sql);
    if (results.err) {
      throw results.err;
    }
    // If there is at least one result, return error
    if (results.rows.length) {
      return res.status(400).json({ message: USERNAME_REPEAT });
    }

    // Hash the password
    const hash = await _hash(password, 8);
    // Adds the user to the database
    sql = `INSERT INTO profesor (nombre, apellido, email, passwordHash) VALUES ('${nombre}','${apellido}','${email}','${hash}') RETURNING id`;
    results = await query(sql);
    if (results.err) {
      throw results.err;
    }

    // The new profesor id is returned from the insert statement
    var profesorId = results.rows[0].id;

    // After the user is inserted, create a login record and return it
    const currentTimestamp = Math.round(new Date() / 1000);
    const loginToken = generateToken(25);
    sql = `INSERT INTO login (fechahora, token, profesorid) VALUES (${currentTimestamp},'${loginToken}',${profesorId})`;
    results = await query(sql);
    if (results.err) {
      throw results.err;
    }
    // Add the generated token to the response
    res.status(201).send({ token: loginToken });
  }
);

export default router;
