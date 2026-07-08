/**
 * @file live_db.ts
 * @description Opt-in bridge to the real local Supabase Postgres. Integration tests that use it are
 * `ignore`d unless `PJV_TEST_DB=1` is set, so the default `deno test` run never needs a database or
 * a driver download and always stays green.
 *
 * When enabled, `withRolledBackTx` opens ONE connection, runs the test body inside a transaction and
 * ALWAYS rolls it back — no fixture, schema change, or function call it makes is ever committed. This
 * is the live-DB equivalent of MockDb.begin()/rollback(): the database is left byte-for-byte as found.
 *
 * Connection: `PJV_DB_URL` or the local Supabase default (postgresql://postgres:postgres@127.0.0.1:54322/postgres).
 * The `npm:postgres` driver is imported dynamically inside the guard so it is only resolved when the
 * live layer actually runs.
 */

export function isLiveDbEnabled(): boolean {
	return Deno.env.get('PJV_TEST_DB') === '1';
}

export function dbUrl(): string {
	return Deno.env.get('PJV_DB_URL') ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
}

/** Sentinel thrown to force a ROLLBACK after the test body has run its assertions. */
const ROLLBACK = Symbol('rollback');

/**
 * Run `body` against a live transaction that is guaranteed to roll back.
 * `sql` is a postgres.js tagged-template client scoped to the transaction.
 */
export async function withRolledBackTx(body: (sql: unknown) => Promise<void>): Promise<void> {
	const { default: postgres } = await import('npm:postgres@^3.4.5');
	const client = postgres(dbUrl(), { max: 1, prepare: false, onnotice: () => {} });
	try {
		await client.begin(async (tx: unknown) => {
			await body(tx);
			// Assertions passed — unwind the transaction so nothing persists.
			throw ROLLBACK;
		});
	} catch (err) {
		if (err !== ROLLBACK) throw err;
	} finally {
		await client.end({ timeout: 5 });
	}
}
