import { assertEquals } from '../_helpers/asserts.ts';

Deno.test({
	name: 'add()',
	sanitizeOps: true,
	sanitizeResources: true,
	sanitizeExit: true,
	fn() {
		const add = (a: number, b: number) => a + b;
		assertEquals(add(2, 3), 5);
	},
});
