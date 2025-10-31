import { effect, signal } from '@preact/signals';

export const theme = signal<'light' | 'dark'>('dark');

if (typeof window !== 'undefined') {
	const saved = localStorage.getItem('theme');
	if (saved === 'light' || saved === 'dark') theme.value = saved;

	effect(() => {
		document.documentElement.setAttribute('data-theme', theme.value);
		try {
			localStorage.setItem('theme', theme.value);
		} catch {
			//
		}
	});
}
