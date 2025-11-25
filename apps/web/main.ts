import { App, staticFiles } from 'fresh';
import { State } from './utils.ts';
import '@server/env.ts';

const app = new App<State>();

app.use(staticFiles());
app.fsRoutes();

export { app };
