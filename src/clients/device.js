import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

import ComoClient from '@ircam/como/ComoClient.js';

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


  const lsm9ds1Source = await como.sourceManager.createSource({
    type: 'lsm9ds1',
    id: 'lsm9ds1',
    verbose: false,
  });

  const playerId  = await como.playerManager.createPlayer(lsm9ds1Source);
  //const player = await como.playerManager.getPlayer(playerId);

}



// The launcher allows to launch multiple clients in the same terminal window
// e.g. `EMULATE=10 npm run watch thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
