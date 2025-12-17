import { useEffect, useRef, useState } from 'preact/hooks';
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconCheck,
	IconInfoCircle,
	IconLoader2,
	IconX,
} from '@tabler/icons-preact';
import { ToastData } from '../../../types/components/toast.ts';
import { toast } from '../../../core/toast.ts';

interface ToastProps {
	data: ToastData;
	defaultDuration?: number;
}

export function Toast({ data, defaultDuration = 5000 }: ToastProps) {
	const { id, type, title, message, duration, dismissible, icon, action } = data;
	const [isPaused, setIsPaused] = useState(false);
	const [swipeOffset, setSwipeOffset] = useState(0);
	const [isSwiping, setIsSwiping] = useState(false);

	// --- Timer Logic ---
	const timerRef = useRef<number>();
	const startTimeRef = useRef<number>(Date.now());
	const remainingRef = useRef<number>(duration ?? defaultDuration);

	const startTimer = () => {
		if (remainingRef.current === Infinity) return;

		timerRef.current = setTimeout(() => {
			toast.dismiss(id);
		}, remainingRef.current);

		startTimeRef.current = Date.now();
	};

	const pauseTimer = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		const elapsed = Date.now() - startTimeRef.current;
		remainingRef.current -= elapsed;
	};

	// Reset timer when type or message changes (Morphing)
	useEffect(() => {
		remainingRef.current = duration ?? defaultDuration;
		startTimeRef.current = Date.now();

		if (!isPaused && !isSwiping) {
			startTimer();
		}
		return () => clearTimeout(timerRef.current);
	}, [duration, type, message, isPaused, isSwiping]); // Added type/message deps

	// --- Swipe Logic ---
	const touchStartRef = useRef<number>(0);

	const handleTouchStart = (e: TouchEvent) => {
		if (!dismissible) return;
		touchStartRef.current = e.touches[0].clientX;
		setIsSwiping(true);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isSwiping) return;
		const currentX = e.touches[0].clientX;
		const diff = currentX - touchStartRef.current;
		if (diff > 0) {
			e.preventDefault();
			setSwipeOffset(diff);
		}
	};

	const handleTouchEnd = () => {
		if (!isSwiping) return;
		setIsSwiping(false);
		if (swipeOffset > 100) {
			setSwipeOffset(window.innerWidth);
			setTimeout(() => toast.dismiss(id), 200);
		} else {
			setSwipeOffset(0);
		}
	};

	const getIcon = () => {
		if (icon) return icon;
		switch (type) {
			case 'success':
				return <IconCheck />;
			case 'error':
				return <IconAlertCircle />;
			case 'warning':
				return <IconAlertTriangle />;
			case 'info':
				return <IconInfoCircle />;
			case 'loading':
				return <IconLoader2 className='stepper__spin' />;
			default:
				return null;
		}
	};

	return (
		<div
			className={`toast toast--${type}`}
			role='alert'
			aria-live={type === 'error' ? 'assertive' : 'polite'}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			style={{
				transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
				opacity: swipeOffset ? 1 - (swipeOffset / 300) : 1,
			}}
		>
			<div className='toast__icon'>
				{getIcon()}
			</div>

			<div className='toast__content'>
				{title && <div className='toast__title'>{title}</div>}
				<div className='toast__message'>{message}</div>
			</div>

			{action && (
				<button
					className='toast__action'
					onClick={(e) => {
						e.stopPropagation();
						action.onClick(e as any);
						// Optional: dismiss on action click?
						// toast.dismiss(id);
					}}
				>
					{action.label}
				</button>
			)}

			{dismissible && (
				<button
					className='toast__close'
					onClick={() => toast.dismiss(id)}
					aria-label='Dismiss'
				>
					<IconX size={18} />
				</button>
			)}
		</div>
	);
}
