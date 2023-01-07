// Authentication middleware
import connectDatabase from "../config/db.js";
import { messages } from "../data/messages.js";

async function authentication(req, res, next) {
  // Verifies that the authorization header exists
  if (!req.header("authorization")) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }
  // If the structure is not "Bearer [accesstoken] return error"
  let authorizationHeader = req.header("authorization").split(" ");
  if (authorizationHeader[0] !== "Bearer" && authorizationHeader.length != 2) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  let loginToken = authorizationHeader[1];
  let userId = null;
  // If there is no token return unauthenticated
  if (!loginToken) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  // Check if the token is in the database
  let sql = `SELECT * FROM login WHERE token = '${loginToken}' ORDER BY fechahora DESC LIMIT 1`;
  let tokenResults = await query(sql);
  if (tokenResults.err) {
    throw tokenResults.err;
  }
  if (!tokenResults.rows.length) {
    return res.status(403).json({ message: UNAUTHORIZED });
  }
  // If the token is found, verifies if the profesor exists
  profesorId = tokenResults.rows[0].profesorid;
  sql = `SELECT * FROM profesor WHERE id =${profesorId}`;
  let profesorResults = await query(sql);
  if (profesorResults.err) {
    throw profesorResults.err;
  }
  // If the profesor doesn't exist, exit with error
  if (!profesorResults.rows.length) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }
  // If the profesor exists, verifies if it's the latest login
  sql = `SELECT token FROM login WHERE profesorId = ${profesorId} ORDER BY fechahora DESC LIMIT 1`;
  let results = await query(sql);
  if (results.err) {
    throw results.err;
  }
  // Verifies that the token in the last profesor login is the same
  if (results.rows[0].token !== loginToken) {
    return res.status(403).json({ message: UNAUTHORIZED });
  }
  // If the login is correct and the profesor is found, the id
  // is passed to the route from the middleware
  req.profesorId = profesorId;
  next();
}

export default authentication;
