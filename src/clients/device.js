import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

import ComoClient from '@ircam/como/ComoClient.js';
import { getTime } from '@ircam/sc-utils';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`


async function bootstrap() {
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);
  // https://soundworks.dev/tools/helpers.html#nodelauncher
  launcher.register(client);

  const como = new ComoClient(client);
  await como.start();

  const logger = como.logger;


  // ---- Source LSM9DS1 -----
  const lsm9ds1Source = await como.sourceManager.createSource({
    type: 'lsm9ds1',
    id: 'lsm9ds1',
    interval: 10,
    verbose: false,
  });

  const playerId1  = await como.playerManager.createPlayer(lsm9ds1Source);
  const lsm9ds1State = await como.sourceManager.getSource(lsm9ds1Source);


  // ---- Source CoMote -----
  const comoteSource = await como.sourceManager.createSource({
    type: 'comote',
    id: 'comote',
    interval: 10,
    port: 8901,
    verbose: false,
  });

  const playerId2 = await como.playerManager.createPlayer(comoteSource);
  const comoteState = await como.sourceManager.getSource(comoteSource);


  // ---- Source R-IoT -----
  const riotSource = await como.sourceManager.createSource({
    type: 'riot',
    id: '0',
    port: 8001,
    verbose: false,
  });

  const playerId3  = await como.playerManager.createPlayer(riotSource);
  const riotState = await como.sourceManager.getSource(riotSource);


  const t0 = getTime();

  const lsm9ds1Writer = await logger.createWriter(
    'lsm9ds1_imu_data.txt',
    { bufferSize: 600 },
  );

  const comoteWriter = await logger.createWriter(
    'comote_imu_data.txt',
    { bufferSize: 600 },
  );
  const riotWriter = await logger.createWriter(
    'riot_imu_data.txt',
    { bufferSize: 600 },
  );


  let lsm9ds1Index = 0;
  let comoteIndex = 0;
  let riotIndex = 0;


  lsm9ds1State.onUpdate(updates => {
    if ('frame' in updates) {

      const time = getTime() - t0;

      lsm9ds1Writer.write({
        time: time,
        index: lsm9ds1Index++,
        frame: updates.frame,
      });
    }
  });


  comoteState.onUpdate(updates => {
    if ('frame' in updates) {

      const time = getTime() - t0;

      comoteWriter.write({
        time: time,
        index: comoteIndex++,
        frame: updates.frame,
      });
    }
  });


  riotState.onUpdate(updates => {
    if ('frame' in updates) {

      const time = getTime() - t0;

      riotWriter.write({
        time: time,
        index: riotIndex++,
        frame: updates.frame,
      });
    }
  });



  process.on('SIGINT', async () => {
    await lsm9ds1Writer.close();
    await comoteWriter.close();
    await riotWriter.close();
    await como.stop();
    process.exit(0);
  });

}


// The launcher allows to launch multiple clients in the same terminal window
// e.g. `EMULATE=10 npm run watch thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
