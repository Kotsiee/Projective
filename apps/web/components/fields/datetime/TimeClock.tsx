import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import '@styles/components/fields/TimeField.css';
import { DateTime } from '@projective/types';
import { getAngleValue, getPosition } from '@projective/utils';

interface TimeClockProps {
	value?: DateTime;
	onChange?: (date: DateTime) => void;
	// If true, just H:M (24h or 12h config)
}

type ViewMode = 'hours' | 'minutes';

export default function TimeClock(props: TimeClockProps) {
	const date = props.value || DateTime.now();

	// Internal signals for immediate UI feedback
	const mode = useSignal<ViewMode>('hours');
	const isPm = useSignal(date.getHour() >= 12);

	// 12-hour format logic
	const hours12 = date.getHour() % 12 || 12;
	const minutes = date.getMinute();

	const clockRef = useRef<HTMLDivElement>(null);
	const isDragging = useSignal(false);

	// --- Handlers ---

	const handlePointer = (e: PointerEvent, isFinish: boolean) => {
		if (!clockRef.current) return;

		const rect = clockRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		const steps = mode.value === 'hours' ? 12 : 60;
		let val = getAngleValue(x, y, steps);

		// Create new date based on change
		const newDate = date.clone(); // Assume clone exists or we recreate
		const currentH = newDate.getHour();

		if (mode.value === 'hours') {
			// Logic to preserve AM/PM
			// If val is 12, and isPm, it's 12. If !isPm, it's 0.
			// If val is 1-11, and isPm, val+12.
			let h24 = val;
			if (val === 12) h24 = 0;
			if (isPm.value) h24 += 12;

			// Fix: 12 PM is 12, 12 AM is 0.
			// Simplify: Just convert 1-12 visual to 0-23
			if (isPm.value && val < 12) val += 12;
			if (!isPm.value && val === 12) val = 0;

			// Update Date using delta logic or setter
			// Since DateTime is immutable in your spec, we rely on props.onChange handling the object replacement
			// But here we need to emit the *new* object.
			// We can use a raw Date constructor for the emitted value if DateTime doesn't have setters

			const d = new Date(date.getTime());
			d.setHours(val);
			props.onChange?.(new DateTime(d));

			// Auto-switch to minutes on release
			if (isFinish) mode.value = 'minutes';
		} else {
			const d = new Date(date.getTime());
			d.setMinutes(val);
			props.onChange?.(new DateTime(d));
		}
	};

	const toggleAmPm = (pm: boolean) => {
		isPm.value = pm;
		let h = date.getHour();
		if (pm && h < 12) h += 12;
		if (!pm && h >= 12) h -= 12;

		const d = new Date(date.getTime());
		d.setHours(h);
		props.onChange?.(new DateTime(d));
	};

	// --- Rendering Helpers ---

	const renderFace = () => {
		const total = mode.value === 'hours' ? 12 : 12; // Draw 12 numbers even for minutes (5, 10...)
		const numbers = [];
		const radius = 100; // px

		for (let i = 1; i <= total; i++) {
			const val = mode.value === 'hours' ? i : i * 5;
			const pos = getPosition(i, 12, radius); // 12 segments

			// Highlight check
			let isActive = false;
			if (mode.value === 'hours') isActive = hours12 === i;
			else isActive = Math.round(minutes / 5) * 5 === val || (val === 60 && minutes === 0);

			numbers.push(
				<div
					key={i}
					className={`clock__number ${isActive ? 'clock__number--active' : ''}`}
					style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
				>
					{val === 60 ? '00' : val}
				</div>,
			);
		}

		// The "Hand" line
		const currentVal = mode.value === 'hours' ? hours12 : minutes;
		const handSteps = mode.value === 'hours' ? 12 : 60;
		const handPos = getPosition(
			currentVal === 0 && mode.value === 'hours' ? 12 : currentVal,
			handSteps,
			radius,
		);

		return (
			<div
				className='clock__face'
				ref={clockRef}
				onPointerDown={(e) => {
					e.preventDefault();
					clockRef.current?.setPointerCapture(e.pointerId);
					isDragging.value = true;
					handlePointer(e, false);
				}}
				onPointerMove={(e) => {
					if (isDragging.value) handlePointer(e, false);
				}}
				onPointerUp={(e) => {
					clockRef.current?.releasePointerCapture(e.pointerId);
					isDragging.value = false;
					handlePointer(e, true);
				}}
			>
				<div className='clock__center-dot'></div>
				<div
					className='clock__hand'
					style={{
						height: `${radius}px`,
						transform: `rotate(${Math.atan2(handPos.y, handPos.x) * (180 / Math.PI) + 90}deg)`,
					}}
				>
					<div className='clock__hand-knob'></div>
				</div>
				{numbers}
			</div>
		);
	};

	return (
		<div className='time-clock'>
			{/* Header Display */}
			<div className='time-clock__header'>
				<div className='time-clock__digital'>
					<button
						type='button'
						className={`time-clock__val ${mode.value === 'hours' ? 'time-clock__val--active' : ''}`}
						onClick={() => mode.value = 'hours'}
					>
						{hours12.toString().padStart(2, '0')}
					</button>
					<span className='time-clock__sep'>:</span>
					<button
						type='button'
						className={`time-clock__val ${
							mode.value === 'minutes' ? 'time-clock__val--active' : ''
						}`}
						onClick={() => mode.value = 'minutes'}
					>
						{minutes.toString().padStart(2, '0')}
					</button>
				</div>

				<div className='time-clock__ampm'>
					<button
						type='button'
						className={`time-clock__meridiem ${!isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(false)}
					>
						AM
					</button>
					<button
						type='button'
						className={`time-clock__meridiem ${isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(true)}
					>
						PM
					</button>
				</div>
			</div>

			{/* The Dial */}
			<div className='time-clock__body'>
				{renderFace()}
			</div>
		</div>
	);
}
