import { ComponentChildren, JSX } from 'preact';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral';
export type ToastPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export interface ToastAction {
	label: string;
	onClick: (e: MouseEvent) => void;
	altText?: string;
}

export interface ToastData {
	id: string;
	type: ToastType;
	title?: string;
	message?: ComponentChildren;
	duration?: number;
	dismissible?: boolean;
	icon?: ComponentChildren;
	action?: ToastAction;
	createdAt: number;
	exiting?: boolean;
}

export interface ToastOptions {
	id?: string; // Allow manual ID for updating
	duration?: number;
	dismissible?: boolean;
	icon?: ComponentChildren;
	description?: string;
	action?: ToastAction;
	position?: ToastPosition;
}

// Promise Data Types
export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export type PromiseData<Data = any> = {
	loading: string | ComponentChildren;
	success: string | ComponentChildren | ((data: Data) => ComponentChildren);
	error: string | ComponentChildren | ((error: any) => ComponentChildren);
};

export interface ToastProviderProps {
	position?: ToastPosition;
	limit?: number;
	defaultDuration?: number;
	className?: string;
	style?: JSX.CSSProperties;
}
