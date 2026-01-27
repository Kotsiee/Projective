import { signal } from '@preact/signals';
import {
	PromiseData,
	PromiseT,
	ToastData,
	ToastOptions,
	ToastType,
} from '../types/components/toast.ts';

// --- State ---
const toasts = signal<ToastData[]>([]);

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Actions ---

function addToast(type: ToastType, message: string, options: ToastOptions = {}) {
	const isDuplicate = toasts.value.some((t) =>
		t.message === message && t.type === type && !t.exiting
	);
	if (isDuplicate) return options.id || ''; // Return existing ID if implied, or empty
	const id = options.id || generateId();

	// 2. Update existing if ID matches (Morphing)
	const existingIndex = toasts.value.findIndex((t) => t.id === id);
	const newToast: ToastData = {
		id,
		type,
		message: options.description || message,
		title: options.description ? message : undefined,
		duration: options.duration,
		dismissible: options.dismissible ?? true,
		icon: options.icon,
		action: options.action,
		createdAt: Date.now(),
		exiting: false,
	};

	if (existingIndex !== -1) {
		// Update in place (keeping position)
		const updated = [...toasts.value];
		updated[existingIndex] = newToast;
		toasts.value = updated;
	} else {
		// Append new
		toasts.value = [...toasts.value, newToast];
	}

	return id;
}

function dismissToast(id: string) {
	toasts.value = toasts.value.filter((t) => t.id !== id);
}

function dismissAll() {
	toasts.value = [];
}

// --- Promise Handler ---

function promise<T>(promise: PromiseT<T>, data: PromiseData<T>, options?: ToastOptions) {
	const id = addToast('loading', String(data.loading), { ...options, duration: Infinity });

	const p = promise instanceof Function ? promise() : promise;

	p.then((response) => {
		const successMessage = typeof data.success === 'function'
			? data.success(response)
			: data.success;

		addToast('success', String(successMessage), {
			...options,
			id, // Reuse ID to morph
			duration: 4000, // Reset duration for success state
		});
	}).catch((error) => {
		const errorMessage = typeof data.error === 'function' ? data.error(error) : data.error;

		addToast('error', String(errorMessage), {
			...options,
			id,
			duration: 5000,
		});
	});

	return p;
}

// --- Public API ---

export const toast = {
	// Basic Methods
	success: (message: string, options?: ToastOptions) => addToast('success', message, options),
	error: (message: string, options?: ToastOptions) => addToast('error', message, options),
	warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
	info: (message: string, options?: ToastOptions) => addToast('info', message, options),
	loading: (message: string, options?: ToastOptions) =>
		addToast('loading', message, { ...options, duration: Infinity }),

	// Advanced
	promise,
	custom: (type: ToastType, message: string, options?: ToastOptions) =>
		addToast(type, message, options),

	// Controls
	dismiss: dismissToast,
	dismissAll: dismissAll,

	// State Access
	$state: toasts,
};
