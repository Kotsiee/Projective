import { App, staticFiles } from 'fresh';
import { State } from './utils.ts';

export const app = new App<State>();

app.use(staticFiles());

// Pass a shared value from a middleware
app.use(async (ctx) => {
	ctx.state.shared = 'hello';
	return await ctx.next();
});

app.fsRoutes();

app.listen();
