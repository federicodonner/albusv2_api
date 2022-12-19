var fetch = require("cross-fetch");

// Returns a random string of the specified length
function generateToken(
  length,
  universe = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
) {
  var result = "";
  for (var i = 0; i < length; i++) {
    result += universe.charAt(Math.floor(Math.random() * universe.length));
  }
  return result;
}

// Access external URL
async function accessURL(url) {
  var fetchPromise = await fetch(url, { method: "GET", timeout: 30000 });
  return fetchPromise;
}

// Returns an array with [semester, year]
// January to June is semester 1, July to December is 2
function returnCurrentSemesterYear() {
  const today = new Date();
  const semester = today.getMonth() < 6 ? 1 : 2;
  const year = today.getFullYear();
  return [semester, year];
}

module.exports = { generateToken, accessURL, returnCurrentSemesterYear };
