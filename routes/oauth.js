// Route file for getting and editing gastos
import { Router } from "express";
const router = Router();
import connectDatabase from "../config/db.js";
import { body, validationResult } from "express-validator";
import { compare } from "bcrypt";
import { messages } from "../data/messages.js";
import { generateToken } from "../utils/utils.js";

// Validate the user and return the token
router.post(
  "/",
  body("username").exists(),
  body("password").exists(),
  async (req, res) => {
    // Validates that the parameters are correct
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If one of them isn't, returns an error
      // Verifies if the error is the email
      return res.status(400).json({ message: messages.PARAMETERS_ERROR });
    }

    // Loads the data into variables to use
    const username = req.body.username;
    const password = req.body.password;

    // Verifies that the user exists
    let sql = `SELECT * FROM profesor WHERE email = '${username}'`;
    const profesores = await query(sql);
    if (profesores.err) {
      throw profesores.err;
    }

    // Verifies that the user exists
    if (!profesores.rows.length) {
      return res.status(404).json({ message: messages.USER_NOT_FOUND });
    }

    // Verifies that the password is correct
    hashedPassword = profesores.rows[0].passwordhash;
    const passwordResult = await compare(password, hashedPassword);
    if (!passwordResult) {
      return res.status(401).json({ message: messages.INCORRECT_PASSWORD });
    }

    // Generate the login record with the token
    const profesorId = profesores.rows[0].id;
    const currentTimestamp = Math.round(new Date() / 1000);
    const loginToken = generateToken(25);
    sql = `INSERT INTO login (fechahora, token, profesorid) VALUES (${currentTimestamp},'${loginToken}',${profesorId})`;
    var loginQuery = await query(sql);
    if (loginQuery.err) {
      throw loginQuery.err;
    }
    return res.status(200).json({ token: loginToken });
  }
);

export default router;
