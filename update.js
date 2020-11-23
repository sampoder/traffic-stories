const fs = require("fs");
const fetch = require("node-fetch");
const filter = require("lodash").filter;
const { DateTime } = require("luxon");

async function update(camera_id) {
  var now = DateTime.local().setZone("Asia/Singapore");
  console.log(now);
  console.log(now.toISO());
  const cameras = (
    await fetch(
      `https://api.data.gov.sg/v1/transport/traffic-images?date_time=${now
        .toISO()
        .slice(0, now.toISO().length - 10)}`
    ).then((r) => r.json())
  ).items[0].cameras;
  let targetCamera = filter(
    cameras,
    (camera) => camera["camera_id"] === camera_id
  );
  console.log(targetCamera);
  const response = await fetch(targetCamera[0].image);
  const buffer = await response.buffer();
  if (!fs.existsSync(`./${camera_id}`)) {
    fs.mkdirSync(`./${camera_id}`);
  }
  console.log(`./${camera_id}/${targetCamera[0].timestamp}.jpg`);
  fs.writeFile(`./${camera_id}/${targetCamera[0].timestamp}.jpg`, buffer, () =>
    console.log("finished downloading!")
  );

  let currentTimestamp = DateTime.fromISO(targetCamera[0].timestamp);

  while (true) {
    now = currentTimestamp.minus({ seconds: 900 });
    currentTimestamp = currentTimestamp.minus({ seconds: 900 });
    const cameras = (
      await fetch(
        `https://api.data.gov.sg/v1/transport/traffic-images?date_time=${now
          .toISO()
          .slice(0, now.toISO().length - 10)}`
      ).then((r) => r.json())
    ).items[0].cameras;
    if (cameras.length == 0) {
      break
    }

    let targetCamera = filter(
      cameras,
      (camera) => camera["camera_id"] === camera_id
    );
    console.log(targetCamera);
    if (targetCamera.length > 0) {
      const response = await fetch(targetCamera[0].image);
      const buffer = await response.buffer();
      if (!fs.existsSync(`./${camera_id}`)) {
        fs.mkdirSync(`./${camera_id}`);
      }
      if (fs.existsSync(`./${camera_id}/${targetCamera[0].timestamp}.jpg`)) {
        console.log(`Finished at ./${camera_id}/${targetCamera[0].timestamp}.jpg`)
        break
      }
      console.log(`./${camera_id}/${targetCamera[0].timestamp}.jpg`);
      fs.writeFile(
        `./${camera_id}/${targetCamera[0].timestamp}.jpg`,
        buffer,
        () => console.log("finished downloading!")
      );
    }
  }
}

update("2701");
update("4703");
