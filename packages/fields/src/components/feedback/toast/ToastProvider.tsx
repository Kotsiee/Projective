import { ToastProviderProps } from '../../../types/components/toast.ts';
import { toast } from '../../../core/toast.ts';
import { Toast } from './Toast.tsx';

export function ToastProvider({
	position = 'bottom-right',
	limit = 5,
	defaultDuration = 5000,
	className,
	style,
}: ToastProviderProps) {
	const toasts = toast.$state.value;
	const isTop = position.includes('top');
	const visibleToasts = toasts.slice(-limit);

	const renderToasts = isTop ? [...visibleToasts].reverse() : visibleToasts;

	return (
		<div
			className={`toast-viewport toast-viewport--${position} ${className || ''}`}
			style={style}
		>
			{renderToasts.map((t) => (
				<Toast
					key={t.id}
					data={t}
					defaultDuration={defaultDuration}
				/>
			))}
		</div>
	);
}
