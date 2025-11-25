export type Ok<T> = { ok: true; data: T };
export type Fail = { ok: false; error: { code: string; message: string; status?: number } };
export type Result<T> = Ok<T> | Fail;

export function ok<T>(data: T): Ok<T> {
	return { ok: true, data };
}
export function fail(code: string, message: string, status?: number): Fail {
	return { ok: false, error: { code, message, status } };
}
