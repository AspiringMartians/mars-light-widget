const fetch = require('node-fetch');

const APP_ID = "892cd80c-7348-4efe-9f3d-294e10de0d25";
const APP_SECRET = "4e77ffa1a27bde49e7cc0e54a9cd50ed4839838e3d4dcc0286aeee53";

exports.handler = async function () {
  try {
    const authRes = await fetch("https://api.astronomyapi.com/api/v2/basic-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });

    const authData = await authRes.json();
    const token = authData.data.access_token;

    const today = new Date().toISOString().split('T')[0];
    const positionRes = await fetch(`https://api.astronomyapi.com/api/v2/bodies/positions/mars?latitude=0&longitude=0&elevation=0&from_date=${today}&to_date=${today}&time=00:00:00`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const positionData = await positionRes.json();
    const distanceKm = positionData.data.table.rows[0].cells[0].distance.fromEarth.km;

    const lightSpeed = 299792.458;
    const totalSeconds = distanceKm / lightSpeed;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        lightTime: { minutes, seconds },
        distanceKm
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Something went wrong",
        message: err.message
      })
    };
  }
};
