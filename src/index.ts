import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config({ path: './config.env' });
}

import { app } from './api';
import { closeDb, connectToDb } from './plugins/db';

const port = process.env.PORT;

connectToDb().then(() => {
  app.listen(port, () =>
    console.log(`API available on http://localhost:${port}`)
  );
}).catch(err => {
  console.error("Database connection failed: ", err);
  process.exit(1);
});

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

function closeGracefully() {
  closeDb().finally(() => {
    process.exit();
  });
}
