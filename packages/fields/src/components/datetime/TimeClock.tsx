import '../../styles/components/time-clock.css';
import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { DateTime } from '@projective/types';
import { getAngleValue, getPosition } from '@projective/utils';

export type TimeSelectionMode = 'single' | 'multiple';

interface TimeClockProps {
	value?: DateTime | DateTime[];
	onChange?: (date: any) => void;
	selectionMode?: TimeSelectionMode;
}

type ViewMode = 'hours' | 'minutes';

export function TimeClock(props: TimeClockProps) {
	const { value, onChange, selectionMode = 'single' } = props;

	// Helper to get the primary "view" date (for header display)
	const getPrimaryDate = () => {
		if (Array.isArray(value)) {
			return value.length > 0 ? value[value.length - 1] : new DateTime();
		}
		return value || new DateTime();
	};

	const displayDate = getPrimaryDate();

	// State
	const mode = useSignal<ViewMode>('hours');
	const isPm = useSignal(displayDate.getHour() >= 12);
	const isDragging = useSignal(false);
	const clockRef = useRef<HTMLDivElement>(null);

	// Display values
	const hours12 = displayDate.getHour() % 12 || 12;
	const minutes = displayDate.getMinute();

	// --- Handlers ---

	const updateValue = (newDate: DateTime, isFinish: boolean) => {
		let result: any;

		if (selectionMode === 'single') {
			result = newDate;
		} else {
			// Multi-select logic
			const current = (Array.isArray(value) ? value : (value ? [value] : [])) as DateTime[];

			// Check if we are toggling an existing time
			// We compare based on the current mode (Hour match or Minute match)
			// Simplification: For multi-time, we usually just add the new timestamp.
			// However, UX for multi-time on a clock is tricky.
			// We will assume "Add/Update" logic.

			// For this implementation, we replace the last entry if dragging,
			// or add new if clicking fresh?
			// To keep it simple: Multi-mode on a clock usually implies picking slots.
			// We will append if it doesn't exist, remove if it does (Toggle).

			// Check for exact hour/minute match in current array
			const existsIndex = current.findIndex((d) =>
				d.getHour() === newDate.getHour() && d.getMinute() === newDate.getMinute()
			);

			if (existsIndex >= 0) {
				if (isFinish) {
					// Toggle off on release
					result = current.filter((_, i) => i !== existsIndex);
				} else {
					result = current; // Don't toggle while dragging
				}
			} else {
				result = [...current, newDate];
			}
		}

		onChange?.(result);

		// Auto-switch to minutes only in single mode
		if (isFinish && mode.value === 'hours' && selectionMode === 'single') {
			mode.value = 'minutes';
		}
	};

	const handlePointer = (e: PointerEvent, isFinish: boolean) => {
		if (!clockRef.current) return;

		const rect = clockRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		const steps = mode.value === 'hours' ? 12 : 60;
		let val = getAngleValue(x, y, steps);

		// Calculate new date based on primary
		const d = new Date(displayDate.getTime());

		if (mode.value === 'hours') {
			if (isPm.value && val < 12) val += 12;
			if (!isPm.value && val === 12) val = 0;
			d.setHours(val);
		} else {
			d.setMinutes(val);
		}

		const newDateTime = new DateTime(d);
		updateValue(newDateTime, isFinish);
	};

	const toggleAmPm = (pm: boolean) => {
		isPm.value = pm;
		// Update ALL selected dates or just display?
		// Usually AM/PM toggles the context for future clicks.
		// For single value, we update immediately.
		if (selectionMode === 'single') {
			let h = displayDate.getHour();
			if (pm && h < 12) h += 12;
			if (!pm && h >= 12) h -= 12;

			const d = new Date(displayDate.getTime());
			d.setHours(h);
			onChange?.(new DateTime(d));
		}
	};

	// --- Rendering ---

	const renderFace = () => {
		const total = mode.value === 'hours' ? 12 : 12; // 12 visual segments
		const numbers = [];
		const radius = 100;

		// Determine highlighted values
		const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

		for (let i = 1; i <= total; i++) {
			const numVal = mode.value === 'hours' ? i : i * 5;
			const pos = getPosition(i, 12, radius);

			// Check if this number is selected
			let isActive = false;
			let isMulti = false;

			if (mode.value === 'hours') {
				// Match hour (considering AM/PM context of the toggle)
				// We highlight if ANY selected date matches this hour in current AM/PM context
				const checkHour = isPm.value ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);

				isActive = selectedValues.some((d) => d.getHour() === checkHour);
			} else {
				// Match minute (rough match for 5-min intervals)
				const checkMin = numVal === 60 ? 0 : numVal;
				isActive = selectedValues.some((d) => Math.round(d.getMinute() / 5) * 5 === checkMin);
			}

			// Style distinction for primary vs multi
			if (isActive) {
				const isPrimary = mode.value === 'hours'
					? (displayDate.getHour() % 12 || 12) === i
					: Math.round(displayDate.getMinute() / 5) * 5 === numVal;
				if (!isPrimary && selectionMode === 'multiple') isMulti = true;
			}

			numbers.push(
				<div
					key={i}
					className={`clock__number ${isActive ? 'clock__number--active' : ''} ${
						isMulti ? 'clock__number--multi' : ''
					}`}
					style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
				>
					{numVal === 60 ? '00' : numVal}
				</div>,
			);
		}

		// Hand logic (only points to primary display value)
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

			<div className='time-clock__body'>
				{renderFace()}
			</div>
		</div>
	);
}
