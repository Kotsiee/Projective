# Project Codebase Context

## Project Tree

```text
apps/
web/
client.ts
components/
auth/
buttons/
fields/
navigation/
public/
search/
Theme.tsx
contracts/
account/
auth/
navigation.ts
public/
deno.json
hooks/
fields/
islands/
NavBar.tsx
pages/
main.ts
routes/
(auth)/
(dashboard)/
(public)/
api/
_app.tsx
_middleware.ts
server/
auth/
core/
dashboard/
middleware/
public/
static/
favicon.ico
logo.svg
styles/
components/
layouts/
pages/
styles.css
themes/
svg/
types/
dashboard/
fields/
public/
utils.ts
db/
functions/
auth_project_or_dm_participant.sql
migrations/
0001_init_schemas.sql
0002_security_tables.sql
0003_org_tables.sql
0004_ops_tables.sql
0005_projects_tables.sql
0006_comms_tables.sql
0007_finance_tables.sql
0020_helpers_functions.sql
policies/
comms/
finance/
marketplace/
org/
business_profiles.sql
freelancer_profiles.sql
teams.sql
team_memberships.sql
users_public.sql
user_emails.sql
projects/
security/
audit_logs.sql
refresh_tokens.sql
session_context.sql
v_current_context.sql
storage/
scripts/
diff.sh
dump.sh
restore.sh
seeds/
views/
analytics_earnings_by_stage_mv.sql
security/
v_current_context.sql
deno.json
deno.lock
infra/
cf/
README.md
deno/
README.md
stripe/
README.md
LICENSE
packages/
backend/
auth/
jwt.ts
tokens.ts
config.ts
cookies.ts
crypto.ts
deno.json
mod.ts
rateLimiter.ts
shared/
cookies.ts
deno.json
math.ts
mod.ts
types.ts
validation/
auth.ts
formatters.ts
validators.ts
ui/
components/
deno.json
mod.ts
providers/
README.md
themes/
utils/
ThemeSwitcher.ts
wasm/
image_ops/
README.md
pack_project.ts
Projective Logo - White.png
Projective Logo.png
Projective Logo.svg
README.md
scripts/
dev.sh
setup.sh
test.sh
validate_names.ts
setup.ps1
supabase/
cli-latest
config/
README.md
edge-functions/
README.md
storage-rules/
README.md
testing.env.test
vite.config.ts
```

## File Contents

### File: apps\web\client.ts

```ts
import '@styles/styles.css';
```

### File: apps\web\components\auth\GitHubRegisterButton.tsx

```tsx
import '@styles/components/auth/provider-login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { IconBrandGithub } from '@tabler/icons-preact';

type Props = { redirectTo?: string };

export default function GoogleRegisterButton({ redirectTo = '/verify' }: Props) {
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const handleClick = useCallback(() => {
		if (loading) return;
		setErr(null);
		setLoading(true);

		try {
			const params = new URLSearchParams({
				next: redirectTo || '/',
			});
			const startUrl = `/api/v1/auth/github/github-register?${params.toString()}`;

			globalThis.location.assign(startUrl);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error starting OAuth';
			setErr(msg);
			console.error('OAuth start exception', e);
			globalThis.dispatchEvent(
				new CustomEvent('auth:error', { detail: { stage: 'oauth_start', error: String(msg) } }),
			);
			setLoading(false);
		}
	}, [loading, redirectTo]);

	return (
		<div class='w-full'>
			<button
				type='button'
				onClick={handleClick}
				disabled={loading}
				class='provider-login-button'
				aria-busy={loading}
				aria-label='Continue with Google'
			>
				<IconBrandGithub />
				{loading ? 'Connecting…' : 'Continue with GitHub'}
			</button>
			{err && (
				<p role='alert' aria-live='polite' class='mt-2 text-sm text-red-600'>
					{err}
				</p>
			)}
		</div>
	);
}
```

### File: apps\web\components\auth\GoogleLoginButton.tsx

```tsx
import '@styles/components/auth/provider-login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { IconBrandGoogle } from '@tabler/icons-preact';

type Props = { redirectTo?: string };

export default function GoogleLoginButton({ redirectTo = '/' }: Props) {
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const handleClick = useCallback(() => {
		if (loading) return;
		setErr(null);
		setLoading(true);

		try {
			const params = new URLSearchParams({
				next: redirectTo || '/',
			});
			const startUrl = `/api/v1/auth/google/google-login?${params.toString()}`;

			globalThis.location.assign(startUrl);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error starting OAuth';
			setErr(msg);
			console.error('OAuth start exception', e);
			globalThis.dispatchEvent(
				new CustomEvent('auth:error', { detail: { stage: 'oauth_start', error: String(msg) } }),
			);
			setLoading(false);
		}
	}, [loading, redirectTo]);

	return (
		<div class='w-full'>
			<button
				type='button'
				onClick={handleClick}
				disabled={loading}
				class='provider-login-button'
				aria-busy={loading}
				aria-label='Continue with Google'
			>
				<IconBrandGoogle />
				{loading ? 'Connecting…' : 'Continue with Google'}
			</button>
			{err && (
				<p role='alert' aria-live='polite' class='mt-2 text-sm text-red-600'>
					{err}
				</p>
			)}
		</div>
	);
}
```

### File: apps\web\components\auth\GoogleRegisterButton.tsx

```tsx
import '@styles/components/auth/provider-login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { IconBrandGoogle } from '@tabler/icons-preact';

type Props = { redirectTo?: string };

export default function GoogleRegisterButton({ redirectTo = '/verify' }: Props) {
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const handleClick = useCallback(() => {
		if (loading) return;
		setErr(null);
		setLoading(true);

		try {
			const params = new URLSearchParams({
				next: redirectTo || '/',
			});
			const startUrl = `/api/v1/auth/google/google-register?${params.toString()}`;

			globalThis.location.assign(startUrl);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error starting OAuth';
			setErr(msg);
			console.error('OAuth start exception', e);
			globalThis.dispatchEvent(
				new CustomEvent('auth:error', { detail: { stage: 'oauth_start', error: String(msg) } }),
			);
			setLoading(false);
		}
	}, [loading, redirectTo]);

	return (
		<div class='w-full'>
			<button
				type='button'
				onClick={handleClick}
				disabled={loading}
				class='provider-login-button'
				aria-busy={loading}
				aria-label='Continue with Google'
			>
				<IconBrandGoogle />
				{loading ? 'Connecting…' : 'Continue with Google'}
			</button>
			{err && (
				<p role='alert' aria-live='polite' class='mt-2 text-sm text-red-600'>
					{err}
				</p>
			)}
		</div>
	);
}
```

### File: apps\web\components\auth\LoginButton.tsx

```tsx
import '@styles/components/auth/login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { Signal } from '@preact/signals';

type Props = {
	redirectTo?: string;
	email: Signal<string | undefined>;
	password: Signal<string | undefined>;
};

export default function LoginButton({ redirectTo = '/', email, password }: Props) {
	const [loading, setLoading] = useState(false);

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const response = await fetch('/api/v1/auth/email/login', {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email, password: password }),
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Login success:', data);
				globalThis.location.href = data.redirectTo;
			} else {
				const c = await response.json();
				console.error('Login failed:', response);
				console.error('Login failed:', c.error.code);
			}
		} finally {
			setLoading(false);
		}
	}, [loading]);

	return (
		<button
			type='button'
			onClick={handleClick}
			disabled={loading}
			class='login-button'
		>
			{loading ? 'Connecting…' : 'Log In'}
		</button>
	);
}
```

### File: apps\web\components\auth\OnboardingSubmit.tsx

```tsx
// apps/web/islands/auth/OnboardingSubmit.tsx
import { useCallback, useState } from 'preact/hooks';
import { OnboardingRequest } from '@contracts/auth/onboading.ts';
import { getCsrfToken } from '@shared';

export default function OnboardingSubmit({
	firstName,
	lastName,
	username,
	type,
}: OnboardingRequest) {
	const [loading, setLoading] = useState(false);

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const csrf = getCsrfToken();

			if (!csrf) {
				setLoading(false);
				return;
			}

			const response = await fetch('/api/v1/auth/onboarding', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'X-CSRF': csrf,
				},
				body: JSON.stringify({ firstName, lastName, username, type }),
			});

			if (!response.ok) {
				const errorBody = await response.json().catch(() => null);
				console.error('Onboarding failed:', errorBody ?? response.statusText);
				return;
			}

			const data = await response.json();
			console.log('Onboarding success:', data);
			// globalThis.location.href = '/dashboard';
		} catch (err) {
			console.error('Onboarding error:', err);
		} finally {
			setLoading(false);
		}
	}, [loading, firstName, lastName, username, type]);

	return (
		<button
			type='button'
			class='onboarding-submit'
			onClick={handleClick}
			disabled={loading}
			aria-busy={loading}
			aria-label='Create Profile'
		>
			{loading ? 'Saving…' : 'Continue'}
		</button>
	);
}
```

### File: apps\web\components\auth\RegisterButton.tsx

```tsx
import '@styles/components/auth/login-button.css';
import { useCallback, useState } from 'preact/hooks';
import RegisterWithEmail from 'packages/shared/validation/auth.ts';
import { computed, Signal } from '@preact/signals';

type Props = {
	email: Signal<string | undefined>;
	password: Signal<string | undefined>;
	confirmPassword: Signal<string | undefined>;
};

export default function RegisterButton({
	email,
	password,
	confirmPassword,
}: Props) {
	const [loading, setLoading] = useState(false);

	const hasErrors = computed(() => {
		const e = (email.value || '').trim();
		const p = (password.value || '').trim();
		const c = (confirmPassword.value || '').trim();

		const v = RegisterWithEmail.validate({
			email: e,
			password: p,
			confirmPassword: c,
		}).ok;

		return !v;
	});

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const e = (email.value || '').trim();
			const p = (password.value || '').trim();
			const c = (confirmPassword.value || '').trim();

			const { ok } = RegisterWithEmail.validate({
				email: e,
				password: p,
				confirmPassword: c,
			});

			if (!ok) return;

			const response = await fetch('/api/v1/auth/email/register', {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: e, password: p }),
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Registration success:', data);
				globalThis.location.href = '/verify';
			} else {
				console.error('Registration failed:', response);
			}
		} finally {
			setLoading(false);
		}
	}, [loading, email, password, confirmPassword]);

	return (
		<button
			type='button'
			class='login-button'
			onClick={handleClick}
			disabled={hasErrors.value}
			aria-busy={loading}
			aria-label='Create account'
		>
			{loading ? 'Connecting…' : 'Create Account'}
		</button>
	);
}
```

### File: apps\web\components\auth\ResendButton.tsx

```tsx
import '@styles/components/auth/login-button.css';
import { useCallback, useState } from 'preact/hooks';

type Props = {
	email: string | undefined;
};

export default function ResendButton({ email }: Props) {
	const [loading, setLoading] = useState(false);

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const response = await fetch('/api/v1/auth/resend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			if (response.ok) {
				const data = await response.json();
			} else {
				const c = await response.json();
			}
		} finally {
			setLoading(false);
		}
	}, [loading]);

	return (
		<button
			type='button'
			onClick={handleClick}
			disabled={loading}
			class='verify-button'
		>
			Resend verification email
		</button>
	);
}
```

### File: apps\web\components\fields\DynamicField.tsx

```tsx
const FIELD_REGISTRY = {
	//   text: TextField,
	//   email: TextField,
	//   select: SelectField,
	//   slider: SliderField,
};

export function DynamicField(props: FieldSchema) {
	const Component = FIELD_REGISTRY[props.type];

	if (!Component) return null;

	return <Component {...props} />;
}
```

### File: apps\web\components\fields\PasswordField.tsx

```tsx
import { InputHTMLAttributes } from 'preact';
import '@styles/components/fields/TextField.css';
import { IconEye, IconEyeClosed } from '@tabler/icons-preact';
import { signal } from '@preact/signals';

const type = signal<boolean>(true);

export default function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
	const toggleVisibility = () => {
		type.value = !type.value;
	};

	return (
		<span class='password-field'>
			<input type={type.value ? 'password' : 'text'} {...props} />
			<button
				type='button'
				onClick={toggleVisibility}
				class='password-field__toggle-visibility'
			>
				{type.value ? <IconEyeClosed /> : <IconEye />}
			</button>
		</span>
	);
}
```

### File: apps\web\components\fields\SelectField.tsx

```tsx
import '@styles/components/fields/SelectField.css';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { useSelectState } from '../../hooks/fields/useSelectState.ts';
import { BaseFieldProps } from '../../types/fields/form.ts';
import { SelectFieldConfig, SelectOption } from '../../types/fields/select.ts';

interface SelectFieldProps extends BaseFieldProps, SelectFieldConfig {
	options: SelectOption[];
}

export default function SelectField(props: SelectFieldProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [menuPosition, setMenuPosition] = useState<'down' | 'up'>('down');

	const sortedOptions = useMemo(() => {
		return [...props.options].sort((a, b) => {
			if (!a.group && !b.group) return 0;
			if (!a.group) return -1;
			if (!b.group) return 1;
			return a.group.localeCompare(b.group);
		});
	}, [props.options]);

	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		selectedValues,
		toggleSelectAll,
		selectOption,
		removeValue,
		handleKeyDown,
		toggleOpen,
	} = useSelectState({
		options: sortedOptions,
		value: props.value,
		onChange: props.onChange,
		multiple: props.multiple,
		disabled: props.disabled,
	});

	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = globalThis.innerHeight - rect.bottom;
			setMenuPosition(spaceBelow < 250 ? 'up' : 'down');

			if (inputRef.current) inputRef.current.focus();

			if (listRef.current) {
				const selectedEl = listRef.current.querySelector(
					'.select-field__option--selected, .select-field__option--highlighted',
				);
				if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
			}
		}
	}, [isOpen.value, highlightedIndex.value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [toggleOpen]);

	const getStatusIcon = () => {
		if (props.loading) {
			return props.icons?.loading || <IconLoader2 size={18} className='select-field__spin' />;
		}
		if (props.error && props.icons?.invalid) return props.icons.invalid;
		if (props.success && props.icons?.valid) return props.icons.valid;
		if (isOpen.value) return props.icons?.arrowOpen || <IconChevronDown size={18} />;
		return props.icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.map((val) => {
			const opt = props.options.find((o) => o.value === val);
			if (!opt) return null;
			return (
				<span key={val} className='select-field__chip'>
					{opt.label}
					<span
						className='select-field__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						<IconX size={14} />
					</span>
				</span>
			);
		});
	};

	const renderSelectionContent = () => {
		if (props.displayMode === 'count' && selectedValues.length > 0) {
			return <span className='select-field__summary'>{selectedValues.length} selected</span>;
		}

		if (props.multiple && (!props.displayMode || props.displayMode === 'chips-inside')) {
			return <>{renderChips()}</>;
		}

		if (!props.multiple && selectedValues.length > 0 && searchQuery.value === '') {
			const opt = props.options.find((o) => o.value === selectedValues[0]);
			return opt ? <div className='select-field__single-value'>{opt.label}</div> : null;
		}

		return null;
	};

	const renderDropdownContent = () => {
		if (filteredOptions.value.length === 0) {
			return <div className='select-field__no-options'>No options found</div>;
		}

		let lastGroup: string | undefined = undefined;

		return filteredOptions.value.map((option, index) => {
			const isSelected = selectedValues.includes(option.value);
			const isHighlighted = index === highlightedIndex.value;
			const showHeader = option.group !== lastGroup;
			lastGroup = option.group;

			return (
				<div key={option.value}>
					{showHeader && option.group && (
						<div className='select-field__group-label'>{option.group}</div>
					)}

					<div
						role='option'
						aria-selected={isSelected}
						className={`select-field__option 
                 ${isSelected ? 'select-field__option--selected' : ''} 
                 ${isHighlighted ? 'select-field__option--highlighted' : ''}
                 ${option.disabled ? 'select-field__option--disabled' : ''}
               `}
						onClick={(e) => {
							e.stopPropagation();
							selectOption(option);
						}}
						onMouseEnter={() => highlightedIndex.value = index}
					>
						<div className='select-field__opt-content'>
							{option.icon && <span className='select-field__icon'>{option.icon}</span>}
							{option.avatarUrl && <img src={option.avatarUrl} className='select-field__avatar' />}
							<span>{option.label}</span>
						</div>
						{isSelected && <IconCheck size={16} className='select-field__check' />}
					</div>
				</div>
			);
		});
	};

	const containerClasses = [
		'select-field',
		props.className,
		isOpen.value ? 'select-field--open' : '',
		props.disabled ? 'select-field--disabled' : '',
		props.error ? 'select-field--error' : '',
		props.success ? 'select-field--success' : '',
		`select-field--pos-${menuPosition}`,
	].filter(Boolean).join(' ');

	// --- FIX: Logic to determine if "All Enabled" are selected ---
	const areAllEnabledSelected = (() => {
		if (!props.multiple) return false;
		const enabledOptions = filteredOptions.value.filter((o) => !o.disabled);
		if (enabledOptions.length === 0) return false;
		return enabledOptions.every((o) => selectedValues.includes(o.value));
	})();

	return (
		<div className={containerClasses} ref={containerRef}>
			{props.label && (
				<label className='select-field__label' htmlFor={props.id}>
					{props.label} {props.required && <span className='select-field__req'>*</span>}
				</label>
			)}

			<div
				className='select-field__wrapper'
				onMouseDown={(e) => {
					if (e.target !== inputRef.current) {
						e.preventDefault();
						toggleOpen();
					}
				}}
			>
				<div className='select-field__content'>
					{renderSelectionContent()}

					<input
						ref={inputRef}
						id={props.id}
						className='select-field__input'
						type='text'
						value={searchQuery.value}
						placeholder={selectedValues.length === 0 ? props.placeholder : ''}
						onInput={(e) => setSearchQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
						onClick={() => toggleOpen(true)}
						onFocus={() => toggleOpen(true)}
						disabled={props.disabled}
						readOnly={!props.searchable}
						style={{
							opacity: (!props.multiple && selectedValues.length > 0 && !searchQuery.value) ? 0 : 1,
						}}
					/>
				</div>

				<div className='select-field__indicators'>
					{!props.loading && props.clearable && selectedValues.length > 0 && (
						<button
							type='button'
							className='select-field__clear'
							onMouseDown={(e) => {
								e.stopPropagation();
								props.onChange?.(props.multiple ? [] : null);
							}}
						>
							<IconX size={16} />
						</button>
					)}

					<div
						className={`select-field__arrow ${
							isOpen.value && !props.loading ? 'select-field__arrow--flip' : ''
						}`}
					>
						{getStatusIcon()}
					</div>
				</div>
			</div>

			{props.multiple && props.displayMode === 'chips-below' && selectedValues.length > 0 && (
				<div className='select-field__chips-external'>
					{renderChips()}
				</div>
			)}

			{isOpen.value && !props.disabled && (
				<div
					className='select-field__menu'
					ref={listRef}
					role='listbox'
					onMouseDown={(e) => e.preventDefault()}
				>
					{props.multiple && props.enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='select-field__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>
								{areAllEnabledSelected ? 'Deselect All' : 'Select All'}
							</span>
						</div>
					)}

					{renderDropdownContent()}
				</div>
			)}

			{props.error && <div className='select-field__msg-error'>{props.error}</div>}
		</div>
	);
}
```

### File: apps\web\components\fields\SliderField.tsx

```tsx
import '@styles/components/fields/SliderField.css';
import { SliderFieldProps, SliderMark } from '../../types/fields/slider.ts';
import { valueToPercent, valueToPercentLog } from '@shared/math';
import { useSliderState } from '../../hooks/fields/useSliderState.ts';

export default function SliderField(props: SliderFieldProps) {
	const min = props.min ?? 0;
	const max = props.max ?? 100;
	const step = props.step ?? 1;

	const {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	} = useSliderState({
		value: props.value,
		onChange: props.onChange,
		min,
		max,
		step,
		range: props.range,
		disabled: props.disabled,
		marks: props.marks,
		snapToMarks: props.snapToMarks,
		vertical: props.vertical,
		scale: props.scale,
		minDistance: props.minDistance,
	});

	const renderMarks = () => {
		if (!props.marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(props.marks)) {
			points = props.marks.map((m) => typeof m === 'number' ? { value: m } : m);
		} else if (props.marks === true) {
			// Auto-gen not recommended for Log scale unless careful,
			// but for linear it works fine.
			if (props.scale === 'logarithmic') return null; // Skip auto-marks for log

			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) {
				points.push({ value: i });
			}
		}

		return (
			<div className='slider-field__marks'>
				{points.map((mark, i) => {
					// Use correct math for mark positioning
					const pct = props.scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);

					if (pct < 0 || pct > 100) return null;

					const style = props.vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					return (
						<div key={i} className='slider-field__mark' style={style}>
							<div className='slider-field__mark-tick'></div>
							{mark.label && <div className='slider-field__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const getTooltipContent = (val: number) => {
		if (typeof props.tooltip === 'function') return props.tooltip(val);
		// Format precision based on step
		const precision = step.toString().split('.')[1]?.length || 0;
		return val.toFixed(precision);
	};

	const containerClasses = [
		'slider-field',
		props.className,
		props.disabled ? 'slider-field--disabled' : '',
		props.range ? 'slider-field--range' : '',
		props.marks ? 'slider-field--has-marks' : '',
		props.vertical ? 'slider-field--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = props.vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses}>
			{props.label && (
				<div className='slider-field__header'>
					<label className='slider-field__label' htmlFor={props.id}>
						{props.label} {props.required && <span className='slider-field__req'>*</span>}
					</label>
				</div>
			)}

			<div className='slider-field__control' style={wrapperStyle}>
				<div
					className='slider-field__track-container'
					ref={trackRef}
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='slider-field__rail'></div>
					<div className='slider-field__track' style={trackFillStyle.value}></div>

					{renderMarks()}

					{handleStyles.value.map((style, index) => {
						const isActive = activeHandleIdx.value === index;
						const val = internalValues.value[index];

						return (
							<div
								key={index}
								className={`slider-field__handle ${isActive ? 'slider-field__handle--active' : ''}`}
								style={style}
								tabIndex={props.disabled ? -1 : 0}
								role='slider'
								aria-orientation={props.vertical ? 'vertical' : 'horizontal'}
								aria-valuemin={min}
								aria-valuemax={max}
								aria-valuenow={val}
								onPointerDown={(e) => handlePointerDown(index, e)}
								onPointerMove={handlePointerMove}
								onPointerUp={handlePointerUp}
								onContextMenu={(e) => e.preventDefault()}
							>
								<div className='slider-field__handle-knob'></div>
								{props.tooltip && (
									<div className='slider-field__tooltip'>
										{getTooltipContent(val)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{props.error && <div className='slider-field__msg-error'>{props.error}</div>}
			{props.hint && !props.error && <div className='slider-field__msg-hint'>{props.hint}</div>}
		</div>
	);
}
```

### File: apps\web\components\fields\TextField.tsx

```tsx
import '@styles/components/fields/TextField.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import {
	IconCreditCard,
	IconCurrencyDollar,
	IconEye,
	IconEyeOff,
	IconX,
} from '@tabler/icons-preact';
import { TextFieldProps } from '../../types/fields/text.ts';
import { useTextMask } from '../../hooks/fields/useTextMask.ts';
import { formatCurrency, isValidCreditCard, parseNumber } from '@shared';

export default function TextField(props: TextFieldProps) {
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
	const isFocused = useSignal(false);
	const isPasswordVisible = useSignal(false);
	const internalError = useSignal<string>('');

	// --- Variant Logic ---
	const isCurrency = props.variant === 'currency';
	const isCreditCard = props.variant === 'credit-card';

	const activeMask = isCreditCard ? (props.mask || '9999 9999 9999 9999') : props.mask;
	const activeInputMode = isCurrency ? 'decimal' : (isCreditCard ? 'numeric' : props.inputMode);
	const activeIconLeft = isCreditCard && !props.prefix && !props.iconLeft
		? <IconCreditCard size={18} />
		: (isCurrency && !props.prefix && !props.iconLeft
			? <IconCurrencyDollar size={18} />
			: props.iconLeft);

	// --- Value Management ---
	const rawValue = props.value?.toString() || '';
	const displayValue = useSignal(rawValue);

	useEffect(() => {
		if (!isFocused.value) {
			if (isCurrency && rawValue) {
				displayValue.value = formatCurrency(rawValue);
			} else {
				displayValue.value = rawValue;
			}
		}
	}, [rawValue, isCurrency]);

	// --- Hooks ---
	const { handleMaskInput } = useTextMask({
		mask: activeMask,
		value: displayValue.value,
		onChange: (val) => {
			displayValue.value = val;
			props.onChange?.(val);
		},
		ref: inputRef,
	});

	// --- Handlers ---
	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const val = target.value;

		if (activeMask && !props.multiline) {
			handleMaskInput(e);
			return;
		}

		displayValue.value = val;

		if (isCurrency) {
			props.onChange?.(parseNumber(val));
		} else {
			props.onChange?.(val);
		}

		if (props.multiline) handleAutoGrow();
	};

	const handleFocus = (e: FocusEvent) => {
		isFocused.value = true;
		if (isCurrency) displayValue.value = parseNumber(rawValue);
		props.onFocus?.(e);
	};

	const handleBlur = (e: FocusEvent) => {
		isFocused.value = false;
		if (isCurrency) displayValue.value = formatCurrency(rawValue);
		if (isCreditCard) {
			internalError.value = (rawValue.length > 0 && !isValidCreditCard(rawValue))
				? 'Invalid card number'
				: '';
		}
		props.onBlur?.(e);
	};

	const handleAutoGrow = () => {
		if (props.multiline && props.autoGrow && inputRef.current) {
			const el = inputRef.current;
			el.style.height = 'auto';
			el.style.height = `${el.scrollHeight}px`;
		}
	};

	useLayoutEffect(() => {
		if (props.multiline && props.autoGrow) handleAutoGrow();
	}, [displayValue.value, props.multiline, props.autoGrow]);

	// --- Render ---
	const currentType = props.type === 'password' && isPasswordVisible.value
		? 'text'
		: (props.type || 'text');

	const shouldFloat = isFocused.value || displayValue.value.length > 0 || !!props.placeholder;
	const activeError = internalError.value || props.error;

	const containerClasses = [
		'text-field',
		props.className,
		activeError ? 'text-field--error' : '',
		props.success ? 'text-field--success' : '',
		props.disabled ? 'text-field--disabled' : '',
		props.floatingLabel ? 'text-field--floating' : '',
		shouldFloat ? 'text-field--active' : '',
		props.multiline ? 'text-field--multiline' : '',
		props.autoGrow ? 'text-field--auto-grow' : '', // Explicit class for CSS
	].filter(Boolean).join(' ');

	return (
		<div className={containerClasses}>
			{props.label && (
				<label className='text-field__label' htmlFor={props.id}>
					{props.label} {props.required && <span className='text-field__req'>*</span>}
				</label>
			)}

			<div className='text-field__wrapper'>
				{(props.prefix || activeIconLeft) && (
					<div className='text-field__addon text-field__addon--left'>
						{props.prefix || activeIconLeft}
					</div>
				)}

				{props.multiline
					? (
						<textarea
							ref={inputRef as any}
							id={props.id}
							className='text-field__input text-field__input--textarea'
							value={displayValue.value}
							placeholder={props.floatingLabel && !isFocused.value ? '' : props.placeholder}
							disabled={props.disabled}
							readOnly={props.readonly}
							maxLength={props.maxLength}
							rows={props.rows || 3}
							onInput={handleInput}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={props.onKeyDown}
						/>
					)
					: (
						<input
							ref={inputRef as any}
							id={props.id}
							className='text-field__input'
							type={currentType}
							inputMode={activeInputMode}
							value={displayValue.value}
							placeholder={props.floatingLabel && !isFocused.value ? '' : props.placeholder}
							disabled={props.disabled}
							readOnly={props.readonly}
							maxLength={props.maxLength}
							onInput={handleInput}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={props.onKeyDown}
						/>
					)}

				<div className='text-field__actions'>
					{props.clearable && displayValue.value.length > 0 && !props.disabled && !props.readonly &&
						(
							<button
								type='button'
								className='text-field__action-btn'
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									props.onChange?.('');
									displayValue.value = '';
									inputRef.current?.focus();
								}}
								tabIndex={-1}
								aria-label='Clear'
							>
								<IconX size={16} />
							</button>
						)}

					{!props.multiline && props.type === 'password' && props.showPasswordToggle &&
						!props.disabled && (
						<button
							type='button'
							className='text-field__action-btn'
							onClick={() => isPasswordVisible.value = !isPasswordVisible.value}
							tabIndex={-1}
						>
							{isPasswordVisible.value ? <IconEyeOff size={18} /> : <IconEye size={18} />}
						</button>
					)}

					{(props.suffix || props.iconRight) && (
						<div className='text-field__addon text-field__addon--right'>
							{props.suffix || props.iconRight}
						</div>
					)}
				</div>
			</div>

			<div className='text-field__footer'>
				<div className='text-field__messages'>
					{activeError && <span className='text-field__msg-error'>{activeError}</span>}
					{props.hint && !activeError && <span className='text-field__msg-hint'>{props.hint}</span>}
				</div>

				{props.showCount && props.maxLength && (
					<div className='text-field__counter'>
						{displayValue.value.length} / {props.maxLength}
					</div>
				)}
			</div>
		</div>
	);
}
```

### File: apps\web\components\navigation\NavBarGuest.tsx

```tsx
import '@styles/components/navigation/nav-bar-guest.css';
import { theme } from '@ui';

export default function NavBarGuest() {
	const switchTheme = () => {
		if (theme.value === 'light') {
			theme.value = 'dark';
		} else {
			theme.value = 'light';
		}
	};

	return (
		<div class='header-container'>
			<div class='header__logo'>
				<h1>Projective</h1>
			</div>
			<div class='header__buttons'>
				<button type='button'>search</button>
				<button type='button' onClick={() => switchTheme()}>{theme.value}</button>
				<a href='#'>Explore</a>
				<a class='header__buttons__user header__buttons__login' href='/login'>Login</a>
				<a class='header__buttons__user header__buttons__join' href='/register'>Join</a>
			</div>
		</div>
	);
}
```

### File: apps\web\components\navigation\NavBarUser.tsx

```tsx
import '@styles/components/navigation/nav-bar-user.css';
import { IconBell } from '@tabler/icons-preact';
import NavBarUserProfile from './profile/NavBarUserProfile.tsx';

export default function NavBarUser() {
	return (
		<div class='nav-bar-user'>
			<div class='nav-bar-user__logo'>
				<img class='nav-bar-user__logo__svg' src='/logo.svg' alt='Logo' />
				<h1>Projective</h1>
			</div>
			<div class='nav-bar-user__search'>
				<h1>Logo</h1>
			</div>
			<div class='nav-bar-user__actions'>
				<IconBell />
				<NavBarUserProfile />
			</div>
		</div>
	);
}
```

### File: apps\web\components\navigation\NavBarUserSide.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-side.css';
import { apps } from '@contracts/navigation.ts';
import { useEffect, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-preact';

const open = signal(false);

export default function NavBarUserSide() {
	const navApps = apps;
	const [selected, setSelected] = useState('');

	useEffect(() => {
		const loc = globalThis.location.pathname.substring(1).split('/')[0];
		setSelected(`/${loc.trim()}`);
	}, [globalThis.location]);

	const handleButtonClick = (_: MouseEvent) => {
		open.value = !open.value;
	};

	return (
		<aside class='nav-bar-user-side' data-sidebar-open={open.value}>
			<nav class='nav-bar-user-side__container'>
				{navApps.map((group) => {
					return (
						<div class='nav-bar-user-side__group'>
							{group.map((app) => {
								return (
									<a
										class='nav-bar-user-side__app'
										href={app.link}
										data-selected={selected === app.link}
										data-tooltip={app.name}
									>
										<app.icon />
										{open.value && <span>{app.name}</span>}
									</a>
								);
							})}
							<hr />
						</div>
					);
				})}
				<button type='button' class='nav-bar-user-side__open' onClick={handleButtonClick}>
					{open.value ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
				</button>
			</nav>
		</aside>
	);
}
```

### File: apps\web\components\navigation\profile\NavBarUserProfile.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-profile.css';
import NavBarUserProfileDropdown from './NavBarUserProfileDropdown.tsx';
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

const open = signal(false);

export default function NavBarUserProfile() {
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (root.contains(event.target as Node)) return;
			open.value = false;
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleButtonClick = (event: MouseEvent) => {
		console.log('huh');
		event.stopPropagation();
		open.value = !open.value;
	};

	return (
		<div class='nav-bar-user__profile' ref={rootRef}>
			<button
				type='button'
				class='nav-bar-user__profile__btn'
				onClick={handleButtonClick}
			>
				<div class='nav-bar-user__profile__btn__img'>
					<img src='https://placehold.co/50x50' />
				</div>
			</button>

			{open.value && (
				<div
					class='nav-bar-user__profile__dropdown-wrapper'
					tabIndex={0}
					onClick={(event: MouseEvent) => event.stopPropagation()}
				>
					<NavBarUserProfileDropdown />
				</div>
			)}
		</div>
	);
}
```

### File: apps\web\components\navigation\profile\NavBarUserProfileDropdown.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-profile-dropdown.css';
import { IconArrowsLeftRight, IconUser } from '@tabler/icons-preact';
import NavBarUserProfileDropdownActions from './NavBarUserProfileDropdownActions.tsx';
import NavBarUserProfileDropdownSwitch from './NavBarUserProfileDropdownSwitch.tsx';
import { signal } from '@preact/signals';

const switchView = signal(true);

export default function NavBarUserProfileDropdown() {
	return (
		<div class='nav-bar-user__profile__dropdown'>
			<div class='nav-bar-user__profile__dropdown__current'>
				<div class='nav-bar-user__profile__dropdown__current__profile'>
					<img src='https://placehold.co/50x50' />
					<div class='nav-bar-user__profile__dropdown__current__profile__name'>
						<p class='nav-bar-user__profile__dropdown__current__profile__name__name'>bla</p>
						<p class='nav-bar-user__profile__dropdown__current__profile__name__username'>bla</p>
					</div>
				</div>
				<button
					type='button'
					class='nav-bar-user__profile__dropdown__current__switch'
					data-tooltip={switchView.value ? 'Switch Account' : 'Account Actions'}
					onClick={() => switchView.value = !switchView.value}
				>
					{switchView.value ? <IconArrowsLeftRight /> : <IconUser />}
				</button>
			</div>
			<div>
				{switchView.value
					? <NavBarUserProfileDropdownActions />
					: <NavBarUserProfileDropdownSwitch />}
			</div>
		</div>
	);
}
```

### File: apps\web\components\navigation\profile\NavBarUserProfileDropdownActions.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-profile-dropdown-actions.css';

export default function NavBarUserProfileDropdownActions() {
	return (
		<div class='nav-bar-user__profile__dropdown__actions'>
			<a>Profile</a>
			<a>Log Out</a>
		</div>
	);
}
```

### File: apps\web\components\navigation\profile\NavBarUserProfileDropdownBusiness.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-profile-dropdown-business.css';

export default function NavBarUserProfileDropdownBusiness() {
	return (
		<div class='nav-bar-user__profile__dropdown__business'>
			<a class='nav-bar-user__profile__dropdown__add'>
				+ Add Business
			</a>
		</div>
	);
}
```

### File: apps\web\components\navigation\profile\NavBarUserProfileDropdownSwitch.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-profile-dropdown-switch.css';
import { signal } from '@preact/signals';
import NavBarUserProfileDropdownTeams from './NavBarUserProfileDropdownTeams.tsx';
import NavBarUserProfileDropdownBusiness from './NavBarUserProfileDropdownBusiness.tsx';

const switchView = signal(false);

export default function NavBarUserProfileDropdownSwitch() {
	return (
		<div class='nav-bar-user__profile__dropdown__switch'>
			<div class='nav-bar-user__profile__dropdown__switch__switch'>
				<label class='nav-bar-user__profile__dropdown__switch__label'>
					<input
						type='radio'
						class='nav-bar-user__profile__dropdown__switch__input'
						name='nav-bar-user__profile__dropdown__switch__input'
						id='nav-bar-user__profile__dropdown__switch__input--teams'
						value='teams'
						onInput={() => switchView.value = false}
						checked={switchView.value == false}
						hidden
					/>
					Teams
				</label>
				<label class='nav-bar-user__profile__dropdown__switch__label'>
					<input
						type='radio'
						class='nav-bar-user__profile__dropdown__switch__input'
						name='nav-bar-user__profile__dropdown__switch__input'
						id='nav-bar-user__profile__dropdown__switch__input--business'
						value='business'
						onInput={() => switchView.value = true}
						checked={switchView.value == true}
						hidden
					/>
					Business
				</label>
			</div>
			<hr />
			<div class='nav-bar-user__profile__dropdown__switch__account-type'>
				{!switchView.value
					? <NavBarUserProfileDropdownTeams />
					: <NavBarUserProfileDropdownBusiness />}
			</div>
		</div>
	);
}
```

### File: apps\web\components\navigation\profile\NavBarUserProfileDropdownTeams.tsx

```tsx
import '@styles/components/navigation/nav-bar-user-profile-dropdown-teams.css';

export default function NavBarUserProfileDropdownTeams() {
	return (
		<div class='nav-bar-user__profile__dropdown__teams'>
			<a class='nav-bar-user__profile__dropdown__add'>
				+ Add Team
			</a>
		</div>
	);
}
```

### File: apps\web\components\public\explore\Filters.tsx

```tsx
import '@styles/components/public/explore/filters.css';
import SelectField from '../../fields/SelectField.tsx';
import { SelectOption } from '../../../types/fields/select.ts';
import { signal } from '@preact/signals';
import {
	IconBriefcase,
	IconCode,
	IconMail,
	IconPalette,
	IconSearch,
	IconStar,
	IconUser,
} from '@tabler/icons-preact';
import { useState } from 'preact/hooks';
import TextField from '../../fields/TextField.tsx';
import SliderField from '../../fields/SliderField.tsx';

const ROLE_OPTIONS: SelectOption[] = [
	{ label: 'Frontend Developer', value: 'fe', icon: <IconCode size={18} />, group: 'Engineering' },
	{ label: 'Backend Developer', value: 'be', icon: <IconCode size={18} />, group: 'Engineering' },
	{ label: 'DevOps Engineer', value: 'ops', icon: <IconCode size={18} />, group: 'Engineering' },
	{ label: 'Product Designer', value: 'pd', icon: <IconPalette size={18} />, group: 'Design' },
	{ label: 'UX Researcher', value: 'ux', icon: <IconUser size={18} />, group: 'Design' },
	{ label: 'Product Manager', value: 'pm', icon: <IconBriefcase size={18} />, group: 'Management' },
];

const USER_OPTIONS: SelectOption[] = [
	{ label: 'Alice Johnson', value: 1, avatarUrl: 'https://i.pravatar.cc/150?u=1', group: 'Active' },
	{ label: 'Bob Smith', value: 2, avatarUrl: 'https://i.pravatar.cc/150?u=2', group: 'Active' },
	{
		label: 'Charlie Brown',
		value: 3,
		avatarUrl: 'https://i.pravatar.cc/150?u=3',
		group: 'Offline',
		disabled: true,
	},
	{
		label: 'David Williams',
		value: 4,
		avatarUrl: 'https://i.pravatar.cc/150?u=4',
		group: 'Active',
	},
];

export default function ExploreFilters() {
	const [role, setRole] = useState<string>('fe');
	const [team, setTeam] = useState<number[]>([1, 2]);
	const [status, setStatus] = useState<string>('');
	const [errorValue, setErrorValue] = useState<string>('');

	const [textVal, setTextVal] = useState('');
	const [passVal, setPassVal] = useState('');
	const [phoneVal, setPhoneVal] = useState('');
	const [dateVal, setDateVal] = useState('');
	const [licVal, setLicVal] = useState('');
	const [price, setPrice] = useState('');
	const [card, setCard] = useState('');
	const [val, setVal] = useState(0);
	const [rangeVal, setRangeVal] = useState(0);
	const [freqVal, setFreqVal] = useState(0);
	const [multiVal, setMultiVal] = useState(0);

	return (
		<div class='explore-filters'>
			<section
				style={{
					marginBottom: '3rem',
					padding: '1.5rem',
					border: '1px solid #ddd',
					borderRadius: '8px',
				}}
			>
				<h2 style={{ marginBottom: '1.5rem' }}>Text Fields</h2>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
					<SliderField
						name='freq'
						label='Frequency (Log Scale)'
						min={20}
						max={20000}
						step={1}
						scale='logarithmic'
						value={freqVal}
						onChange={(v) => setFreqVal(v as number)}
						tooltip
					/>

					<SliderField
						name='multi'
						label='Multi-Range (Pushable)'
						range
						min={0}
						max={100}
						value={multiVal} // [20, 50, 80]
						onChange={(v) => setMultiVal(v as number)}
						minDistance={10} // Handles push each other with 10 units gap
						tooltip
					/>

					<SliderField
						name='volume'
						label='Volume'
						min={0}
						max={100}
						value={val}
						onChange={(v) => setVal(v as number)}
					/>

					<SliderField
						name='price'
						label='Price Range'
						range
						min={0}
						max={1000}
						step={1}
						value={rangeVal}
						onChange={(v) => setRangeVal(v as number)}
						marks={[0, 250, 500, 750, 1000]}
						snapToMarks
					/>

					<SliderField
						name='price'
						label='Price Range'
						range
						min={0}
						max={1000}
						step={1}
						value={rangeVal}
						onChange={(v) => setRangeVal(v as number)}
						vertical
						height='150px'
					/>

					<SliderField
						name='price'
						label='Price Range'
						min={0}
						max={1000}
						step={1}
						value={rangeVal}
						onChange={(v) => setRangeVal(v as number)}
						vertical
						height='150px'
					/>

					<TextField
						name='price'
						label='Project Budget'
						variant='currency'
						value={price}
						onChange={(v) => setPrice(v.toString())}
						placeholder='0.00'
					/>

					<TextField
						name='cc'
						label='Card Number'
						variant='credit-card'
						value={card}
						onChange={(v) => setCard(v.toString())}
						placeholder='0000 0000 0000 0000'
					/>

					<TextField
						name='phone'
						label='Phone Number'
						mask='(999) 999-9999'
						placeholder='(555) 000-0000'
						inputMode='tel'
						value={phoneVal}
						onChange={(v) => setPhoneVal(v.toString())}
					/>

					<TextField
						name='date'
						label='Date (MM/DD/YYYY)'
						mask='99/99/9999'
						placeholder='MM/DD/YYYY'
						value={dateVal}
						onChange={(v) => setDateVal(v.toString())}
						hint="Try typing letters (they won't work)"
					/>

					<TextField
						name='license'
						label='License Plate (3 Letters - 3 Numbers)'
						mask='aaa-999'
						placeholder='ABC-123'
						value={licVal}
						onChange={(v) => setLicVal(v.toString())}
						// This mask automatically capitalizes due to 'a' logic if we enforced upper in logic,
						// but current hook is case-insensitive for 'a'.
						// You can enhance hook to enforce case if needed.
					/>

					<TextField
						name='bio'
						label='Biography'
						multiline
						rows={3}
						placeholder='Tell us about yourself...'
					/>

					<TextField
						name='notes'
						label='Auto-Growing Notes'
						multiline
						autoGrow
						floatingLabel
						placeholder='Start typing...'
					/>

					<TextField
						name='basic'
						label='Standard Input'
						placeholder='Type something...'
						value={textVal}
						onChange={(v) => setTextVal(v.toString())}
						clearable
					/>

					<TextField
						name='floating'
						label='Floating Label'
						floatingLabel
						value={textVal}
						onChange={(v) => setTextVal(v.toString())}
						hint='Labels float when focused or filled'
					/>

					<TextField
						name='password'
						label='Password'
						type='password'
						showPasswordToggle
						value={passVal}
						onChange={(v) => setPassVal(v.toString())}
						floatingLabel
					/>

					<TextField
						name='email'
						label='Email Address'
						type='email'
						iconLeft={<IconMail size={18} />}
						placeholder='user@example.com'
					/>

					<TextField
						name='search'
						label='Search'
						type='search'
						prefix={<IconSearch size={18} />}
						placeholder='Search query...'
						className='search-field'
					/>

					<TextField
						name='limits'
						label='Character Limit'
						maxLength={20}
						showCount
						value={textVal}
						onChange={(v) => setTextVal(v.toString())}
					/>

					<TextField
						name='prefix'
						label='Price'
						prefix='$'
						suffix='USD'
						placeholder='0.00'
						type='number'
					/>

					<TextField
						name='error'
						label='Validation Error'
						value='Invalid Data'
						error='This field is required'
					/>
				</div>
			</section>
		</div>
	);
}
```

### File: apps\web\components\public\explore\SearchBar.tsx

```tsx
import '@styles/components/search/SearchBar.css';
import { IconSearch } from '@tabler/icons-preact';

export default function SearchBar() {
	return (
		<div class='search-bar'>
			<input class='search-bar__input' type='text' placeholder='Search Projects...' />
			<button class='search-bar__enter' type='submit'>
				<IconSearch />
			</button>
		</div>
	);
}
```

### File: apps\web\components\search\SearchBar.tsx

```tsx
import '@styles/components/search/SearchBar.css';
import { IconSearch } from '@tabler/icons-preact';

export default function SearchBar() {
	return (
		<div class='search-bar'>
			<input class='search-bar__input' type='text' placeholder='Search Projects...' />
			<button class='search-bar__enter' type='submit'>
				<IconSearch />
			</button>
		</div>
	);
}
```

### File: apps\web\components\Theme.tsx

```tsx
```

### File: apps\web\contracts\auth\login.ts

```ts
export interface LoginWithEmailRequest {
	email: string;
	password: string;
}
```

### File: apps\web\contracts\auth\onboading.ts

```ts
export interface OnboardingRequest {
	firstName: string;
	lastName: string;
	username: string;
	type: 'freelancer' | 'client';
}
```

### File: apps\web\contracts\auth\register.ts

```ts
export interface RegisterWithEmailRequest {
	email: string;
	password: string;
}

export interface RegisterWithEmailResponse {
	data: {
		user: {
			id: string;
			aud: string;
			role: string;
			email: string;
			email_confirmed_at: string;
			phone: string;
			last_sign_in_at: string;
			app_metadata: {
				provider: string;
				providers: string[];
			};
			user_metadata: {};
			identities: [
				{
					identity_id: string;
					id: string;
					user_id: string;
					identity_data: {
						email: string;
						email_verified: string;
						phone_verified: string;
						sub: string;
					};
					provider: string;
					last_sign_in_at: string;
					created_at: string;
					updated_at: string;
					email: string;
				},
			];
			created_at: string;
			updated_at: string;
		};
		session: {
			access_token: string;
			token_type: string;
			expires_in: number;
			expires_at: number;
			refresh_token: string;
			user: {
				id: string;
				aud: string;
				role: string;
				email: string;
				email_confirmed_at: string;
				phone: string;
				last_sign_in_at: string;
				app_metadata: {
					provider: string;
					providers: string[];
				};
				user_metadata: {};
				identities: [
					{
						identity_id: string;
						id: string;
						user_id: string;
						identity_data: {
							email: string;
							email_verified: false;
							phone_verified: false;
							sub: string;
						};
						provider: string;
						last_sign_in_at: string;
						created_at: string;
						updated_at: string;
						email: string;
					},
				];
				created_at: string;
				updated_at: string;
			};
		};
	};
	error: string | null;
}
```

### File: apps\web\contracts\navigation.ts

```ts
import {
	Icon,
	IconBriefcase,
	IconBuilding,
	IconChartLine,
	IconCompass,
	IconHome,
	IconMessages,
	IconPlug,
	IconSettings,
	IconUsers,
	IconWallet,
} from '@tabler/icons-preact';

export interface INavApp {
	icon: Icon;
	name: string;
	link: string;
}

export const apps1: INavApp[] = [
	{
		icon: IconHome,
		name: 'Dashboard',
		link: '/dashboard',
	},
	{
		icon: IconCompass,
		name: 'Explore',
		link: '/explore',
	},
	{
		icon: IconMessages,
		name: 'Messages',
		link: '/messages',
	},
];

export const apps2: INavApp[] = [
	{
		icon: IconBriefcase,
		name: 'Projects',
		link: '/projects',
	},
	{
		icon: IconUsers,
		name: 'Teams',
		link: '/teams',
	},
	{
		icon: IconBuilding,
		name: 'Businesses',
		link: '/businesses',
	},
];

export const apps3: INavApp[] = [
	{
		icon: IconChartLine,
		name: 'Analytics',
		link: '/analytics',
	},
	{
		icon: IconWallet,
		name: 'Earnings',
		link: '/earnings',
	},
	{
		icon: IconSettings,
		name: 'Settings',
		link: '/settings',
	},
];

export const apps = [apps1, apps2, apps3];
```

### File: apps\web\contracts\public\IExploreCategories.ts

```ts
// packages/lib/search/explore/explore-categories.ts
// Explore-specific categories, subcategories, and sort options.

export type ExploreCategory = 'work' | 'resources' | 'projects';

export type ExploreSubcategory =
	| 'services'
	| 'freelancers'
	| 'teams'
	| 'templates'
	| 'products'
	| 'articles'
	| 'courses'
	| 'projects';

export type IExploreRequestSortBy =
	| 'recommended'
	| 'newest'
	| 'oldest'
	| 'mostPopular'
	| 'highestRated'
	| 'lowestRated'
	| 'priceLowToHigh'
	| 'priceHighToLow';

// Compile-time mapping from subcategory → category.
// This is purely a type-level mapping, no runtime code.
export type ExploreCategoryForSubcategory<S extends ExploreSubcategory> = S extends
	| 'services'
	| 'freelancers'
	| 'teams' ? 'work'
	: S extends 'projects' ? 'projects'
	: 'resources';
```

### File: apps\web\contracts\public\IExploreFacets.ts

```ts
// packages/lib/search/explore/explore-facets.ts
// Facet / aggregation models that you use to build filters from result sets.

export interface NumericFacet {
	min: number | null;
	max: number | null;
	avg?: number | null;
}

export interface TermFacetBucket {
	value: string;
	count: number;
}

export type TermFacet = TermFacetBucket[];

// Generic facets bag. You can extend this per endpoint if needed via generics.
export interface ExploreFacets {
	// money
	price?: NumericFacet;
	hourlyRate?: NumericFacet;
	budget?: NumericFacet;

	// common categorical facets
	languages?: TermFacet;
	skills?: TermFacet;
	countries?: TermFacet;
	timezones?: TermFacet;
	topics?: TermFacet;
	serviceCategories?: TermFacet;
	productTypes?: TermFacet;
	licenseTypes?: TermFacet;

	// allow extension without changing this file
	[key: string]: NumericFacet | TermFacet | undefined;
}

// Generic response wrapper for any explore endpoint.
export interface ExploreResponse<
	TItem,
	TFacets extends ExploreFacets = ExploreFacets,
> {
	items: TItem[];
	page: number;
	pageSize: number;
	total: number;
	facets: Partial<TFacets>;
}
```

### File: apps\web\contracts\public\IExploreFilters.ts

```ts
// packages/lib/search/explore/explore-filters.ts
// Explore-specific filter models (no request/response shapes here).

// ---- Filter atoms ----

export interface PriceRangeFilter {
	minPriceCents?: number;
	maxPriceCents?: number;
	currency?: string; // 'GBP', 'USD', etc.
}

export interface HourlyRateFilter {
	minHourlyRateCents?: number;
	maxHourlyRateCents?: number;
	currency?: string;
}

export interface RatingFilter {
	minRating?: number; // 1–5
	maxRating?: number; // rarely used but available
}

export interface LocationFilter {
	countries?: string[]; // ISO codes or canonical names
	timezones?: string[]; // 'Europe/London', etc.
	remoteOnly?: boolean;
}

export interface LanguageFilter {
	languages?: string[]; // matches your text[] language fields
}

export interface SkillsFilter {
	skills?: string[]; // skill slugs/ids
	minSkillScore?: number; // optional if you ever store skill proficiency
}

export interface AvailabilityFilter {
	availability?:
		| 'immediate'
		| 'thisWeek'
		| 'nextWeek'
		| 'scheduled';
}

export interface MetaFilter {
	minCompletedProjects?: number;
	minSales?: number;
}

export interface BudgetRangeFilter {
	minBudgetCents?: number;
	maxBudgetCents?: number;
	currency?: string;
}

// ---- Work (services / freelancers / teams) ----

export interface WorkBaseFilters
	extends
		PriceRangeFilter,
		RatingFilter,
		LocationFilter,
		LanguageFilter,
		SkillsFilter,
		AvailabilityFilter,
		MetaFilter {
	topics?: string[]; // 'design', 'marketing', etc.
}

export interface ServicesFilters extends WorkBaseFilters {
	serviceCategoryIds?: string[]; // taxonomy table / search topics
	durationMinutesMax?: number; // for calls / sessions
}

export interface FreelancerFilters extends WorkBaseFilters {
	minHourlyRateCents?: number;
	maxHourlyRateCents?: number;
	minPortfolioItems?: number;
}

export interface TeamFilters extends WorkBaseFilters {
	minTeamSize?: number;
	maxTeamSize?: number;
	requireMultipleRoles?: boolean;
}

// ---- Resources (templates / products / articles / courses) ----

export interface ResourceBaseFilters extends PriceRangeFilter, RatingFilter, LanguageFilter {
	topics?: string[];
	formats?: string[]; // 'figma', 'pdf', 'notion', 'video', etc.
}

export interface TemplatesFilters extends ResourceBaseFilters {
	templateType?: string[]; // 'landing-page', 'saas-ui', ...
	requiresCode?: boolean;
}

export interface ProductsFilters extends ResourceBaseFilters {
	productType?: string[]; // 'theme', 'component-library', etc.
	licenseType?: string[]; // 'full_rights', 'template_only', ...
	digitalOnly?: boolean;
}

export interface ArticlesFilters extends ResourceBaseFilters {
	readTimeMinutesMax?: number;
	publishedAfter?: string; // ISO date
	publishedBefore?: string; // ISO date
}

export interface CoursesFilters extends ResourceBaseFilters {
	level?: ('beginner' | 'intermediate' | 'advanced')[];
	minLessons?: number;
	maxLessons?: number;
}

// ---- Projects ----

export type ProjectStatus = 'draft' | 'active' | 'on_hold';

export interface ProjectsFilters extends BudgetRangeFilter, LocationFilter, LanguageFilter {
	status?: ProjectStatus[];
	stageTypes?: string[]; // filter by presence of certain stage types
}
```

### File: apps\web\contracts\public\IExploreRequest.ts

```ts
import {
	ExploreCategoryForSubcategory,
	ExploreSubcategory,
	IExploreRequestSortBy,
} from './IExploreCategories.ts';
import {
	ArticlesFilters,
	CoursesFilters,
	FreelancerFilters,
	ProductsFilters,
	ProjectsFilters,
	ServicesFilters,
	TeamFilters,
	TemplatesFilters,
} from './IExploreFilters.ts';
import { ISearchRequestWithSortAndFilter } from './ISearchRequest.ts';

// Text/semantic query shape, extendable later.
export interface ExploreQuery {
	term?: string;
}

// Mapping from subcategory → filters interface.
export interface ExploreFiltersBySubcategory {
	services: ServicesFilters;
	freelancers: FreelancerFilters;
	teams: TeamFilters;
	templates: TemplatesFilters;
	products: ProductsFilters;
	articles: ArticlesFilters;
	courses: CoursesFilters;
	projects: ProjectsFilters;
}

export type ExploreFilters<S extends ExploreSubcategory> = ExploreFiltersBySubcategory[S];

export type ExploreRequestFor<S extends ExploreSubcategory> =
	& ISearchRequestWithSortAndFilter<
		ExploreQuery,
		ExploreFilters<S>,
		IExploreRequestSortBy
	>
	& {
		category: ExploreCategoryForSubcategory<S>;
		subcategory: S;
	};

// Union type for handlers that accept any explore subcategory.
export type ExploreRequest =
	| ExploreRequestFor<'services'>
	| ExploreRequestFor<'freelancers'>
	| ExploreRequestFor<'teams'>
	| ExploreRequestFor<'templates'>
	| ExploreRequestFor<'products'>
	| ExploreRequestFor<'articles'>
	| ExploreRequestFor<'courses'>
	| ExploreRequestFor<'projects'>;

// Optional convenience helper to infer subcategory from a request.
export type InferExploreSubcategory<T extends ExploreRequest> = T['subcategory'];

// Optional convenience helper to get filters type from a subcategory.
export type InferExploreFilters<T extends ExploreRequest> = T extends
	ExploreRequestFor<infer S extends ExploreSubcategory> ? ExploreFilters<S>
	: never;
```

### File: apps\web\contracts\public\IExploreResponse.ts

```ts
import { ExploreSubcategory } from './IExploreCategories.ts';
import { ProjectStatus } from './IExploreFilters.ts';

export interface ExploreUploader {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	profileSlug?: string;
}

// ---- Common item base ----

export interface ExploreItemBase {
	id: string;
	slug?: string;
	subcategory: ExploreSubcategory;
	name: string; // item name/title
	imageUrl: string | null;
	uploader: ExploreUploader;
}

// ---- Meta building blocks ----

export interface RatingMeta {
	rating: number | null; // 0–5 , null if no ratings yet
	ratingCount: number;
}

export interface PriceMeta extends RatingMeta {
	priceCents: number;
	currency: string; // 'GBP', 'USD', etc.
	originalPriceCents?: number; // for discounts
	isDiscounted?: boolean;
}

export interface TemplateMeta extends RatingMeta {
	description: string;
}

export interface ArticleMeta extends RatingMeta {
	estimatedReadTimeMinutes: number;
}

export interface ProjectMeta {
	durationDays: number;
	status: ProjectStatus;
}

export interface FreelancerTeamMeta extends RatingMeta {
	serviceCount: number;
	productCount: number;
	headline: string;
}

// ---- Items per subcategory ----

// Services: rating, number of ratings, price
export interface ServiceExploreItem extends ExploreItemBase {
	subcategory: 'services';
	meta: PriceMeta;
}

// Products: rating, number of ratings, price
export interface ProductExploreItem extends ExploreItemBase {
	subcategory: 'products';
	meta: PriceMeta;
}

// Courses: rating, number of ratings, price
export interface CourseExploreItem extends ExploreItemBase {
	subcategory: 'courses';
	meta: PriceMeta;
}

// Templates: rating, number of ratings, description
export interface TemplateExploreItem extends ExploreItemBase {
	subcategory: 'templates';
	meta: TemplateMeta;
}

// Articles: rating, number of ratings, estimated read time
export interface ArticleExploreItem extends ExploreItemBase {
	subcategory: 'articles';
	meta: ArticleMeta;
}

// Projects: duration and status
export interface ProjectExploreItem extends ExploreItemBase {
	subcategory: 'projects';
	meta: ProjectMeta;
}

// Freelancers: rating, number of ratings, number of services, number of products, headline
export interface FreelancerExploreItem extends ExploreItemBase {
	subcategory: 'freelancers';
	meta: FreelancerTeamMeta;
}

// Teams: rating, number of ratings, number of services, number of products, headline
export interface TeamExploreItem extends ExploreItemBase {
	subcategory: 'teams';
	meta: FreelancerTeamMeta;
}

// Union of all possible explore items
export type ExploreItem =
	| ServiceExploreItem
	| ProductExploreItem
	| CourseExploreItem
	| TemplateExploreItem
	| ArticleExploreItem
	| ProjectExploreItem
	| FreelancerExploreItem
	| TeamExploreItem;
```

### File: apps\web\contracts\public\ISearchRequest.ts

```ts
export interface ISearchRequest<Q> {
	query: Q;
	page: number;
	pageSize: number;
}

export type SortOrder = 'asc' | 'desc';

export interface ISearchRequestWithSort<Q, S> extends ISearchRequest<Q> {
	sortBy: S;
	sortOrder: SortOrder;
}

export interface ISearchRequestWithFilter<Q, F> extends ISearchRequest<Q> {
	filters: F;
}

export interface ISearchRequestWithSortAndFilter<Q, F, S>
	extends ISearchRequestWithSort<Q, S>, ISearchRequestWithFilter<Q, F> {}

export type IFilterTypes = 'string' | 'number' | 'boolean' | 'date' | 'range' | 'array';

export interface ISearchRequestFilterDefinition<T> {
	type: IFilterTypes;
	values?: T[];
	min?: number;
	max?: number;
}
```

### File: apps\web\contracts\public\ISearchResponse.ts

```ts
export interface ISearchResponse<T> {
	results: T[];
	totalCount: number;
	page: number;
	pageSize: number;
}
```

### File: apps\web\deno.json

```json
{
	"tasks": {
		"check": "deno fmt --check && deno lint && deno check main.ts",
		"dev": "vite --port 3000 --open --host --mode development",
		"build": "vite build --mode production",
		"start": "deno serve -A --watch --port 3000 --env-file=../../.env main.ts",
		"update": "deno run -A -r jsr:@fresh/update ."
	},
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "preact"
	}
}
```

### File: apps\web\hooks\fields\useSelectState.ts

```ts
import { useComputed, useSignal } from '@preact/signals';
import { useCallback } from 'preact/hooks';
import { SelectOption } from '../../types/fields/select.ts';

interface UseSelectStateProps {
	options: SelectOption[];
	value?: string | string[] | number | number[];
	// deno-lint-ignore no-explicit-any
	onChange?: (val: any) => void;
	multiple?: boolean;
	disabled?: boolean;
}

export function useSelectState({
	options,
	value,
	onChange,
	multiple,
	disabled,
}: UseSelectStateProps) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

	const filteredOptions = useComputed(() =>
		options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
	);

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			setSearchQuery('');
			highlightedIndex.value = -1;
		}
	};

	const setSearchQuery = (q: string) => {
		searchQuery.value = q;
		if (isOpen.value) highlightedIndex.value = 0;
	};

	const selectOption = useCallback((option: SelectOption) => {
		if (option.disabled) return;

		let newValue;
		if (multiple) {
			const exists = selectedValues.includes(option.value);
			if (exists) {
				newValue = selectedValues.filter((v) => v !== option.value);
			} else {
				newValue = [...selectedValues, option.value];
			}
			setSearchQuery('');
		} else {
			newValue = option.value;
			toggleOpen(false);
		}

		onChange?.(newValue);
	}, [multiple, selectedValues, onChange]);

	const removeValue = (val: string | number) => {
		if (!multiple) {
			onChange?.(null);
			return;
		}
		onChange?.(selectedValues.filter((v) => v !== val));
	};

	// --- FIX: Exclude disabled items from "Select All" ---
	const toggleSelectAll = () => {
		if (!multiple) return;

		// 1. Get only the enabled options currently visible
		const enabledOptions = filteredOptions.value.filter((o) => !o.disabled);
		const enabledValues = enabledOptions.map((o) => o.value);

		// 2. Check if all *enabled* options are currently selected
		const areAllSelected = enabledValues.every((v) => selectedValues.includes(v));

		if (areAllSelected) {
			// Deselect: Remove only the visible enabled values
			const remaining = selectedValues.filter((v) => !enabledValues.includes(v));
			onChange?.(remaining);
		} else {
			// Select: Add missing enabled values
			const uniqueValues = Array.from(new Set([...selectedValues, ...enabledValues]));
			onChange?.(uniqueValues);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;

		if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			toggleOpen(true);
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex.value = highlightedIndex.value < filteredOptions.value.length - 1
					? highlightedIndex.value + 1
					: highlightedIndex.value;
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : 0;
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value && highlightedIndex.value >= 0) {
					selectOption(filteredOptions.value[highlightedIndex.value]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.length > 0) {
					removeValue(selectedValues[selectedValues.length - 1]);
				}
				break;
			case 'Tab':
				if (isOpen.value) toggleOpen(false);
				break;
		}
	};

	return {
		isOpen,
		highlightedIndex,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	};
}
```

### File: apps\web\hooks\fields\useSliderState.ts

```ts
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import {
	clamp,
	percentToValue,
	percentToValueLog,
	roundToStep,
	snapToClosest,
	valueToPercent,
	valueToPercentLog,
} from '@shared/math';
import { SliderMark } from '../../types/fields/slider.ts';

interface UseSliderStateProps {
	value?: number | number[];
	onChange?: (val: number | number[]) => void;
	min: number;
	max: number;
	step: number;
	range?: boolean;
	disabled?: boolean;
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
}

export function useSliderState({
	value,
	onChange,
	min,
	max,
	step,
	range,
	disabled,
	marks,
	snapToMarks,
	vertical,
	scale = 'linear',
	minDistance = 0,
}: UseSliderStateProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const activeHandleIdx = useSignal<number | null>(null);
	const internalValues = useSignal<number[]>([]);

	const isLog = scale === 'logarithmic';

	// Sync Props -> Internal State
	useEffect(() => {
		if (activeHandleIdx.value !== null) return;
		if (range) {
			if (Array.isArray(value)) internalValues.value = value;
			else internalValues.value = [min, max];
		} else {
			if (typeof value === 'number') internalValues.value = [value];
			else internalValues.value = [min];
		}
	}, [value, range, min, max, activeHandleIdx.value]);

	const snapPoints = useComputed(() => {
		if (!snapToMarks || !marks) return null;
		if (Array.isArray(marks)) {
			return marks.map((m) => (typeof m === 'number' ? m : m.value));
		}
		return null;
	});

	// --- Calc Value (Math Aware) ---
	const calcValueFromPointer = (e: { clientX: number; clientY: number }) => {
		if (!trackRef.current) return min;
		const rect = trackRef.current.getBoundingClientRect();

		let percent = 0;
		if (vertical) {
			percent = ((rect.bottom - e.clientY) / rect.height) * 100;
		} else {
			percent = ((e.clientX - rect.left) / rect.width) * 100;
		}

		// Apply Scale Logic
		const rawValue = isLog
			? percentToValueLog(percent, min, max)
			: percentToValue(percent, min, max);

		if (snapToMarks && snapPoints.value) {
			return snapToClosest(rawValue, snapPoints.value);
		}
		return roundToStep(rawValue, step);
	};

	const handlePointerDown = (index: number, e: PointerEvent) => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();

		const target = e.target as HTMLElement;
		target.setPointerCapture(e.pointerId);
		activeHandleIdx.value = index;
		target.focus();
	};

	const handleTrackClick = (e: PointerEvent) => {
		if (disabled || activeHandleIdx.value !== null) return;

		const val = calcValueFromPointer(e);
		const current = internalValues.value;

		let closestIdx = 0;
		let minDiff = Infinity;

		current.forEach((v, i) => {
			const diff = Math.abs(v - val);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		});

		updateValue(closestIdx, val);
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (activeHandleIdx.value === null || disabled) return;
		const newVal = calcValueFromPointer(e);
		updateValue(activeHandleIdx.value, newVal);
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (activeHandleIdx.value !== null) {
			const target = e.target as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			activeHandleIdx.value = null;
		}
	};

	// --- Physics: Update & Collision ---
	const updateValue = (index: number, rawNewValue: number) => {
		const current = [...internalValues.value];
		let newValue = clamp(rawNewValue, min, max);

		// Collision Logic (N-Handles)
		// If minDistance is set, handles push each other or block
		// We check index-1 and index+1

		const dist = minDistance;

		// 1. Check Previous Neighbor
		if (index > 0) {
			const prevVal = current[index - 1];
			if (newValue < prevVal + dist) {
				newValue = prevVal + dist;
			}
		}

		// 2. Check Next Neighbor
		if (index < current.length - 1) {
			const nextVal = current[index + 1];
			if (newValue > nextVal - dist) {
				newValue = nextVal - dist;
			}
		}

		// Safety clamp again just in case distance pushed it out of bounds
		newValue = clamp(newValue, min, max);

		if (current[index] !== newValue) {
			current[index] = newValue;
			internalValues.value = current;
			if (range) onChange?.(current);
			else onChange?.(current[0]);
		}
	};

	// --- Visuals (Math Aware) ---
	const handleStyles = useComputed(() => {
		return internalValues.value.map((v) => {
			const pct = isLog ? valueToPercentLog(v, min, max) : valueToPercent(v, min, max);

			return vertical ? { bottom: `${pct}%`, left: '50%' } : { left: `${pct}%`, top: '50%' };
		});
	});

	const trackFillStyle = useComputed(() => {
		// Fill logic:
		// If 1 handle: 0 to Handle
		// If 2 handles: Handle[0] to Handle[1]
		// If N > 2 handles: Handle[0] to Handle[N] (Fill entire range covered)

		const count = internalValues.value.length;
		if (count === 0) return {};

		const firstVal = internalValues.value[0];
		const lastVal = internalValues.value[count - 1];

		const startPct = range
			? (isLog ? valueToPercentLog(firstVal, min, max) : valueToPercent(firstVal, min, max))
			: 0;

		const endPct = isLog ? valueToPercentLog(lastVal, min, max) : valueToPercent(lastVal, min, max);

		const size = Math.abs(endPct - startPct);
		const startPos = Math.min(startPct, endPct);

		return vertical
			? { bottom: `${startPos}%`, height: `${size}%`, left: 0, width: '100%' }
			: { left: `${startPos}%`, width: `${size}%`, top: 0, height: '100%' };
	});

	return {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
		// (Keyboard logic needs similar update for isLog, but skipped for brevity as previous implementation relied on 'step' which is linear.
		// Ideally for log, keyboard steps should be % based or multiplier based.)
	};
}
```

### File: apps\web\hooks\fields\useTextMask.ts

```ts
import { useLayoutEffect, useRef } from 'preact/hooks';

interface UseTextMaskProps {
	mask?: string;
	value: string;
	onChange?: (val: string) => void;
	ref: any; // HTMLInputElement ref
}

// Mask Definitions
// 9: Numeric (0-9)
// a: Alphabet (a-z, A-Z)
// *: Alphanumeric (0-9, a-z, A-Z)
const DIGIT = /[0-9]/;
const ALPHA = /[a-zA-Z]/;
const ALPHANUM = /[0-9a-zA-Z]/;

export function useTextMask({ mask, value, onChange, ref }: UseTextMaskProps) {
	// We track the cursor position manually to restore it after formatting
	const cursorRef = useRef<number | null>(null);

	// 1. Core Formatting Logic
	const formatValue = (rawValue: string) => {
		if (!mask) return rawValue;

		let formatted = '';
		let rawIndex = 0;
		let maskIndex = 0;

		while (maskIndex < mask.length && rawIndex < rawValue.length) {
			const maskChar = mask[maskIndex];
			const valueChar = rawValue[rawIndex];

			// Defs
			if (maskChar === '9') {
				if (DIGIT.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					// Invalid char for this slot, skip raw char
					rawIndex++;
				}
			} else if (maskChar === 'a') {
				if (ALPHA.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					rawIndex++;
				}
			} else if (maskChar === '*') {
				if (ALPHANUM.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					rawIndex++;
				}
			} else {
				// Fixed char (separator like / - ( ))
				formatted += maskChar;
				maskIndex++;
				// If user typed the separator explicitly, consume it
				if (valueChar === maskChar) {
					rawIndex++;
				}
			}
		}

		return formatted;
	};

	// 2. Input Handler interceptor
	const handleMaskInput = (e: Event) => {
		if (!mask || !onChange) return;

		const target = e.target as HTMLInputElement;
		const prevValue = value || '';
		let newValue = target.value;

		// Detect deletion (Backspacing)
		// If user backspaces a separator, we might need to handle specific logic,
		// but usually simply re-running formatValue on the stripped string works well enough
		// for standard HTML inputs.

		// Strip existing separators from input to get "raw" chars relative to mask
		// This is a naive strip; for complex masks we might need a more robust unmasker.
		// For now, we rely on the loop in formatValue to pick valid chars.

		const nextFormatted = formatValue(newValue);

		// Capture cursor before React/Preact re-renders
		const selectionStart = target.selectionStart || 0;

		// Heuristic: If we added characters (separators), bump cursor
		// If we removed, keep it.
		// This is the "Hard Part" of masking.
		// A simple approach:
		// Calculate how many "valid data" characters are before the cursor in the NEW value
		// and map that to the formatted string.

		cursorRef.current = selectionStart;

		// Optimization: Only update if changed
		if (nextFormatted !== prevValue) {
			onChange(nextFormatted);
		} else {
			// If formatting stripped the char (invalid input), force update ref to revert view
			target.value = prevValue;
			// Restore cursor
			target.setSelectionRange(selectionStart - 1, selectionStart - 1);
		}
	};

	// 3. Restore Cursor Effect
	useLayoutEffect(() => {
		if (mask && ref.current && cursorRef.current !== null) {
			const input = ref.current;
			// This simple restore works for end-of-typing.
			// For middle-of-string editing, you need more math (counting non-mask chars).
			// We'll stick to basic native behavior restoration for now.

			// If the value length grew by more than 1 char (separator added),
			// check if we need to jump the cursor forward.
			// (Simplified for this snippet)

			input.setSelectionRange(cursorRef.current, cursorRef.current);
			cursorRef.current = null;
		}
	}, [value, mask]);

	return {
		handleMaskInput,
		// expose formatter if needed externally
		formatValue,
	};
}
```

### File: apps\web\islands\NavBar.tsx

```tsx
import '@styles/components/navigation/nav-bar.css';
import NavBarGuest from '@components/navigation/NavBarGuest.tsx';
import NavBarUser from '@components/navigation/NavBarUser.tsx';
import NavBarUserSide from '@components/navigation/NavBarUserSide.tsx';

export default function NavBar(props: { isAuthenticated?: boolean }) {
	return (
		<>
			<header>
				<nav>
					{props.isAuthenticated ? <NavBarUser /> : <NavBarGuest />}
				</nav>
			</header>
			{props.isAuthenticated &&
				<NavBarUserSide />}
		</>
	);
}
```

### File: apps\web\islands\pages\auth\AuthLayout.tsx

```tsx
import '@styles/layouts/auth.css';
import { type ComponentChildren } from 'preact';

type AuthLayoutProps = {
	children: ComponentChildren;
};

export default function AuthLayout(props: AuthLayoutProps) {
	return (
		<div class='layout-auth'>
			<img
				src='https://images.unsplash.com/photo-1690791456616-8d7a5cb8925d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
				alt='background'
				class='background'
			/>

			<div class='layout-auth__modal'>
				<div class='layout-auth__modal__window'>
					<img
						src='https://images.unsplash.com/photo-1690791456616-8d7a5cb8925d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
						alt='background'
						class='backgrounds'
					/>
					<div class='layout-auth__modal__window__content'>
						<div class='layout-auth__modal__window__content__quote'>
							<p>Everything you can imagine is real</p>
							<div class='layout-auth__modal__window__content__quote__line-container'>
								<div class='layout-auth__modal__window__content__quote__line'></div>
								<span>Pablo Picasso</span>
							</div>
						</div>

						<div class='layout-auth__modal__window__content__slogan'>
							<h1 class='build-together'>Build Together.</h1>
							<h1 class='deliver-better'>Deliver Better.</h1>
						</div>
					</div>
				</div>

				<div class='layout-auth__modal__content'>
					<h1>Welcome</h1>
					{props.children}
				</div>
			</div>
		</div>
	);
}
```

### File: apps\web\islands\pages\auth\Login.tsx

```tsx
import '@styles/pages/auth/login.css';
import TextField from '@components/fields/TextField.tsx';
import PasswordField from '@components/fields/PasswordField.tsx';
import LoginButton from '@components/auth/LoginButton.tsx';
import GoogleLoginButton from '@components/auth/GoogleLoginButton.tsx';
import GitHubLoginButton from '@components/auth/GitHubRegisterButton.tsx';
import { signal } from '@preact/signals';

const email = signal<string | undefined>(undefined);
const password = signal<string | undefined>(undefined);

export default function LoginIsland() {
	return (
		<div class='login'>
			<div class='login__container'>
				<div class='login__container__center'>
					<div class='login__header'>
						<h1>Welcome Back</h1>
						<p>Dive back in, right where you left off</p>
					</div>

					<div class='login__fields__container'>
						<div class='login__fields'>
							<TextField
								id='email'
								placeholder='Email'
								autocomplete='email'
								type='email'
								aria-label='Email address'
								aria-required='true'
								aria-describedby='email-error'
								onInput={(e) => {
									email.value = e.currentTarget.value;
								}}
							/>
							<div>
								<PasswordField
									id='password'
									placeholder='Password'
									autocomplete='new-password'
									aria-label='Password'
									aria-required='true'
									aria-describedby='password-error'
									onInput={(e) => {
										password.value = e.currentTarget.value;
									}}
								/>
								<div class='login__fields__options'>
									<label for='remember-me' class='remember-me'>
										<input type='checkbox' id='remember-me' />
										<span>Remember Me</span>
									</label>
									<a href='/auth/forgot-password'>Forgot Password?</a>
								</div>
							</div>
						</div>

						<div class='login__actions'>
							<LoginButton
								email={email}
								password={password}
							/>
							<GoogleLoginButton />
							<GitHubLoginButton />
						</div>
					</div>
				</div>
			</div>
			<div class='switch-auth'>
				<p class='switch-auth__text'>Don't have an account?</p>
				<a class='switch-auth__link' href='/register'>Register</a>
			</div>
		</div>
	);
}
```

### File: apps\web\islands\pages\auth\Onboarding.tsx

```tsx
import '@styles/pages/auth/onboarding.css';
import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import OnboardingSubmit from '@components/auth/OnboardingSubmit.tsx';
import TextField from '@components/fields/TextField.tsx';

const firstName = signal('');
const lastName = signal('');
const username = signal('');
const type = signal<'freelancer' | 'client'>('client');

export default function OnboardingIsland() {
	useEffect(() => {
		const run = async () => {
			const response = await fetch('/api/v1/auth/user', {
				method: 'GET',
			});

			if (response.ok && response.status === 200) {
				const resp = await response.json();
				firstName.value = resp.firstName ?? '';
				lastName.value = resp.lastName ?? '';
				username.value = resp.username ?? '';
				console.log(resp);
			}
		};

		run();
	}, []);

	const onUserTypeChange = (e: InputEvent) => {
		type.value = (e.currentTarget as HTMLInputElement).value as ('freelancer' | 'client');
	};

	return (
		<div class='onboarding'>
			<div class='onboarding-stages'>
				<form class='onboarding-stage'>
					<div class='onboarding-stage__account-type__container'>
						<label
							for='onboarding-stage__account-type--client'
							class='onboarding-stage__account-type'
						>
							<input
								type='radio'
								name='onboarding-stage__account-type'
								id='onboarding-stage__account-type--client'
								value='client'
								hidden
								checked={type.value === 'client'}
								onInput={onUserTypeChange}
							/>
							Client
						</label>
						<label
							for='onboarding-stage__account-type--seller'
							class='onboarding-stage__account-type'
						>
							<input
								type='radio'
								name='onboarding-stage__account-type'
								id='onboarding-stage__account-type--seller'
								value='freelancer'
								hidden
								checked={type.value === 'freelancer'}
								onInput={onUserTypeChange}
							/>
							Seller
						</label>
					</div>

					<hr class='onboarding-stage__separator' />

					<div class='onboarding-stage__name'>
						<TextField value={firstName} placeholder='First Name' />
						<TextField value={lastName} placeholder='Last Name' />
					</div>

					<TextField value={username} placeholder='DoB' />
					<TextField value={username} placeholder='Username' />
				</form>
			</div>
			<div class='onboarding-stage-location'>
				<OnboardingSubmit
					firstName={firstName.value}
					lastName={lastName.value}
					username={username.value}
					type={type.value}
				/>
			</div>
		</div>
	);
}
```

### File: apps\web\islands\pages\auth\Register.tsx

```tsx
import '@styles/pages/auth/register.css';
import TextField from '@components/fields/TextField.tsx';
import PasswordField from '@components/fields/PasswordField.tsx';
import RegisterButton from '@components/auth/RegisterButton.tsx';
import GoogleRegisterButton from '@components/auth/GoogleRegisterButton.tsx';
import GitHubRegisterButton from '@components/auth/GitHubRegisterButton.tsx';
import { signal } from '@preact/signals';
import { AuthValidator, RegisterErrors } from '@shared';

const email = signal<string | undefined>(undefined);
const password = signal<string | undefined>(undefined);
const confirmPassword = signal<string | undefined>(undefined);

const emailError = signal<string | null>(null);
const passwordError = signal<string | null>(null);
const confirmPasswordError = signal<string | null>(null);

const errors = signal<RegisterErrors>({});

export default function RegisterIsland() {
	return (
		<div class='register'>
			<div class='register__container'>
				<div class='register__container__center'>
					<div class='register__header'>
						<h1>Create an account</h1>
						<p>Begin Your Journey Here</p>
					</div>

					<form class='register__fields__container'>
						<div class='register__fields'>
							<div class='register__field'>
								<TextField
									id='email'
									onFocus={() => {
										emailError.value = '';
									}}
									onBlur={() => {
										emailError.value = AuthValidator
											.validateEmail(email.value || '');
									}}
									placeholder='Email'
									autocomplete='email'
									type='email'
									aria-label='Email address'
									aria-required='true'
									aria-invalid={!!emailError.value}
									aria-describedby='email-error'
									onInput={(e) => {
										email.value = e.currentTarget.value;
									}}
								/>
								{emailError.value && (
									<p
										id='email-error'
										class='register__field-error'
										role='alert'
									>
										{emailError.value ||
											errors.value?.email}
									</p>
								)}
							</div>

							<div class='register__field'>
								<PasswordField
									id='password'
									onFocus={() => {
										passwordError.value = '';
										confirmPasswordError.value = '';
									}}
									onBlur={() => {
										passwordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
										confirmPasswordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
									}}
									placeholder='Password'
									autocomplete='new-password'
									aria-label='Password'
									aria-required='true'
									aria-invalid={!!passwordError.value}
									aria-describedby='password-error'
									onInput={(e) => {
										password.value = e.currentTarget.value;
									}}
								/>
								{passwordError.value && (
									<p
										id='password-error'
										class='register__field-error'
										role='alert'
									>
										{passwordError.value ||
											errors.value?.password}
									</p>
								)}
							</div>

							<div class='register__field'>
								<PasswordField
									id='confirmPassword'
									onFocus={() => {
										passwordError.value = '';
										confirmPasswordError.value = '';
									}}
									onBlur={() => {
										passwordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
										confirmPasswordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
									}}
									placeholder='Re-enter Password'
									autocomplete='new-password'
									aria-label='Confirm password'
									aria-required='true'
									aria-invalid={!!confirmPasswordError.value}
									aria-describedby='confirmPassword-error'
									onInput={(e) => {
										confirmPassword.value = e.currentTarget.value;
									}}
								/>
								{confirmPasswordError.value && (
									<p
										id='confirmPassword-error'
										class='register__field-error'
										role='alert'
									>
										{confirmPasswordError.value ||
											errors.value?.confirmPassword}
									</p>
								)}
							</div>
						</div>

						<div class='register__actions'>
							<RegisterButton
								email={email}
								password={password}
								confirmPassword={confirmPassword}
							/>
							<GoogleRegisterButton />
							<GitHubRegisterButton />
						</div>
					</form>
				</div>
			</div>

			<div class='switch-auth'>
				<p class='switch-auth__text'>Already have an account?</p>
				<a class='switch-auth__link' href='/login'>Log In</a>
			</div>
		</div>
	);
}
```

### File: apps\web\islands\pages\auth\Verify.tsx

```tsx
import { useEffect, useState } from 'preact/hooks';
import ResendButton from '@components/auth/ResendButton.tsx';

type Props = {
	email: string | undefined;
};

export default function VerifyIsland({ email }: Props) {
	const [status, setStatus] = useState<'parsing' | 'verifying' | 'awaiting' | 'done' | 'error'>(
		'parsing',
	);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(globalThis.location.hash.replace(/^#/, ''));
		const access_token = params.get('access_token');
		const refresh_token = params.get('refresh_token');

		if (access_token && refresh_token) {
			setStatus('verifying');
			fetch('/api/v1/auth/callback', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ access_token, refresh_token }),
			})
				.then(async (r) => {
					console.log('1 -----', r);
					if (!r.ok) throw new Error((await r.json()).error?.message ?? 'Failed to set session');
					console.log('2 -----', r);
					setStatus('done');
					globalThis.location.href = '/onboarding';
				})
				.catch((e) => {
					console.log('error ------', e.message);
					setErr(e.message);
					setStatus('error');
				});
		} else {
			setStatus('awaiting');
		}
	}, []);

	return (
		<main class='mx-auto max-w-md p-6'>
			<h1 class='text-2xl font-semibold mb-4'>Verify your email</h1>

			{status === 'parsing' && <p>Preparing…</p>}
			{status === 'verifying' && <p>Signing you in…</p>}
			{status === 'done' && <p>Redirecting…</p>}

			{status === 'awaiting' && (
				<section>
					<p class='mb-3'>We’ve sent a verification link to your email. Click it to continue.</p>
					<p>{email}</p>
					<ResendButton email={email} />
				</section>
			)}

			{status === 'error' && (
				<section class='text-red-600'>
					<p class='mb-2'>We couldn’t verify your session.</p>
					<p class='mb-4 text-sm'>{err}</p>
					<a class='underline' href='/verify'>Try again</a>
				</section>
			)}
		</main>
	);
}
```

### File: apps\web\islands\pages\home\hero.tsx

```tsx
import '@styles/pages/home/hero.css';
import SearchBar from '@components/search/SearchBar.tsx';
import { IconChevronRight } from '@tabler/icons-preact';

export default function HomeHeroIsland() {
	return (
		<section id='hero' class='home__hero'>
			<div class='home__hero__bg'>
				<img
					class='home__hero__bg__image'
					src='https://images.unsplash.com/photo-1535957998253-26ae1ef29506?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=736'
				/>
			</div>
			<div class='home__hero__content'>
				<h1 class='home__hero__content__title'>
					Build Together.<br />Deliver Better.
				</h1>

				<div class='home__hero__content__search'>
					<SearchBar />
				</div>

				<div class='home__hero__content__actions'>
					<a class='home__hero__content__actions__join' href='#s'>
						<span>Start Creating</span>
						<IconChevronRight />
					</a>
					<a class='home__hero__content__actions__explore' href='#s'>
						<span>Explore</span>
						<IconChevronRight />
					</a>
				</div>
			</div>
		</section>
	);
}
```

### File: apps\web\islands\pages\public\explore.tsx

```tsx
```

### File: apps\web\islands\pages\public\search.tsx

```tsx
import '@styles/pages/public/explore/search.css';
import SearchBar from '@components/public/explore/SearchBar.tsx';
import { signal } from '@preact/signals';
import { IconLayout2Filled, IconList } from '@tabler/icons-preact';
import ExploreFilters from '@components/public/explore/Filters.tsx';

const showFilters = signal(true);
const displayType = signal(true);

export default function SearchIsland({ query }: { query: string }) {
	return (
		<div class='search-page'>
			<section class='search-page__search'>
				<h1 class='search-page__search__title'>{query}</h1>
				<div class='search-page__search__related'>
					<span>Related:</span>
				</div>
				<SearchBar />
			</section>
			<section class='search-page__options'>
				<div class='search-page__options__top'>
					<div class='search-page__options__toggle-filter'>
						<label for='search-page__options__toggle-filter'>
							<input
								type='checkbox'
								name='search-page__options__toggle-filter--toggle'
								id='search-page__options__toggle-filter'
								onInput={() => showFilters.value = !showFilters.value}
								checked={showFilters.value}
								hidden
							/>
							Filters
						</label>
					</div>
					<div class='search-page__options__categories'>
						<label>
							<input type='radio' value='work' name='search-page__options__categories' hidden />
							Work
						</label>
						<label>
							<input
								type='radio'
								value='resources'
								name='search-page__options__categories'
								hidden
							/>
							Resources
						</label>
						<label>
							<input type='radio' value='projects' name='search-page__options__categories' hidden />
							Projects
						</label>
					</div>
					<div class='search-page__options__sort'>
						<button type='button'>Sort</button>
					</div>
				</div>

				<div class='search-page__options__bottom'>
					<div class='search-page__options__results-count'>
						<p>Showing 472 results for "{query}" category</p>
					</div>
					<div class='search-page__options__category-type'>
						<label>
							<input
								type='radio'
								value='resources-templates'
								name='search-page__options__category-type'
								hidden
							/>
							Templates
						</label>
						<label>
							<input
								type='radio'
								value='resources-products'
								name='search-page__options__category-type'
								hidden
							/>
							Products
						</label>
						<label>
							<input
								type='radio'
								value='resources-articles'
								name='search-page__options__category-type'
								hidden
							/>
							Articles
						</label>
						<label>
							<input
								type='radio'
								value='resources-courses'
								name='search-page__options__category-type'
								hidden
							/>
							Courses
						</label>
					</div>
					<div class='search-page__options__layout'>
						<label for='search-page__options__layout--layout-list'>
							<input
								type='radio'
								value='layout-list'
								name='search-page__options__layout'
								id='search-page__options__layout--layout-list'
								hidden
								checked={!displayType.value}
								onInput={() => displayType.value = false}
							/>
							<IconList />
						</label>
						<label for='search-page__options__layout--layout-grid'>
							<input
								type='radio'
								value='layout-grid'
								name='search-page__options__layout'
								id='search-page__options__layout--layout-grid'
								hidden
								checked={displayType.value}
								onInput={() => displayType.value = true}
							/>
							<IconLayout2Filled />
						</label>
					</div>
				</div>
			</section>
			<div class='search-page__results'>
				{showFilters.value &&
					(
						<aside class='search-page__results__filters__container'>
						</aside>
					)}
				<div class='search-page__results__content'>
					<ExploreFilters />
				</div>
			</div>
		</div>
	);
}
```

### File: apps\web\main.ts

```ts
import { App, staticFiles } from 'fresh';
import { State } from './utils.ts';

const app = new App<State>();

app.use(staticFiles());
app.fsRoutes();

export { app };
```

### File: apps\web\routes\(auth)\forgot-password.tsx

```tsx
```

### File: apps\web\routes\(auth)\login.tsx

```tsx
import { Head } from 'fresh/runtime';
import LoginIsland from '@islands/pages/auth/Login.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Login</title>
			</Head>

			<LoginIsland />
		</>
	);
}
```

### File: apps\web\routes\(auth)\onboarding\index.tsx

```tsx
import { Head } from 'fresh/runtime';
import OnboardingIsland from '@islands/pages/auth/Onboarding.tsx';

export default function Onboarding() {
	return (
		<>
			<Head>
				<title>Onboarding</title>
			</Head>

			<OnboardingIsland />
		</>
	);
}
```

### File: apps\web\routes\(auth)\register.tsx

```tsx
import { Head } from 'fresh/runtime';
import RegisterIsland from '@islands/pages/auth/Register.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Sign Up</title>
			</Head>

			<RegisterIsland />
		</>
	);
}
```

### File: apps\web\routes\(auth)\reset\[token].tsx

```tsx
```

### File: apps\web\routes\(auth)\verify\index.tsx

```tsx
import { Head } from 'fresh/runtime';
import VerifyIsland from '@islands/pages/auth/Verify.tsx';
import { State } from '@utils';
import { getCookies } from '@std/http/cookie';
import { RenderableProps } from 'preact';
import { PageProps } from 'fresh';

// deno-lint-ignore no-explicit-any
export default function Verify(ctx: RenderableProps<PageProps<never, State>, any>) {
	const cookies = getCookies(ctx.req.headers);
	const email = cookies['verify_email'] ? decodeURIComponent(cookies['verify_email']) : undefined;

	return (
		<>
			<Head>
				<title>Verify</title>
			</Head>

			<VerifyIsland email={email} />
		</>
	);
}
```

### File: apps\web\routes\(auth)\_layout.tsx

```tsx
import { define } from '@utils';
import AuthLayout from '@islands/pages/auth/authLayout.tsx';

export default define.layout(function App(props) {
	const { Component } = props;

	return (
		<AuthLayout>
			<Component />
		</AuthLayout>
	);
});
```

### File: apps\web\routes\(auth)\_middleware.ts

```ts
import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	if (ctx.state.isOnboarded) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/dashboard',
			},
		});
	}

	if (ctx.state.isAuthenticated) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/onboarding',
			},
		});
	}

	const res = await ctx.next();
	return res;
});
```

### File: apps\web\routes\(dashboard)\dashboard\index.tsx

```tsx
export default function Dashboard() {
	return <div></div>;
}
```

### File: apps\web\routes\(dashboard)\earnings\index.tsx

```tsx
export default function Earnings() {
	return <div></div>;
}
```

### File: apps\web\routes\(dashboard)\messages\index.tsx

```tsx
export default function Messages() {
	return <div></div>;
}
```

### File: apps\web\routes\(dashboard)\projects\index.tsx

```tsx
export default function Projects() {
	return <div></div>;
}
```

### File: apps\web\routes\(dashboard)\settings\index.tsx

```tsx
export default function Settings() {
	return <div></div>;
}
```

### File: apps\web\routes\(dashboard)\teams\index.tsx

```tsx
export default function Teams() {
	return <div></div>;
}
```

### File: apps\web\routes\(dashboard)\_layout.tsx

```tsx
import { define } from '@utils';
import NavBar from '@islands/NavBar.tsx';

export default define.layout(function App({ Component, state }) {
	return (
		<>
			<NavBar isAuthenticated={state.isOnboarded} />

			<div class='container'>
				<Component />
			</div>
		</>
	);
});
```

### File: apps\web\routes\(dashboard)\_middleware.ts

```ts
import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	if (!ctx.state.isAuthenticated) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login',
			},
		});
	}

	if (!ctx.state.isOnboarded) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/onboarding',
			},
		});
	}

	const res = await ctx.next();
	return res;
});
```

### File: apps\web\routes\(public)\(index)\index.tsx

```tsx
import '@styles/pages/home/home.css';
import HomeHeroIsland from '@islands/pages/home/hero.tsx';

export default function Home() {
	return (
		<div class='home'>
			<HomeHeroIsland />
		</div>
	);
}
```

### File: apps\web\routes\(public)\about.tsx

```tsx
```

### File: apps\web\routes\(public)\explore\index.tsx

```tsx
export default function Explore() {
	return <div></div>;
}
```

### File: apps\web\routes\(public)\explore\search\[query].tsx

```tsx
import { RenderableProps } from 'preact/src/index.d.ts';
import { PageProps } from 'https://jsr.io/@fresh/core/2.2.0/src/render.ts';
import { State } from '@utils';
import SearchIsland from '@islands/pages/public/search.tsx';

export default function Search(ctx: RenderableProps<PageProps<never, State>, any>) {
	ctx.params.query;
	console.log(ctx.params.query);

	return (
		<div class='search-page__container'>
			<SearchIsland query={ctx.params.query} />
		</div>
	);
}
```

### File: apps\web\routes\(public)\explore\[...path].tsx

```tsx
export default function ExploreItem() {
	return <div></div>;
}
```

### File: apps\web\routes\(public)\help\index.tsx

```tsx
```

### File: apps\web\routes\(public)\help\[...path].tsx

```tsx
```

### File: apps\web\routes\(public)\privacy.tsx

```tsx
```

### File: apps\web\routes\(public)\terms.tsx

```tsx
```

### File: apps\web\routes\(public)\[user]\index.tsx

```tsx
```

### File: apps\web\routes\(public)\_layout.tsx

```tsx
import { define } from '@utils';
import NavBar from '@islands/NavBar.tsx';

export default define.layout(function App({ Component, state }) {
	return (
		<>
			<NavBar isAuthenticated={state.isOnboarded} />

			<div class='container'>
				<Component />
			</div>
		</>
	);
});
```

### File: apps\web\routes\api\test\test.ts

```ts
import { define } from '@utils';
import { setCookie } from '@std/http/cookie';

export const handler = define.handlers({
	async GET(ctx) {
		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
		setCookie(headers, {
			name: 'verify_email',
			value: 'email@email.com',
			path: '/verify',
			maxAge: 10000,
			httpOnly: true,
			sameSite: 'Lax',
			secure: true,
		});

		return new Response(null, {
			headers,
		});
	},
});
```

### File: apps\web\routes\api\v1\auth\callback.ts

```ts
import { define } from '@utils';
import { setAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		const reqUrl = new URL(ctx.req.url);
		const { access_token, refresh_token } = await ctx.req.json();
		if (!access_token || !refresh_token) {
			return new Response(
				JSON.stringify({ error: { code: 'bad_request', message: 'Missing tokens' } }),
				{
					status: 400,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				},
			);
		}

		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
		setAuthCookies(headers, {
			accessToken: access_token,
			refreshToken: refresh_token,
			requestUrl: reqUrl,
		});
		return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
	},
});
```

### File: apps\web\routes\api\v1\auth\email\login.ts

```ts
import { define } from '@utils';
import { loginWithEmail } from '@server/auth/email/login.ts';
import { setCookie } from '@std/http/cookie';
import { setAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await loginWithEmail(body);

		const reqUrl = new URL(ctx.req.url);
		const verifyUrl = new URL('/verify', reqUrl).href;

		// IMPORTANT: keep a single Headers instance and append cookies to it.
		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });

		if (!res.ok) {
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 401);
			return new Response(JSON.stringify({ error: res.error }), { status, headers });
		}

		// If the user isn’t verified, set a short-lived helper cookie and tell the client to go to /verify.
		const user = res.data.user;
		const unverified = user && !(user.email_confirmed_at ?? user.confirmed_at);

		if (unverified) {
			const email = user.email ?? (typeof body?.email === 'string' ? body.email : '');
			if (email) {
				setCookie(headers, {
					name: 'verify_email',
					value: encodeURIComponent(email),
					httpOnly: true,
					sameSite: 'Lax',
					secure: reqUrl.protocol === 'https:',
					path: '/verify',
					maxAge: 10 * 60,
				});
			}
			// Don’t replace headers—reuse the same instance so previously appended Set-Cookie aren’t lost.
			return new Response(JSON.stringify({ ok: true, redirectTo: verifyUrl }), {
				status: 200,
				headers,
			});
		}

		// If we have a session, persist tokens via cookies (append both, plus CSRF).
		if (res.data.session) {
			const { access_token, refresh_token } = res.data.session;
			if (!access_token || !refresh_token) {
				return new Response(
					JSON.stringify({ error: { code: 'bad_request', message: 'Missing tokens' } }),
					{
						status: 400,
						headers,
					},
				);
			}
			// Derive secure + naming from the request URL/host inside the helper.
			setAuthCookies(headers, {
				accessToken: access_token,
				refreshToken: refresh_token,
				requestUrl: reqUrl,
			});
		}

		return new Response(JSON.stringify({ ok: true, redirectTo: '/' }), {
			status: 200,
			headers,
		});
	},
});
```

### File: apps\web\routes\api\v1\auth\email\register.ts

```ts
import { define } from '@utils';
import { registerWithEmail } from '@server/auth/email/register.ts';
import { setCookie } from '@std/http/cookie';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await registerWithEmail(body, {}, {});
		const reqUrl = new URL(ctx.req.url);
		const verifyUrl = new URL('/verify', reqUrl).href;

		if (!res.ok) {
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 500);
			return new Response(JSON.stringify({ error: res.error }), {
				status,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		const email = res.data.user?.email ?? (typeof body?.email === 'string' ? body.email : '');

		const headers = new Headers({
			location: verifyUrl,
		});
		if (email) {
			setCookie(headers, {
				name: 'verify_email',
				value: encodeURIComponent(email),
				httpOnly: true,
				sameSite: 'Lax',
				secure: reqUrl.protocol === 'https:',
				path: '/verify',
				maxAge: 10 * 60,
			});

			return new Response(JSON.stringify({ ok: true, redirectTo: verifyUrl }), {
				status: 200,
				headers,
			});
		}

		return new Response(null, { status: 303, headers });
	},
});
```

### File: apps\web\routes\api\v1\auth\google\google-login.ts

```ts
import { define } from '@utils';
import { getProviderRedirectUrl } from '@server/auth/oauth.ts';

export const handler = define.handlers({
	async GET(ctx) {
		try {
			const url = new URL(ctx.req.url);

			const next = url.searchParams.get('next') || '/';

			const redirect = await getProviderRedirectUrl('google', 'login', url, next);
			console.log('redirect', redirect, url.href, next);

			return new Response(null, {
				status: 303,
				headers: { Location: redirect },
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'OAuth init failed';
			console.log('redirect error', msg);

			return new Response(
				JSON.stringify({ error: { code: 'oauth_init_failed', message: msg } }),
				{
					status: 500,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				},
			);
		}
	},
});
```

### File: apps\web\routes\api\v1\auth\google\google-register.ts

```ts
import { define } from '@utils';
import { getProviderRedirectUrl } from '@server/auth/oauth.ts';

export const handler = define.handlers({
	async GET(ctx) {
		try {
			const url = new URL(ctx.req.url);

			const next = url.searchParams.get('next') || '/';

			const redirect = await getProviderRedirectUrl('google', 'register', url, next);
			console.log('redirect', redirect, url.href, next);

			return new Response(null, {
				status: 303,
				headers: { Location: redirect },
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'OAuth init failed';
			console.log('redirect error', msg);

			return new Response(
				JSON.stringify({ error: { code: 'oauth_init_failed', message: msg } }),
				{
					status: 500,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				},
			);
		}
	},
});
```

### File: apps\web\routes\api\v1\auth\logout.ts

```ts
```

### File: apps\web\routes\api\v1\auth\me.ts

```ts
// apps/web/routes/api/v1/auth/me.ts
import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { getAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async GET(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) {
			return new Response(JSON.stringify({ error: { code: 'unauthorized' } }), {
				status: 401,
				headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
			});
		}

		const sb = await supabaseClient(ctx.req);
		const { data: userRes, error: userErr } = await sb.auth.getUser();
		if (userErr || !userRes?.user) {
			return new Response(JSON.stringify({ error: { code: 'unauthorized' } }), {
				status: 401,
				headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
			});
		}

		// Fetch public profile under RLS
		const { data: row } = await sb
			.from('org.users_public')
			.select(
				'user_id, display_name, avatar_url, active_profile_type, active_profile_id, active_team_id',
			)
			.eq('user_id', userRes.user.id)
			.single();

		const payload = row
			? {
				id: row.user_id as string,
				displayName: (row.display_name as string) ?? null,
				avatarUrl: (row.avatar_url as string) ?? null,
				activeProfileType: (row.active_profile_type as 'freelancer' | 'business' | null) ?? null,
				activeProfileId: (row.active_profile_id as string | null) ?? null,
				activeTeamId: (row.active_team_id as string | null) ?? null,
			}
			: {
				id: userRes.user.id,
				displayName: null,
				avatarUrl: null,
				activeProfileType: null,
				activeProfileId: null,
				activeTeamId: null,
			};

		return new Response(JSON.stringify({ user: payload }), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
		});
	},
});
```

### File: apps\web\routes\api\v1\auth\onboarding.ts

```ts
import { define } from '@utils';
import { onboarding } from '@server/auth/onboarding.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await onboarding(body, {
			getClient: () => supabaseClient(ctx.req),
		});

		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status ?? 400,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response(JSON.stringify({ ok: true, redirectTo: '/dashboard' }), {
			status: 200,
		});
	},
});
```

### File: apps\web\routes\api\v1\auth\refresh.ts

```ts
// apps/web/routes/api/v1/auth/refresh.ts
import { define } from '@utils';
import { maybeRefreshFromRequest } from '@server/auth/refresh.ts';
import { clearAuthCookies, setAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		const url = new URL(ctx.req.url);
		const refreshed = await maybeRefreshFromRequest(ctx.req);

		if (!refreshed) {
			const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
			clearAuthCookies(headers, url);
			return new Response(JSON.stringify({ ok: false, error: { code: 'refresh_failed' } }), {
				status: 401,
				headers,
			});
		}

		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
		setAuthCookies(headers, {
			accessToken: refreshed.access,
			refreshToken: refreshed.refresh,
			requestUrl: url,
		});

		return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
	},
});
```

### File: apps\web\routes\api\v1\auth\resend.ts

```ts
import { define } from '@utils';
import { resendVerificationEmail } from '@server/auth/resend.ts';

export const handler = define.handlers({
	async POST(ctx) {
		const { email } = await ctx.req.json();
		const res = await resendVerificationEmail((email ?? '').trim().toLowerCase());

		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status ?? 400,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8' },
		});
	},
});
```

### File: apps\web\routes\api\v1\auth\switch-profile.ts

```ts
```

### File: apps\web\routes\api\v1\auth\switch-team.ts

```ts
```

### File: apps\web\routes\api\v1\auth\user.ts

```ts
import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const sb = await supabaseClient(ctx.req);
		const { data, error } = await sb.auth.getUser();

		if (!error && data.user && data.user.user_metadata) {
			const user = data.user.user_metadata;
			const name = user.name.split(' ');
			const firstName = name[0];
			const lastName = name[name.length - 1];
			const username = user.user_name;

			return new Response(JSON.stringify({ firstName, lastName, username }), {
				status: 200,
			});
		}

		return new Response('', { status: 204 });
	},
});
```

### File: apps\web\routes\api\v1\meta\health.ts

```ts
import { define } from '@utils';
import { Config } from '@projective/backend';

const startedAt = Date.now();

type HealthPayload = {
	status: 'ok';
	service: string;
	version: string;
	uptime_ms: number;
	started_at: string;
	commit?: string;
	env: 'development' | 'production' | 'test' | string;
};

function payload(): HealthPayload {
	const uptime = Math.max(0, Date.now() - startedAt);
	const env = Config.APP_ENV ? 'production' : 'development';
	return {
		status: 'ok',
		service: Deno.env.get('APP_NAME') ?? 'projective-api',
		version: Deno.env.get('APP_VERSION') ?? '0.0.0',
		uptime_ms: uptime,
		started_at: new Date(startedAt).toISOString(),
		commit: Deno.env.get('GIT_COMMIT') ?? undefined,
		env,
	};
}

export const handler = define.handlers({
	async GET() {
		return new Response(JSON.stringify(payload()), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
		});
	},

	async HEAD() {
		return new Response(null, {
			status: 200,
			headers: { 'cache-control': 'no-store' },
		});
	},
});
```

### File: apps\web\routes\_app.tsx

```tsx
import { Head } from 'fresh/runtime';
import { State } from '@utils';

export default function App(
	ctx: { Component: preact.ComponentType; stateTheme?: 'light' | 'dark'; state: State },
) {
	const initial = ctx.stateTheme ?? 'dark';

	return (
		<html lang='en' data-theme={initial}>
			<Head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta
					name='description'
					content='Collaborative freelancing platform.'
				/>
				<title>Projective</title>
			</Head>
			<body data-onboarded={ctx.state.isOnboarded}>
				<main>
					<ctx.Component />
				</main>
			</body>
		</html>
	);
}
```

### File: apps\web\routes\_middleware.ts

```ts
// apps/web/routes/_middleware.ts
import { define } from '@utils';
import { maybeRefreshFromRequest } from '@server/auth/refresh.ts';
import { isOnboarded } from '@server/auth/onboarding.ts';
import {
	clearAuthCookies,
	getAuthCookies,
	rateLimitByIP,
	setAuthCookies,
	verifyCsrf,
} from '@projective/backend';

function jwtExp(token: string): number | null {
	try {
		const payload = token.split('.')[1];
		if (!payload) return null;
		const json = JSON.parse(
			new TextDecoder().decode(
				Uint8Array.from(
					atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
					(c) => c.charCodeAt(0),
				),
			),
		);
		return typeof json.exp === 'number' ? json.exp : null;
	} catch {
		return null;
	}
}

const middleware1 = define.middleware(async (ctx) => {
	const req = ctx.req;
	const url = new URL(req.url);
	const path = url.pathname;

	const { accessToken, refreshToken } = getAuthCookies(req);
	const now = Math.floor(Date.now() / 1000);
	const skew = 60;

	const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
	const { allowed } = rateLimitByIP(ip);
	if (!allowed) return new Response('Too Many Requests', { status: 429 });

	ctx.state.isAuthenticated = !!accessToken;

	if (!ctx.state.isAuthenticated) {
		ctx.state.isOnboarded = false;
	}

	// Decide if we should refresh
	let shouldRefresh = false;
	if (refreshToken) {
		if (!accessToken) shouldRefresh = true;
		else {
			const exp = jwtExp(accessToken);
			if (!exp || exp <= now + skew) shouldRefresh = true;
		}
	}

	// Use ctx.state fields (OK), do NOT reassign ctx.state
	ctx.state.refreshedTokens = null;
	ctx.state.clearAuth = false;

	if (shouldRefresh) {
		const refreshed = await maybeRefreshFromRequest(req);
		if (refreshed) {
			ctx.state.refreshedTokens = refreshed;
		} else {
			ctx.state.clearAuth = true;
		}
	}

	// CSRF for cookie-auth state-changing requests (skip if Authorization: Bearer present)
	const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
	const hasBearer = !!req.headers.get('authorization')?.startsWith('Bearer ');
	if (isStateChanging && !hasBearer && (accessToken || ctx.state.refreshedTokens)) {
		if (!verifyCsrf(req)) {
			return new Response(
				JSON.stringify({ error: { code: 'csrf_failed', message: 'CSRF check failed' } }),
				{ status: 403, headers: { 'content-type': 'application/json; charset=utf-8' } },
			);
		}
	}

	// Always allow /verify
	if (path.startsWith('/verify')) {
		const res = await ctx.next();
		if (ctx.state.refreshedTokens) {
			const { access, refresh } = ctx.state.refreshedTokens;
			setAuthCookies(res.headers, {
				accessToken: access,
				refreshToken: refresh,
				requestUrl: url,
			});
		}
		if (ctx.state.clearAuth) clearAuthCookies(res.headers, url);
		return res;
	}

	const res = await ctx.next();

	if (ctx.state.refreshedTokens) {
		const { access, refresh } = ctx.state.refreshedTokens;
		setAuthCookies(res.headers, {
			accessToken: access,
			refreshToken: refresh,
			requestUrl: url,
		});
	}
	if (ctx.state.clearAuth) clearAuthCookies(res.headers, url);

	return res;
});

const middleware2 = define.middleware(async (ctx) => {
	if (ctx.state.isAuthenticated && !ctx.state.isOnboarded) {
		ctx.state.isOnboarded = await isOnboarded(ctx.req);
	}

	return await ctx.next();
});

export default [middleware1, middleware2];
```

### File: apps\web\server\auth\claims.ts

```ts
export type JwtClaims = {
	sub: string;
	exp?: number;
	active_profile_type?: 'freelancer' | 'business';
	active_profile_id?: string;
	active_team_id?: string | null;
} | null;

export function parseJwt(token?: string): JwtClaims {
	if (!token) return null;
	try {
		const [, b64] = token.split('.');
		if (!b64) return null;
		const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export function isExpired(exp?: number, skewSec = 30) {
	if (!exp) return true;
	return exp <= Math.floor(Date.now() / 1000) + skewSec;
}
```

### File: apps\web\server\auth\email\login.ts

```ts
import { LoginWithEmailRequest } from '@contracts/auth/login.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
import { isLikelyEmail } from '../../core/validation/email.ts';
import { Deps, SignInData } from '../_shared/types.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { Config } from '@projective/backend';

export async function loginWithEmail(
	{ email, password }: LoginWithEmailRequest,
	deps: Deps = {},
): Promise<Result<SignInData>> {
	const e = (email ?? '').trim().toLowerCase();
	const p = (password ?? '').trim();

	if (!e || !p) {
		return fail('bad_request', 'Email and password are required.', 400);
	}
	if (!isLikelyEmail(e)) {
		return fail('bad_request', 'Invalid email format.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email: e,
			password: p,
		});

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
```

### File: apps\web\server\auth\email\register.ts

```ts
import { RegisterWithEmailRequest } from '@contracts/auth/register.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
import { isLikelyEmail } from '../../core/validation/email.ts';
import { Deps, RegisterOptions, SignUpData } from '../_shared/types.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { Config } from '@projective/backend';

export async function registerWithEmail(
	{ email, password }: RegisterWithEmailRequest,
	deps: Deps = {},
	opts: RegisterOptions = {},
): Promise<Result<SignUpData>> {
	const e = (email ?? '').trim().toLowerCase();
	const p = (password ?? '').trim();

	if (!e || !p) return fail('bad_request', 'Email and password are required.', 400);
	if (!isLikelyEmail(e)) return fail('bad_request', 'Invalid email format.', 400);
	if (p.length < 8) return fail('bad_request', 'Password must be at least 8 characters.', 400);

	try {
		const emailRedirectTo = `${Config.BASE_URL}/verify`;
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.signUp({
			email: e,
			password: p,
			options: {
				data: opts.metadata,
				emailRedirectTo,
				captchaToken: opts.captchaToken,
			},
		});

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
```

### File: apps\web\server\auth\finalise-login.ts

```ts
```

### File: apps\web\server\auth\oauth.ts

```ts
import { supabaseClient } from '../core/clients/supabase.ts';

export type OAuthProvider = 'google' | 'github';
export type OAuthIntent = 'login' | 'register';

export async function getProviderRedirectUrl(
	provider: OAuthProvider,
	intent: OAuthIntent,
	requestUrl: URL,
	next = '/',
): Promise<string> {
	const verifyUrl = new URL('/verify', requestUrl);
	if (next && next !== '/') {
		verifyUrl.searchParams.set('next', next);
	}
	verifyUrl.searchParams.set('intent', intent);

	const sb = await supabaseClient();
	const { data, error } = await sb.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: verifyUrl.toString(),
			skipBrowserRedirect: true,
		} as any,
	});

	console.log({ provider, url: data?.url }, error);

	if (error || !data?.url) {
		throw new Error(error?.message || 'OAuth init failed');
	}
	return data.url;
}
```

### File: apps\web\server\auth\onboarding.ts

```ts
// server/auth/onboarding.ts
import { OnboardingRequest } from '@contracts/auth/onboading.ts';
import { Deps, SignInData } from './_shared/types.ts';
import { fail, ok, Result } from '../core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../core/errors/normalise.ts';
import { supabaseClient } from '../core/clients/supabase.ts';

export async function onboarding(
	{
		firstName,
		lastName,
		username,
		type,
	}: OnboardingRequest,
	deps: Deps = {},
): Promise<Result<any>> {
	if (!firstName || !username) {
		return fail('bad_request', 'First name and username are required.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		// Make sure we actually have an authenticated user
		const { data, error: authError } = await supabase.auth.getUser();
		if (authError || !data.user) {
			return fail('unauthorized', 'You must be signed in to onboard.', 401);
		}

		const userId = data.user.id;

		// Insert public profile
		const { error: userError } = await supabase
			.schema('org')
			.from('users_public')
			.insert({
				user_id: userId,
				first_name: firstName,
				last_name: lastName,
				username,
			});

		if (userError) {
			const n = normaliseSupabaseError(userError);
			return fail(n.code, n.message, n.status);
		}

		// Optionally create freelancer profile
		if (type === 'freelancer') {
			const { error: freelancerError } = await supabase
				.schema('org')
				.from('freelancer_profiles')
				.insert({
					user_id: userId, // <- use the same authenticated user
				});

			if (freelancerError) {
				const n = normaliseSupabaseError(freelancerError);
				return fail(n.code, n.message, n.status);
			}
		}

		return ok<any>({}); // TODO: return whatever you actually need
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

export async function isOnboarded(req: Request) {
	const supabase = await supabaseClient(req);
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user.id) {
		return false;
	}

	const { data: userData } = await supabase.schema('org').from('users_public').select('user_id').eq(
		'user_id',
		data.user.id,
	);

	if (userData) {
		return true;
	}

	return false;
}
```

### File: apps\web\server\auth\refresh.ts

```ts
import { getAuthCookies } from '@projective/backend';
import { supabaseClient } from '../core/clients/supabase.ts';

type RefreshResult = { access: string; refresh: string } | null;

export async function refreshWithToken(refreshToken: string): Promise<RefreshResult> {
	const sb = await supabaseClient();
	const { data, error } = await sb.auth.refreshSession({ refresh_token: refreshToken });

	if (error || !data?.session?.access_token || !data?.session?.refresh_token) {
		return null;
	}
	return {
		access: data.session.access_token,
		refresh: data.session.refresh_token,
	};
}

export async function maybeRefreshFromRequest(req: Request): Promise<RefreshResult> {
	const { refreshToken } = getAuthCookies(req);
	if (!refreshToken) return null;
	return await refreshWithToken(refreshToken);
}
```

### File: apps\web\server\auth\resend.ts

```ts
import { Config } from '@projective/backend';
import { supabaseClient } from '../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../core/errors/normalise.ts';
import { fail, ok, Result } from '../core/http/result.ts';

export async function resendVerificationEmail(email: string): Promise<Result<{ sent: true }>> {
	if (!email) return fail('bad_request', 'Email is required.', 400);
	try {
		const emailRedirectTo = `${Config.BASE_URL}/verify`;
		const supabase = await supabaseClient();
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
			options: {
				emailRedirectTo,
			},
		});
		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}
		return ok({ sent: true });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
```

### File: apps\web\server\auth\session-context-service.ts

```ts
```

### File: apps\web\server\auth\_shared\types.ts

```ts
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from 'supabaseClient';

export type SignUpData = AuthResponse['data'];

export type SignInData = AuthTokenResponsePassword['data'];

export type Deps = {
	getClient?: () => Promise<SupabaseClient>;
};

export type RegisterOptions = {
	emailRedirectTo?: string;
	captchaToken?: string;
	metadata?: Record<string, unknown>;
};
```

### File: apps\web\server\core\clients\supabase.ts

```ts
import { createClient, type SupabaseClient, type SupabaseClientOptions } from 'supabaseClient';
import { Config, getAuthCookies } from '@projective/backend';

let anonClient: SupabaseClient /*<Database>*/ | null = null;

function getEnv() {
	const SUPABASE_URL = Config.SUPABASE_URL;
	const ANON_KEY = Config.SUPABASE_SERVICE_ROLE_KEY;
	if (!SUPABASE_URL || !ANON_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
	return { SUPABASE_URL, ANON_KEY };
}

/**
 * Returns a Supabase client:
 * - If `req` contains an access token cookie, a **new per-request client** with `Authorization: Bearer <token>`.
 * - Otherwise, a **shared anon client** (cached).
 *
 * No session persistence; SSR-safe.
 */
export async function supabaseClient(req?: Request): Promise<SupabaseClient> {
	const { SUPABASE_URL, ANON_KEY } = getEnv();

	const baseOptions: SupabaseClientOptions<'public'> = {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
		},
	};

	if (req) {
		const { accessToken } = getAuthCookies(req);
		if (accessToken) {
			return createClient(SUPABASE_URL, ANON_KEY, {
				...baseOptions,
				global: {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			});
		}
	}

	if (!anonClient) {
		anonClient = createClient(SUPABASE_URL, ANON_KEY, baseOptions);
	}
	return anonClient;
}
```

### File: apps\web\server\core\errors\normalise.ts

```ts
export function normaliseSupabaseError(error: unknown): {
	code: string;
	message: string;
	status?: number;
} {
	const e = error as { code?: string; message?: string; status?: number };
	const raw = (e.code ?? '').toLowerCase();

	if (raw.includes('rate') || e.status === 429) {
		return {
			code: 'rate_limit',
			message: e.message ?? 'Too many attempts. Please try later.',
			status: 429,
		};
	}
	if (raw.includes('user') && raw.includes('exists')) {
		return { code: 'user_exists', message: e.message ?? 'User already exists.', status: 409 };
	}
	if ((raw.includes('invalid') && raw.includes('credentials')) || e.status === 401) {
		return {
			code: 'invalid_credentials',
			message: e.message ?? 'Invalid email or password.',
			status: 401,
		};
	}
	if (raw === 'signup_failed' || raw === 'invalid_signup' || e.status === 400) {
		return {
			code: 'signup_failed',
			message: e.message ?? 'Sign up failed.',
			status: e.status ?? 400,
		};
	}

	return { code: raw || 'auth_error', message: e.message ?? 'Authentication error.' };
}

export function normaliseUnknownError(err: unknown): {
	code: string;
	message: string;
} {
	if (err && typeof err === 'object') {
		const anyErr = err as { name?: string; message?: string };
		const name = (anyErr.name ?? '').toLowerCase();
		const message = anyErr.message ?? 'Unknown error';
		if (name === '' || name === 'error') {
			return { code: 'unknown_error', message };
		}
		return { code: name, message };
	}
	return { code: 'unknown_error', message: 'Unknown error' };
}
```

### File: apps\web\server\core\http\result.ts

```ts
export type Ok<T> = { ok: true; data: T };
export type Fail = { ok: false; error: { code: string; message: string; status?: number } };
export type Result<T> = Ok<T> | Fail;

export function ok<T>(data: T): Ok<T> {
	return { ok: true, data };
}
export function fail(code: string, message: string, status?: number): Fail {
	return { ok: false, error: { code, message, status } };
}
```

### File: apps\web\server\core\validation\email.ts

```ts
export function isLikelyEmail(s: string): boolean {
	if (!s || !s.includes('@')) return false;
	const [, domain = ''] = s.split('@');
	return domain.includes('.') && !/\s/.test(s);
}
```

### File: apps\web\server\middleware\auth\verify_guard.ts

```ts
import { Deps, SignInData } from '../../auth/_shared/types.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
import { isLikelyEmail } from '../../core/validation/email.ts';

export async function loginWithEmail(email: string, deps: Deps = {}): Promise<any> {
	const e = (email ?? '').trim().toLowerCase();

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.get({ email: e, password: p });

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
```

### File: apps\web\server\middleware\auth_guard.ts

```ts
```

### File: apps\web\styles\components\auth\login-button.css

```css
.login-button {
	font-size: inherit;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1em;
	padding: 0.5em 1em;
	width: 100%;

	background-color: black;
	color: white;
	border-radius: var(--border-radius__large);

	&:disabled {
		background-color: red;
	}
}
```

### File: apps\web\styles\components\auth\onboarding\onboarding-stage-1.css

```css
.onboarding-stage-1 {
	display: flex;
	flex-direction: column;
	gap: 0.75em;
	width: 100%;

	.onboarding-stage-1__account-type__container {
		display: flex;
		gap: 0.75em;
		width: 100%;

		.onboarding-stage-1__account-type {
			width: 100%;
			background-color: #fff5;
			color: var(--primary);
			border-radius: var(--border-radius);
			padding: 1rem;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			transition: background-color var(--fast);

			&:hover {
				background-color: #fff4;
			}

			&:has(input:checked) {
				background-color: #000;
				color: white;
				font-weight: bold;
			}
		}
	}

	.onboarding-stage-1__separator {
		width: 100%;
		border: 1px solid #fff3;
	}

	.onboarding-stage-1__name {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: 0.75em;
	}
}
```

### File: apps\web\styles\components\auth\onboarding\onboarding-stage-2.css

```css
.onboarding-stage-2 {
	display: flex;
	flex-direction: column;
	gap: 0.75em;
	width: 100%;
}
```

### File: apps\web\styles\components\auth\onboarding\onboarding-stage-3.css

```css
```

### File: apps\web\styles\components\auth\provider-login-button.css

```css
.provider-login-button {
	font-size: inherit;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1em;
	padding: 0.5em 1em;
	width: 100%;

	border: 1px solid hsla(0, 100%, 100%, 0.2);
	color: white;
	border-radius: var(--border-radius__large);
}
```

### File: apps\web\styles\components\fields\DropdownField.css

```css
.dropdown-field__container {
	width: 100%;
	position: relative;
}

.dropdown-field__input {
	display: flex;
	align-items: center;
	gap: 1em;
	justify-content: space-between;
	width: 100%;

	border-radius: var(--border-radius);
	box-shadow: inset 0 3px 6px #0004;
	background-color: #fff;
	/* outline: 1px solid #ccc; */
	position: relative;

	.dropdown-field__input__button {
		display: flex;
		align-items: center;
		width: 100%;
		height: 100%;
		padding: 0.25rem;

		.dropdown-field__input__button__span,
		.dropdown-field__input__button__input {
			width: 100%;
			height: 100%;
			padding: 0.4rem;
			text-align: left;
		}

		.dropdown-field__input__button__span,
		.dropdown-field__input__button__input::placeholder {
			color: var(--text-dark);
		}
	}

	&:has(.dropdown-field__input__selected) {
		.dropdown-field__input__button {
			padding: 0.25rem 0;

			.dropdown-field__input__button__span,
			.dropdown-field__input__button__input {
				padding: 0.4rem 0;
			}
		}
	}

	.dropdown-field__input__selected {
		height: 100%;
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.25rem;

		.dropdown-field__input__selected__item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 1rem;
			border-radius: var(--border-radius);

			background-color: #fff;
			box-shadow: 0 2px 6px #0004;
			padding: 0.3rem 0.4rem;
			color: var(--text);

			.dropdown-field__input__selected__item__close {
				padding: 0;
				margin: 0;
				height: 1rem;
				width: 1rem;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
}

.dropdown-field__selected__container {
	width: 100%;
	display: flex;

	.dropdown-field__selected {
		position: relative;
		width: 100%;
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
		border: 1px solid var(--card);
		border-radius: var(--border-radius);
		padding: 0.5rem;

		.dropdown-field__selected__item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 1rem;
			border-radius: 2rem;

			background-color: var(--primary-half);
			padding: 0.2rem 0.5rem;
			color: white;
			font-size: 0.8rem;

			.dropdown-field__selected__item__close {
				padding: 0;
				margin: 0;
				height: 1rem;
				width: 1rem;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
}
```

### File: apps\web\styles\components\fields\FormStages.css

```css
.form-stages {
	display: flex;
	align-items: center;
	gap: 1em;

	.form-stages__item {
		display: flex;
		align-items: center;
		gap: 1em;
		position: relative;

		&[data-selected='true'] {
			font-weight: bold;

			.form-stages__item__container {
				opacity: 1;
			}
		}

		.form-stages__item__container {
			display: flex;
			flex-direction: column;
			align-items: center;
			opacity: 0.5;

			.form-stages__item__circle {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 4em;
				width: 4em;
				background-color: white;
				color: var(--primary);
				font-weight: bold;
				border-radius: 4em;

				p {
					padding: 0;
					margin: 0;
					font-size: 2em;
				}
			}

			.form-stages__item__name {
				font-size: 1;
				padding-top: 0.5em;
				margin: 0;
			}
		}

		.form-stages__item__divider {
			position: relative;
			width: 5em;
			border: 0.1em dashed white;
			top: -0.75em;
			opacity: 0.3;
		}
	}
}
```

### File: apps\web\styles\components\fields\SelectField.css

```css
/* --- Base --- */
.select-field {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	width: 100%;
	position: relative;
	font-family: inherit;
	box-sizing: border-box;
}

/* --- Wrapper --- */
.select-field__wrapper {
	display: flex;
	align-items: center;
	min-height: var(--input-height);
	background: var(--input-bg);
	border: 1px solid var(--input-border);
	border-radius: var(--input-radius);
	padding: 0.25rem 0.5rem;
	cursor: text;
	transition: all 0.2s ease;
	overflow: hidden;
}

/* --- Content (Input + Chips) --- */
.select-field__content {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	gap: 0.375rem;
	align-items: center;
	min-width: 0;
	position: relative;
}

.select-field__input {
	flex: 1;
	min-width: 2rem;
	border: none;
	outline: none;
	background: transparent;
	padding: 0;
	margin: 0;
	color: var(--input-text);
	font-size: 0.875rem;
	height: 1.5rem;
}

/* --- Indicators --- */
.select-field__indicators {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding-left: 0.5rem;
	margin-left: auto;
	flex-shrink: 0;
	color: #9ca3af;
	height: 100%;
}

.select-field__clear {
	background: none;
	border: none;
	padding: 2px;
	cursor: pointer;
	color: #9ca3af;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.select-field__clear:hover {
	background-color: #f3f4f6;
	color: var(--input-error-text);
}

.select-field__arrow {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.25rem;
	transition: transform 0.2s ease;
}

.select-field__arrow--flip {
	transform: rotate(180deg);
}

/* --- Single Value Overlay --- */
.select-field__single-value {
	position: absolute;
	left: 0;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--input-text);
	font-size: 0.875rem;
}

/* --- Chips --- */
.select-field__chip {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	background-color: #e5e7eb;
	border-radius: 0.25rem;
	padding: 0.125rem 0.375rem;
	font-size: 0.75rem;
	font-weight: 500;
	color: var(--input-text);
	max-width: 100%;
}

.select-field__chip-remove {
	display: flex;
	align-items: center;
	cursor: pointer;
	color: #6b7280;
	border-radius: 50%;
}

.select-field__chip-remove:hover {
	color: #ef4444;
}

/* --- Menu --- */
.select-field__menu {
	position: absolute;
	left: 0;
	width: 100%;
	background: var(--dropdown-bg);
	border: 1px solid var(--input-border);
	box-shadow: var(--dropdown-shadow);
	z-index: 100;
	max-height: 250px;
	overflow-y: auto;
	border-radius: var(--input-radius);
}

.select-field--pos-down .select-field__menu {
	top: 100%;
	margin-top: 0.25rem;
}

.select-field--pos-up .select-field__menu {
	bottom: 100%;
	margin-bottom: 0.25rem;
}

/* --- Grouping --- */
.select-field__group-label {
	padding: 0.5rem 0.75rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: #6b7280;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	background-color: #f9fafb;
	position: sticky;
	top: 0;
	z-index: 1;
	/* Ensure it floats above scrolling content if desired, though usually just visual block */
	border-bottom: 1px solid #f3f4f6;
}

/* --- Action Bar (Select All) --- */
.select-field__action-bar {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	font-size: 0.875rem;
	color: var(--input-focus-border);
	cursor: pointer;
	border-bottom: 1px solid var(--input-border);
	font-weight: 500;
	background: #fff;
}

.select-field__action-bar:hover {
	background-color: var(--option-hover);
}

/* --- Options --- */
.select-field__option {
	padding: 0.5rem 0.75rem;
	font-size: 0.875rem;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: var(--input-text);
}

.select-field__option--highlighted {
	background-color: var(--option-hover);
}

.select-field__option--selected {
	background-color: var(--option-selected-bg);
	color: var(--option-selected-text);
}

.select-field__option--disabled {
	opacity: 0.5;
	cursor: not-allowed;
	pointer-events: none;
}

.select-field__opt-content {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	overflow: hidden;
	text-overflow: ellipsis;
}

.select-field__avatar {
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 50%;
	object-fit: cover;
}

.select-field__icon {
	display: flex;
	align-items: center;
	color: #6b7280;
}

.select-field__msg-error {
	font-size: 0.75rem;
	color: var(--input-error-text);
	margin-top: 0.25rem;
}

.select-field__spin {
	animation: spin 1s linear infinite;
	color: var(--input-focus-border);
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
```

### File: apps\web\styles\components\fields\SliderField.css

```css
/* --- Base --- */
.slider-field {
	display: flex;
	flex-direction: column;
	width: 100%;
	font-family: inherit;
	margin-bottom: 0.5rem;
	--slider-size: 0.2rem;
	/* Hit area size */
	--track-thickness: 0.375rem;
	--track-bg: #e5e7eb;
	--fill-bg: #3b82f6;
	--handle-size: 1.25rem;
	--handle-bg: #ffffff;
	--handle-border: #d1d5db;
	--mark-color: #9ca3af;
	--tooltip-bg: #111827;
	--tooltip-text: #ffffff;
}

.slider-field--has-marks {
	margin-bottom: 1.5rem;
}

.slider-field--disabled {
	opacity: 0.6;
	pointer-events: none;
}

/* --- Header --- */
.slider-field__header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 0.5rem;
}

.slider-field__label {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--input-text);
}

.slider-field__value-display {
	font-size: 0.75rem;
	font-family: monospace;
	color: #6b7280;
}

/* --- Control Wrapper --- */
.slider-field__control {
	position: relative;
	display: flex;
	align-items: center;
	touch-action: none;
}

/* --- HORIZONTAL (Default) --- */
.slider-field:not(.slider-field--vertical) .slider-field__control {
	height: var(--slider-size);
	width: 100%;
}

.slider-field:not(.slider-field--vertical) .slider-field__track-container {
	width: 100%;
	height: var(--slider-size);
}

.slider-field:not(.slider-field--vertical) .slider-field__rail {
	width: 100%;
	height: var(--track-thickness);
	left: 0;
}

.slider-field:not(.slider-field--vertical) .slider-field__track {
	height: var(--track-thickness);
	/* left/width via JS */
}

/* --- VERTICAL --- */
.slider-field--vertical {
	flex-direction: row;
	/* Label side-by-side or needs layout adjustment */
	align-items: flex-start;
	height: 100%;
}

.slider-field--vertical .slider-field__header {
	/* If vertical, maybe hide value display or stack it? */
	flex-direction: column;
	margin-right: 1rem;
	margin-bottom: 0;
}

.slider-field--vertical .slider-field__control {
	height: 200px;
	/* Default Height or overridden by style */
	width: var(--slider-size);
	flex-direction: column;
}

.slider-field--vertical .slider-field__track-container {
	height: 100%;
	width: var(--slider-size);
	display: flex;
	justify-content: center;
	/* Center rail in width */
}

.slider-field--vertical .slider-field__rail {
	height: 100%;
	width: var(--track-thickness);
	bottom: 0;
}

.slider-field--vertical .slider-field__track {
	width: var(--track-thickness);
	/* bottom/height via JS */
}

/* --- Common Track Elements --- */
.slider-field__track-container {
	position: relative;
	cursor: pointer;
}

.slider-field__rail {
	position: absolute;
	background-color: var(--track-bg);
	border-radius: 99px;
}

.slider-field__track {
	position: absolute;
	background-color: var(--fill-bg);
	border-radius: 99px;
	z-index: 1;
}

/* --- Marks --- */
.slider-field__marks {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 0;
}

.slider-field__mark {
	position: absolute;
	/* Centering logic differs by axis */
}

/* Horizontal Marks */
.slider-field:not(.slider-field--vertical) .slider-field__mark {
	transform: translateX(-50%);
	top: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.slider-field:not(.slider-field--vertical) .slider-field__mark-tick {
	width: 2px;
	height: 0.75rem;
	background-color: var(--track-bg);
	margin-top: calc(var(--track-thickness) * 1.5);
}

.slider-field:not(.slider-field--vertical) .slider-field__mark-label {
	top: 1.5rem;
	position: absolute;
	font-size: 0.75rem;
	color: var(--mark-color);
	white-space: nowrap;
}

/* Vertical Marks */
.slider-field--vertical .slider-field__mark {
	transform: translateY(50%);
	left: 50%;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.slider-field--vertical .slider-field__mark-tick {
	height: 2px;
	width: 0.75rem;
	background-color: var(--track-bg);
	margin-left: calc(var(--track-thickness) * 1.5);
}

.slider-field--vertical .slider-field__mark-label {
	left: 1.5rem;
	position: absolute;
	font-size: 0.75rem;
	color: var(--mark-color);
	white-space: nowrap;
}

/* --- Handles --- */
.slider-field__handle {
	position: absolute;
	width: var(--handle-size);
	height: var(--handle-size);
	transform: translate(-50%, -50%);
	/* Center on point */
	z-index: 3;
	cursor: grab;
	touch-action: none;
	display: flex;
	align-items: center;
	justify-content: center;
	outline: none;
}

.slider-field__handle:active {
	cursor: grabbing;
	z-index: 4;
}

.slider-field__handle:focus-visible .slider-field__handle-knob {
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
	border-color: var(--fill-bg);
}

.slider-field__handle-knob {
	width: 100%;
	height: 100%;
	background-color: var(--handle-bg);
	border: 1px solid var(--handle-border);
	border-radius: 50%;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	transition: transform 0.1s;
}

.slider-field__handle:active .slider-field__handle-knob {
	transform: scale(1.1);
	border-color: var(--fill-bg);
}

/* --- Tooltips --- */
.slider-field__tooltip {
	position: absolute;
	background-color: var(--tooltip-bg);
	color: var(--tooltip-text);
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 500;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.2s, transform 0.2s;
	z-index: 10;
}

/* Show tooltip on hover or active */
.slider-field__handle:hover .slider-field__tooltip,
.slider-field__handle:active .slider-field__tooltip,
.slider-field__handle:focus-visible .slider-field__tooltip {
	opacity: 1;
}

/* Tooltip Position: Top for Horizontal */
.slider-field:not(.slider-field--vertical) .slider-field__tooltip {
	bottom: 100%;
	margin-bottom: 0.5rem;
	transform: translateY(4px);
}

.slider-field:not(.slider-field--vertical) .slider-field__handle:hover .slider-field__tooltip {
	transform: translateY(0);
}

/* Tooltip Position: Left for Vertical */
.slider-field--vertical .slider-field__tooltip {
	right: 100%;
	margin-right: 0.5rem;
	transform: translateX(4px);
}

.slider-field--vertical .slider-field__handle:hover .slider-field__tooltip {
	transform: translateX(0);
}

/* --- Messages --- */
.slider-field__msg-error {
	font-size: 0.75rem;
	color: var(--input-error-text);
	margin-top: 0.25rem;
}

.slider-field__msg-hint {
	font-size: 0.75rem;
	color: #6b7280;
	margin-top: 0.25rem;
}
```

### File: apps\web\styles\components\fields\TextField.css

```css
/* --- Base --- */
.text-field {
	display: flex;
	flex-direction: column;
	width: 100%;
	position: relative;
	font-family: inherit;
	margin-bottom: 0.5rem;
}

/* --- Wrapper --- */
.text-field__wrapper {
	display: flex;
	align-items: center;
	background: var(--input-bg);
	border: 1px solid var(--input-border);
	border-radius: var(--input-radius);
	min-height: var(--input-height);
	padding: 0 0.75rem;
	/* Standard padding */
	transition: all 0.2s ease;
	position: relative;
	z-index: 1;
}

/* Multiline Wrapper Alignment Fix */
.text-field--multiline .text-field__wrapper {
	align-items: flex-start;
	padding-top: 0.5rem;
	padding-bottom: 0;
	/* REMOVE bottom padding from wrapper to let handle sit at bottom */
	height: auto;
}

.text-field__wrapper:focus-within {
	border-color: var(--input-focus-border);
	box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.text-field--error .text-field__wrapper {
	border-color: var(--input-error-text);
}

.text-field--success .text-field__wrapper {
	border-color: var(--input-success);
}

.text-field--disabled .text-field__wrapper {
	background-color: var(--input-disabled-bg);
	cursor: not-allowed;
	opacity: 0.8;
}

/* --- Input & Textarea --- */
.text-field__input {
	flex: 1;
	border: none;
	background: transparent;
	outline: none;
	padding: 0.5rem 0;
	font-size: 0.875rem;
	color: var(--input-text);
	width: 100%;
	height: 100%;
	line-height: 1.5;
}

.text-field__input::placeholder {
	color: var(--input-placeholder);
	opacity: 1;
}

/* Textarea Specifics */
.text-field__input--textarea {
	min-height: 3rem;
	margin: 0;
	display: block;
	/* Add bottom padding here instead of wrapper */
	padding-bottom: 0.5rem;
}

/* Case 1: Manual Resize (Default) */
.text-field--multiline:not(.text-field--auto-grow) .text-field__input--textarea {
	resize: vertical;
	overflow: auto;
}

/* Case 2: Auto Grow (Hidden resize/overflow) */
.text-field--auto-grow .text-field__input--textarea {
	resize: none;
	overflow: hidden;
	/* Prevent scrollbar flickering */
}

/* --- Labels --- */
.text-field__label {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--input-text);
	margin-bottom: 0.375rem;
	display: block;
}

.text-field__req {
	color: var(--input-error-text);
}

/* --- Floating Label Logic --- */
.text-field--floating .text-field__label {
	position: absolute;
	left: 0.75rem;
	top: 0.75rem;
	margin: 0;
	padding: 0 0.25rem;
	background-color: var(--input-bg);
	color: var(--input-placeholder);
	transition: all 0.2s ease-out;
	pointer-events: none;
	z-index: 2;
	transform-origin: left top;
}

.text-field--floating.text-field--active .text-field__label {
	top: -0.6rem;
	left: 0.5rem;
	font-size: 0.75rem;
	color: var(--input-text);
	font-weight: 600;
}

.text-field--floating .text-field__wrapper {
	background: var(--input-bg);
}

/* --- Addons (Prefix/Suffix) --- */
.text-field__addon {
	display: flex;
	align-items: center;
	color: #6b7280;
	font-size: 0.875rem;
	white-space: nowrap;
}

.text-field--multiline .text-field__addon {
	margin-top: 0.125rem;
}

.text-field__addon--left {
	margin-right: 0.5rem;
}

.text-field__addon--right {
	margin-left: 0.5rem;
}

/* --- Actions (Clear / Password) --- */
.text-field__actions {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-left: 0.5rem;
	height: 100%;
}

.text-field--multiline .text-field__actions {
	align-items: flex-start;
	margin-top: 0.125rem;
}

.text-field__action-btn {
	background: none;
	border: none;
	padding: 4px;
	cursor: pointer;
	color: #9ca3af;
	display: flex;
	align-items: center;
	border-radius: 50%;
	transition: color 0.2s;
}

.text-field__action-btn:hover {
	color: var(--input-text);
	background-color: #f3f4f6;
}

/* --- Footer --- */
.text-field__footer {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-top: 0.25rem;
	min-height: 1rem;
}

.text-field__msg-error {
	font-size: 0.75rem;
	color: var(--input-error-text);
}

.text-field__msg-hint {
	font-size: 0.75rem;
	color: #6b7280;
}

.text-field__counter {
	font-size: 0.75rem;
	color: #9ca3af;
	margin-left: auto;
	padding-left: 0.5rem;
}
```

### File: apps\web\styles\components\navigation\nav-bar-guest.css

```css
.header-container {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 10rem;
}

.header__buttons {
	display: flex;
	align-items: center;
	gap: 1rem;
	font-weight: bold;

	.header__buttons__user {
		padding: 0.4rem 2rem;
		border-radius: var(--border-radius);
		transition: background var(--medium), color var(--medium), border var(--medium);

		&.header__buttons__login {
			color: var(--primary);
			border: 1px solid var(--primary);

			&:hover {
				border: 1px solid var(--primary-highlight);
				color: var(--primary-highlight);
				box-shadow: 0 0 12px var(--primary);
			}
		}

		&.header__buttons__join {
			background-color: var(--primary);
			color: white;

			&:hover {
				background-color: var(--primary-highlight);
				box-shadow: 0 0 12px var(--primary);
			}
		}
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-profile-dropdown-actions.css

```css
.nav-bar-user__profile__dropdown__actions {
	display: flex;
	flex-direction: column;

	a {
		padding: 0.5em 1em;
		border-radius: var(--border-radius__small);
		cursor: pointer;

		&:hover {
			background-color: var(--button-hover);
		}
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-profile-dropdown-business.css

```css
.nav-bar-user__profile__dropdown__switch__business {
	width: 100%;
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-profile-dropdown-switch.css

```css
.nav-bar-user__profile__dropdown__switch {
	display: flex;
	flex-direction: column;
	align-items: center;

	.nav-bar-user__profile__dropdown__switch__switch {
		display: flex;
		justify-content: space-evenly;
		width: 100%;

		.nav-bar-user__profile__dropdown__switch__label {
			cursor: pointer;

			&:has(input:checked) {
				color: var(--primary);
				font-weight: bold;
			}
		}
	}

	hr {
		width: 75%;
		border: 1px solid var(--text-dark);
	}

	.nav-bar-user__profile__dropdown__switch__account-type {
		width: 75%;

		.nav-bar-user__profile__dropdown__add {
			width: 100%;
			color: var(--button-hover-light);
			border: 1px solid var(--button-hover-light);
			padding: 0.5rem 0;
			border-radius: var(--border-radius__small);
			cursor: pointer;
			display: flex;
			justify-content: center;
			align-items: center;
			font-weight: 0.8em;

			&:hover {
				background-color: var(--button-hover);
				color: var(--text);
			}
		}
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-profile-dropdown-teams.css

```css
.nav-bar-user__profile__dropdown__teams {
	width: 100%;
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-profile-dropdown.css

```css
.nav-bar-user__profile__dropdown {
	position: absolute;
	top: var(--header-height);
	right: 0;
	background-color: var(--header);
	width: 400px;
	padding: 1em;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	border-radius: var(--border-radius__large);

	.nav-bar-user__profile__dropdown__current {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.nav-bar-user__profile__dropdown__current__profile {
			display: flex;
			align-items: center;
			gap: 0.75rem;

			img {
				height: 4em;
				width: 4em;
				border-radius: 4em;
				border: 1px solid var(--text-dark);
			}

			p {
				margin: 0;
				padding: 0;
			}

			.nav-bar-user__profile__dropdown__current__profile__name {
				.nav-bar-user__profile__dropdown__current__profile__name__name {
					font-size: 1.5em;
					font-weight: 500;
				}

				.nav-bar-user__profile__dropdown__current__profile__name__username {
					font-size: 0.8em;
					color: var(--text-medium);
				}
			}
		}

		.nav-bar-user__profile__dropdown__current__switch {
			border-radius: var(--border-radius__small);
			height: 2rem;
			width: 2rem;

			display: flex;
			align-items: center;
			justify-content: center;

			svg * {
				stroke: var(--text-medium);
			}

			&:hover {
				background-color: var(--button-hover);
			}
		}
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-profile.css

```css
.nav-bar-user__profile {
	position: relative;

	.nav-bar-user__profile__btn {
		height: 2.75rem;
		width: 2.75rem;
		min-height: 2.75rem;
		min-width: 2.75rem;
		max-height: 2.75rem;
		max-width: 2.75rem;
		border-radius: 4rem;

		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;

		.nav-bar-user__profile__btn__img {
			min-height: inherit;
			min-width: inherit;

			border: 1px solid var(--text-dark);
			border-radius: 4rem;
			overflow: hidden;
			display: flex;
			justify-content: center;
			align-items: center;

			img {
				min-height: inherit;
				min-width: inherit;
			}
		}
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar-user-side.css

```css
.nav-bar-user-side {
	position: fixed;
	left: 1rem;
	top: calc(var(--header-height) + 1rem);
	width: var(--side-nav-width);
	height: calc(100% - var(--header-height) - 1rem);
	z-index: 1000;
	display: flex;

	.nav-bar-user-side__container {
		margin: 1rem 0;
		height: 100%;
		max-height: calc(100% - 4rem);
		width: 100%;
		background-color: var(--header);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		position: relative;
		border-radius: 1rem;
	}

	.nav-bar-user-side__group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
		width: 100%;

		.nav-bar-user-side__app {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 2.5rem;

			&[data-selected='true'] {
				box-shadow: 0 0 12px var(--primary);
				background-color: var(--primary-half);
				outline: 1px solid var(--primary);
				color: white;
			}
		}
	}

	.nav-bar-user-side__open {
		position: absolute;
		left: 0.75rem;
		bottom: 1rem;
	}

	a,
	button {
		border-radius: var(--border-radius__small);
		height: 2.5rem;
		min-height: 2.5rem;
		width: 2.5rem;
		min-width: 2.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--text-dark);

		&:hover {
			background-color: var(--button-hover);
			color: var(--text-medium);
		}
	}

	hr {
		border: 1px solid var(--text-dark);
		width: 80%;
		opacity: 0.5;
	}

	&[data-sidebar-open='true'] {
		.nav-bar-user-side__app {
			justify-content: start !important;
			gap: 0.5rem !important;
			padding: 0 0.5rem !important;
			width: calc(100% - 1rem) !important;
		}

		[data-tooltip]::before {
			display: none;
		}

		[data-tooltip]:hover::before {
			display: none;
		}
	}

	&[data-sidebar-open='false'] {
		.nav-bar-user-side__app {
			justify-content: center !important;
			gap: 0 !important;
			padding: 0 !important;
			width: 100% !important;
		}

		[data-tooltip]::before {
			left: 100% !important;
			transform: translate(1rem, calc(-100% - 0.75rem));
		}
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar-user.css

```css
.nav-bar-user {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1rem;

	.nav-bar-user__logo {
		width: calc(100% / 3);
		height: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;

		.nav-bar-user__logo__svg {
			height: 2rem;
			width: auto;
		}
	}

	.nav-bar-user__search {
		/* background-color: blue; */
		width: calc(100% / 3);
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-bar-user__actions {
		/* background-color: green; */
		width: calc(100% / 3);
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: right;
		gap: 1rem;
	}
}
```

### File: apps\web\styles\components\navigation\nav-bar.css

```css
header {
	width: 100%;
	max-width: 100vw;
	height: var(--header-height);
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	padding-top: 1rem;
	z-index: 1000;

	nav {
		margin: 1rem;
		width: 100%;
		height: 100%;
		background-color: var(--header);

		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 1rem;
	}
}
```

### File: apps\web\styles\components\public\explore\filters.css

```css
.explore-filters {
	height: 100%;
	width: 100%;

	.demo-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: sans-serif;
	}

	.demo-section {
		margin-bottom: 2.5rem;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: #f9fafb;
	}

	.demo-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #111827;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	@media (max-width: 600px) {
		.demo-grid {
			grid-template-columns: 1fr;
		}
	}

	.demo-state {
		margin-top: 1rem;
		font-family: monospace;
		font-size: 0.85rem;
		color: #6b7280;
		background: #fff;
		padding: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
	}
}
```

### File: apps\web\styles\components\search\SearchBar.css

```css
.search-bar {
	display: flex;
	align-items: center;
	gap: 0.5em;
	width: 100%;
	border-radius: var(--border-radius);
	background-color: var(--card);

	.search-bar__input {
		width: 100%;
		background: none;
		font-size: 1.5em;
		padding: 0.75em;
		outline: none;
		border: none;
	}

	.search-bar__enter {
		margin-right: 0.75em;
		height: 3.5em;
		width: 3.5em;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary);
		border-radius: var(--border-radius__small);
		color: white;
	}

	&:has(.search-bar__input:focus) {
		outline: 1px solid var(--primary);
	}
}
```

### File: apps\web\styles\layouts\auth.css

```css
:root {
	main {
		margin-top: 0 !important;
	}
}

.layout-auth {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	width: 100vw;
	position: relative;
	overflow: hidden;
}

.background {
	position: absolute;
	top: 0;
	left: 0;
	height: 100vh;
	width: 100vw;
	object-fit: cover;
	z-index: -1;
}

.layout-auth__modal {
	width: 90vw;
	height: 90vh;
	background-color: var(--primary);
	color: white;
	border-radius: 50px;
	display: flex;
	gap: 2rem;
	position: relative;

	.layout-auth__modal__window {
		position: relative;
		top: 10px;
		left: 10px;
		height: calc(100% - 20px);
		width: 40%;
		border-radius: 40px;
		overflow: hidden;
		background-color: white;

		img {
			position: absolute;
			top: calc(-5vh - 10px);
			left: calc(-5vw - 10px);
			height: 100vh;
			width: 100vw;
			object-fit: cover;
			filter: brightness(1.2) blur(10px);
		}

		.layout-auth__modal__window__content {
			position: relative;
			height: calc(100% - 8rem);
			width: calc(100% - 8rem);
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			color: white;
			padding: 4rem;

			.layout-auth__modal__window__content__quote__line-container {
				display: flex;
				align-items: center;
				gap: 1rem;

				.layout-auth__modal__window__content__quote__line {
					height: 2px;
					width: 30%;
					background-color: white;
				}
			}

			.layout-auth__modal__window__content__slogan {
				.deliver-better {
					margin-left: 20%;
				}
			}

			h1 {
				padding: 0;
				margin: 0;
				font-size: 3rem;
			}

			p {
				font-size: 1.2rem;
			}
		}
	}

	.layout-auth__modal__content {
		width: 60%;
		height: 100%;
		margin-right: 2rem;
	}
}
```

### File: apps\web\styles\pages\auth\login.css

```css
.login {
	width: 100%;
	height: 85%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;

	h1,
	p {
		margin: 0;
		padding: 0;
	}

	.login__container {
		width: 60%;
		height: 80%;
		min-width: 300px;
		display: flex;
		align-items: center;

		.login__container__center {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
		}
	}

	.login__header {
		margin-bottom: 2rem;
		text-align: left;
		width: 100%;
		font-weight: 400;

		h1 {
			font-size: 4rem;
			margin-bottom: 0.5rem;
			font-weight: inherit;
		}
	}
}

.login__fields__container {
	height: 100%;
	width: 90%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 5rem;

	.login__fields {
		font-size: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;

		.login__fields__options {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 0.875rem;

			.remember-me {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				input[type='checkbox'] {
					width: 1rem;
					height: 1rem;
				}
			}

			a {
				color: white;
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
}

.login__actions {
	font-size: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
}

.switch-auth {
	width: 80%;
	display: flex;
	justify-content: end;
	align-items: center;
	gap: 0.5rem;

	.switch-auth__text {
		margin: 0;
		padding: 0;
		font-size: 1rem;
	}

	.switch-auth__link {
		color: white;
		text-decoration: none;
		font-size: 1rem;
		font-weight: bold;
		background-color: hsla(0, 100%, 100%, 0.2);
		padding: 0.5em 2em;
		border-radius: 4rem;

		&:hover {
			background-color: hsla(0, 100%, 100%, 0.1);
		}
	}
}
```

### File: apps\web\styles\pages\auth\onboarding.css

```css
.onboarding {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 85%;

	.onboarding-stages-indicator {
		font-size: 0.8rem;
	}

	.onboarding-stages {
		width: 60%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;

		.onboarding-stage {
			position: relative;
			width: 100%;
			top: -4rem;

			display: flex;
			flex-direction: column;
			gap: 0.75em;
			width: 100%;

			.onboarding-stage__account-type__container {
				display: flex;
				gap: 0.75em;
				width: 100%;

				.onboarding-stage__account-type {
					width: 100%;
					background-color: #fff5;
					color: var(--primary);
					border-radius: var(--border-radius);
					padding: 1rem;
					display: flex;
					justify-content: center;
					align-items: center;
					cursor: pointer;
					transition: background-color var(--fast);

					&:hover {
						background-color: #fff4;
					}

					&:has(input:checked) {
						background-color: #000;
						color: white;
						font-weight: bold;
					}
				}
			}

			.onboarding-stage__separator {
				width: 100%;
				border: 1px solid #fff3;
			}

			.onboarding-stage__name {
				width: 100%;
				display: flex;
				justify-content: space-between;
				gap: 0.75em;
			}
		}
	}

	.onboarding-stage-location {
		width: 60%;
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;

		.onboarding-back,
		.onboarding-submit,
		.onboarding-continue {
			width: 100%;
			background-color: #000;
			border-radius: var(--border-radius);
			padding: 1rem;

			&:hover {
				background-color: #222;
			}
		}
	}
}
```

### File: apps\web\styles\pages\auth\register.css

```css
.register {
	width: 100%;
	height: 85%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;

	h1,
	p {
		margin: 0;
		padding: 0;
	}

	.register__container {
		width: 60%;
		height: 80%;
		min-width: 300px;
		display: flex;
		align-items: center;

		.register__container__center {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
		}
	}

	.register__header {
		margin-bottom: 2rem;
		text-align: left;
		width: 100%;
		font-weight: 400;

		h1 {
			font-size: 4rem;
			margin-bottom: 0.5rem;
			font-weight: inherit;
		}
	}

	.register__field-error {
		font-size: 0.6em;
		color: red;
	}
}

.register__fields__container {
	height: 100%;
	width: 90%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 5rem;

	.register__fields {
		font-size: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;

		.register__fields__name {
			width: 100%;
			display: flex;
			align-items: center;
			gap: 1rem;
		}
	}
}

.register__actions {
	font-size: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
}

.switch-auth {
	width: 80%;
	display: flex;
	justify-content: end;
	align-items: center;
	gap: 0.5rem;

	.switch-auth__text {
		margin: 0;
		padding: 0;
		font-size: 1rem;
	}

	.switch-auth__link {
		color: white;
		text-decoration: none;
		font-size: 1rem;
		font-weight: bold;
		background-color: hsla(0, 100%, 100%, 0.2);
		padding: 0.5em 2em;
		border-radius: 4rem;

		&:hover {
			background-color: hsla(0, 100%, 100%, 0.1);
		}
	}
}
```

### File: apps\web\styles\pages\home\hero.css

```css
#hero {
	position: relative;
	height: 100%;
	width: 100%;

	&.home__hero {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.home__hero__bg {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: -1;
			overflow: hidden;
			/* background-color: red;  */

			.home__hero__bg__image {
				position: absolute;
				top: -1%;
				left: -1%;
				width: 102%;
				height: 102%;
				object-fit: cover;
				filter: brightness(0.5) blur(5px) saturate(0.8);
			}
		}

		.home__hero__content {
			display: flex;
			flex-direction: column;
			width: 75%;

			.home__hero__content__title {
				font-size: 4rem;
				color: white;
				font-weight: 600;
			}

			.home__hero__content__search {
				.search-bar {
					background-color: #202020;
					color: white;
				}
			}

			.home__hero__content__actions {
				display: flex;
				justify-content: center;
				gap: 1em;
				margin-top: 2em;

				a {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 0.4em 1.5em;
					padding-right: 0.75em;
					border-radius: 2em;
					font-size: 1.25em;
					font-weight: 500;
					gap: 1em;
				}

				.home__hero__content__actions__join {
					background-color: var(--primary);
					color: white;
				}

				.home__hero__content__actions__join:hover {
					background-color: var(--primary-hover);
					box-shadow: 0 0 8px var(--primary);
				}

				.home__hero__content__actions__explore {
					background-color: #fff3;
					border: 1px solid white;
					color: white;
				}

				.home__hero__content__actions__explore:hover {
					background-color: #fff5;
					box-shadow: 0 0 8px white;
				}
			}
		}
	}
}

/* #hero .home__hero__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  overflow: hidden;
}

#hero .home__hero__bg__image {
  position: absolute;
  top: -1%;
  left: -1%;
  width: 102%;
  height: 102%;
  object-fit: cover;
  filter: brightness(0.5) blur(5px) saturate(0.8);
}

#hero .home__hero__content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

#hero .home__hero__content__title {
  font-size: 4rem;
  color: white;
  font-weight: 600;
}

#hero .home__hero__content__search .search-bar {
  background-color: #202020;
  color: white;
}

#hero .home__hero__content__actions {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 2em;
}

#hero .home__hero__content__actions a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4em 1.5em;
  padding-right: 0.75em;
  border-radius: 2em;
  font-size: 1.25em;
  font-weight: 500;
  gap: 1em;
}

#hero .home__hero__content__actions__join {
  background-color: var(--primary);
  color: white;
}

#hero .home__hero__content__actions__join:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 0 8px var(--primary);
}

#hero .home__hero__content__actions__explore {
  background-color: #fff3;
  border: 1px solid white;
  color: white;
}

#hero .home__hero__content__actions__explore:hover {
  background-color: #fff5;
  box-shadow: 0 0 8px white;
} */
```

### File: apps\web\styles\pages\home\home.css

```css
.home {
	position: relative;
	padding: 0;
	margin: 0;

	height: calc(100% + var(--header-height) + 1rem);
	width: calc(100% + var(--side-nav-width) + 1rem);

	top: calc((var(--header-height) + 1rem) * -1);
	left: calc((var(--side-nav-width) + 1rem) * -1);
}
```

### File: apps\web\styles\pages\public\explore\search.css

```css
.search-page__container {
	display: flex;
	justify-content: center;
}

.search-page {
	width: 90%;

	.search-page__search {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		.search-page__search__title {
			font-size: 3rem;
			font-weight: bold;
			margin-bottom: 1rem;
		}

		.search-page__search__related {}

		.search-page__search__search-bar {}
	}

	.search-page__options {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1.5rem;
		margin-bottom: 2rem;

		.search-page__options__top,
		.search-page__options__bottom {
			width: 100%;
			display: flex;
			align-items: space-between;
		}

		.search-page__options__results-count,
		.search-page__options__category-type,
		.search-page__options__layout,
		.search-page__options__categories,
		.search-page__options__sort,
		.search-page__options__toggle-filter {
			width: 100%;
			margin: 0;
			padding: 0;
			display: flex;
		}

		.search-page__options__results-count,
		.search-page__options__toggle-filter {
			justify-content: left;
		}

		.search-page__options__category-type,
		.search-page__options__categories {
			justify-content: center;
		}

		.search-page__options__sort,
		.search-page__options__layout {
			justify-content: right;
		}

		.search-page__options__top {
			.search-page__options__sort button,
			.search-page__options__toggle-filter label {
				border: 1px solid var(--text-medium);
				color: var(--text);
				padding: 0.5em 2em;
				margin: 0;
				font-size: 1rem;
				cursor: pointer;
			}

			.search-page__options__sort * {
				border-radius: var(--border-radius);
			}

			.search-page__options__toggle-filter label {
				border-radius: 2em;
			}

			.search-page__options__categories {
				display: flex;
				gap: 0.5rem;

				label {
					padding: 0.5em 2em;
					border-radius: 2rem;
					text-align: center;
					width: 6rem;
					cursor: pointer;
					color: var(--text-medium);
					transition: all var(--fast);

					&:hover {
						background-color: var(--card);
					}

					&:has(input:checked) {
						background-color: var(--primary);
						color: white;
						font-weight: bold;
					}
				}
			}
		}

		.search-page__options__bottom {
			.search-page__options__layout {
				display: flex;
				gap: 0.5rem;

				label {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: 0.5rem;
					height: 2rem;
					width: 2rem;
					padding: 0.2rem;

					background: none;
					border-radius: var(--border-radius);

					outline: 1px solid var(--text-medium);
					color: var(--text-medium);

					cursor: pointer;

					&:has(input:checked) {
						background: var(--primary);
						color: white;
						outline: none;
					}
				}
			}

			.search-page__options__category-type {
				display: flex;
				gap: 0.5rem;

				label {
					padding: 0.5em 2em;
					text-align: center;
					margin: 0;
					width: 6rem;

					background: none;

					border-top: 1px solid var(--card);
					color: var(--text-medium);
					cursor: pointer;
					transition: all var(--fast);

					&:hover {
						background-color: var(--card);
						border-top: 1px solid var(--bg);
						border-radius: var(--border-radius);
					}

					&:has(input:checked) {
						background-color: var(--primary);
						color: white;
						border-top: 1px solid var(--bg);
						font-weight: bold;
						border-radius: var(--border-radius);
					}
				}
			}

			.search-page__options__results-count {
				p {
					margin: 0;
					padding: 0;
					font-size: 0.8rem;
					color: var(--text-medium);
				}
			}
		}
	}

	.search-page__results {
		display: flex;
		gap: 1rem;
		position: relative;

		.search-page__results__filters__container {
			width: 20vw;
			min-width: 20rem;
			min-height: 30rem;
			max-height: calc(100vh - var(--header-height) - 10rem);
			height: fit-content;
			position: sticky;
			background-color: var(--header);
			top: calc(var(--header-height) + 2rem);
			border-radius: var(--border-radius__large);
			padding: 2rem;
			display: flex;
			overflow-y: auto;

			/* .search-page__results__filters {
			    width: 100%;
			    height: fit-content;
			    position: sticky;
			    background-color: pink;
			} */
		}

		.search-page__results__content {
			background-color: var(--header);
			width: 100%;
			height: 200vh;
		}
	}
}
```

### File: apps\web\styles\styles.css

```css
@import 'themes/light.css';
@import 'themes/dark.css';

:root {
	--font-sans:
		ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
		'Apple Color Emoji', 'Segoe UI Emoji';
	--font-dyslexia: 'OpenDyslexic', Atkinson, var(--font-sans);

	--scale: 1;

	--primary-hue: 186;
	--primary-saturation: 57%;
	--primary-lightness: 36%;

	--primary: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
	--primary-hover: hsl(var(--primary-hue), var(--primary-saturation), 50%);
	--primary-active: hsl(var(--primary-hue), var(--primary-saturation), 60%);

	--primary-half: hsla(
		var(--primary-hue),
		var(--primary-saturation),
		var(--primary-lightness),
		0.5
	);

	--header-height: 4rem;
	--side-nav-width: 0;

	--border-radius__xsmall: 4px;
	--border-radius__small: 6px;
	--border-radius: 8px;
	--border-radius__large: 12px;
	--border-radius__xlarge: 16px;

	--fast: 100ms;
	--medium: 200ms;
	--slow: 300ms;

	background-color: var(--bg);
	color: var(--text);
	font-family: var(--font-sans);

	/* -- Palette -- */
	--input-bg: #ffffff;
	--input-border: #d1d5db;
	--input-text: #111827;
	--input-placeholder: #9ca3af;

	/* -- States -- */
	--input-focus-border: #3b82f6;
	--input-focus-ring: rgba(59, 130, 246, 0.25);
	--input-error-border: #ef4444;
	--input-error-text: #ef4444;
	--input-disabled-bg: #f3f4f6;
	--input-disabled-text: #9ca3af;

	/* -- Dropdown Specific -- */
	--dropdown-bg: #ffffff;
	--dropdown-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	--option-hover: #f3f4f6;
	--option-selected-bg: #eff6ff;
	--option-selected-text: #2563eb;

	/* -- Spacing & Radius -- */
	--input-radius: 0.375rem;
	--input-height: 2.5rem;
	--input-padding-x: 0.75rem;

	[data-sidebar-open] {
		--side-nav-width: 4rem;
	}

	[data-sidebar-open='true'] {
		--side-nav-width: 14rem;
	}
}

body {
	width: 100%;
	margin: 0;
	padding: 0;

	main {
		position: relative;
		margin: 0;
		padding: 0;
	}
}

.container {
	position: relative;
	height: calc(100vh - (var(--header-height) + 1rem));
	width: calc(100vw - (var(--side-nav-width) + 2.1rem));
	top: calc(var(--header-height) + 1rem);
	left: calc(var(--side-nav-width) + 1rem);
}

a {
	text-decoration: none;
	color: inherit;
	transition: all var(--fast);
}

input,
button {
	font-family: inherit;
	border: none;
	background: none;
	color: inherit;
	outline: none;
	border: none;
}

button {
	cursor: pointer;
	transition: all var(--fast);
}

[data-tooltip] {
	position: relative;
}

[data-tooltip]::before {
	content: attr(data-tooltip);
	position: absolute;
	left: 50%;
	top: calc(100% + 0.5rem);
	transform: translateX(-50%);
	color: var(--text-medium);
	background-color: var(--card);
	border: 1px solid var(--card-light);
	border-radius: var(--border-radius);
	padding: 0.25rem 1rem;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	transition: opacity var(--fast) ease;
	z-index: 100;
	font-size: 0.75rem;
}

[data-tooltip]:hover::before {
	opacity: 1;
}
```

### File: apps\web\styles\themes\dark.css

```css
:root[data-theme='dark'] {
	--bg: #222222;
	--header: #191919;
	--text: #ffffff;
	--text-medium: #999;
	--text-dark: #555555;
	--card: #303030;
	--card-dark: #202020;
	--card-light: #555555;
	--button-hover: #fff2;
	--button-hover-light: #fff6;

	--primary-hover: hsl(var(--primary-hue), var(--primary-saturation), 30%);
	--primary-active: hsl(var(--primary-hue), var(--primary-saturation), 20%);
	--primary-highlight: hsl(var(--primary-hue), var(--primary-saturation), 50%);
	--primary-highlight-active: hsl(var(--primary-hue), var(--primary-saturation), 55%);
}
```

### File: apps\web\styles\themes\dim.css

```css
```

### File: apps\web\styles\themes\dyslexia.css

```css
```

### File: apps\web\styles\themes\high-contrast.css

```css
```

### File: apps\web\styles\themes\light.css

```css
:root {
	--bg: #f0f0f0;
	--header: #ffffff;
	--text: #000000;
	--text-medium: #999;
	--text-dark: #bbbbbb;
	--card: #dfdfdf;
	--card-dark: #202020;
	--card-light: #555555;
	--button-hover: #0002;
	--button-hover-light: #0006;

	--primary-hover: hsl(var(--primary-hue), var(--primary-saturation), 30%);
	--primary-active: hsl(var(--primary-hue), var(--primary-saturation), 20%);
	--primary-highlight: hsl(var(--primary-hue), var(--primary-saturation), 50%);
	--primary-highlight-active: hsl(var(--primary-hue), var(--primary-saturation), 55%);
}
```

### File: apps\web\styles\themes\reduce-motion.css

```css
```

### File: apps\web\styles\themes\sepia.css

```css
```

### File: apps\web\types\fields\form.ts

```ts
import { VNode } from 'preact';

// deno-lint-ignore no-explicit-any
export interface BaseFieldProps<T = any> {
	// Core Binding
	name: string;
	value?: T;
	onChange?: (value: T) => void;

	// Identifiers
	id?: string;
	label?: string;

	// State
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;

	// Validation
	error?: string;
	success?: boolean;

	// Visuals
	placeholder?: string;
	hint?: string; // Bottom helper text (neutral)
	helperText?: string; // Bottom helper text (can be semantic)
	className?: string;

	// Layout
	floatingLabel?: boolean;

	// Slots (Generic icons for consistency)
	iconLeft?: VNode;
	iconRight?: VNode;
}
```

### File: apps\web\types\fields\select.ts

```ts
import { VNode } from 'preact';

export interface SelectOption {
	label: string;
	value: string | number;
	icon?: VNode;
	avatarUrl?: string;
	group?: string; // Group Header Label
	disabled?: boolean;
}

export interface SelectIcons {
	arrow?: VNode;
	arrowOpen?: VNode;
	clear?: VNode;
	loading?: VNode;
	valid?: VNode;
	invalid?: VNode;
}

export interface SelectFieldConfig {
	multiple?: boolean;
	clearable?: boolean;
	searchable?: boolean;
	placeholder?: string;
	loading?: boolean; // Async loading state

	// UX Features
	enableSelectAll?: boolean;
	displayMode?: 'chips-inside' | 'chips-below' | 'count' | 'comma';

	// Customization
	icons?: SelectIcons;

	// Optional Renderers
	renderOption?: (option: SelectOption) => VNode;
	renderSelection?: (selected: SelectOption[]) => VNode;
}
```

### File: apps\web\types\fields\slider.ts

```ts
import { BaseFieldProps } from './form.ts';

export interface SliderMark {
	value: number;
	label?: string;
}

export interface SliderFieldProps extends BaseFieldProps<number | number[]> {
	min?: number;
	max?: number;
	step?: number;
	range?: boolean;

	// --- Advanced Math ---
	scale?: 'linear' | 'logarithmic'; // Default: linear

	// --- Physics ---
	// Minimum gap between handles.
	// If set, prevents crossing and enables "pushing" behavior if dragging against another handle.
	minDistance?: number;

	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;

	vertical?: boolean;
	height?: string;
	tooltip?: boolean | ((val: number) => string);
	jumpOnClick?: boolean;
}
```

### File: apps\web\types\fields\text.ts

```ts
import { VNode } from 'preact';
import { BaseFieldProps } from './form.ts';

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'number'
	| 'search'
	| 'tel'
	| 'url';

export type InputMode =
	| 'text'
	| 'decimal'
	| 'numeric'
	| 'tel'
	| 'search'
	| 'email'
	| 'url';

export interface TextFieldProps extends BaseFieldProps<string | number> {
	type?: InputType;
	inputMode?: InputMode;

	// --- Variants & Presets ---
	// "default" is standard.
	// "currency" adds onBlur formatting.
	// "credit-card" adds masking + luhn validation.
	variant?: 'default' | 'currency' | 'credit-card' | 'percentage';

	// --- Masking ---
	mask?: string;

	multiline?: boolean;
	rows?: number;
	autoGrow?: boolean;

	maxLength?: number;
	showCount?: boolean;

	clearable?: boolean;
	showPasswordToggle?: boolean;

	prefix?: string | VNode;
	suffix?: string | VNode;

	onFocus?: (e: FocusEvent) => void;
	onBlur?: (e: FocusEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
}
```

### File: apps\web\utils.ts

```ts
// apps/web/utils/index.ts
import { createDefine } from 'fresh';

// Per-request state (you can mutate its fields)
export interface State {
	shared?: string;

	// Auth middleware flags
	refreshedTokens?: { access: string; refresh: string } | null;
	clearAuth?: boolean;
	isAuthenticated?: boolean;
	isOnboarded?: boolean;
}

export const define = createDefine<State>();
```

### File: db\functions\auth_project_or_dm_participant.sql

```sql
��- -   E x a m p l e   S Q L   f u n c t i o n 
 
 
```

### File: db\migrations\0001_init_schemas.sql

```sql
-- db/migrations/0001_init_schemas.sql

-- core schemas
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS comms;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS marketplace;
CREATE SCHEMA IF NOT EXISTS search;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS integrations;

-- enums
CREATE TYPE profile_type AS ENUM ('freelancer', 'business');
CREATE TYPE assignment_type AS ENUM ('freelancer', 'team');
CREATE TYPE visibility AS ENUM ('public', 'invite_only', 'unlisted');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE stage_status AS ENUM ('open','assigned','in_progress','submitted','approved','revisions','paid');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'refunded');
```

### File: db\migrations\0002_security_tables.sql

```sql
CREATE TABLE security.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  request_id uuid,
  actor_profile_id uuid,
  actor_team_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE security.feature_flags (
  key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feature_flags_pkey PRIMARY KEY (key)
);

CREATE TABLE security.refresh_tokens (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    revoked boolean NOT NULL DEFAULT false,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        replaced_by uuid,
        CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
        CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
        CONSTRAINT refresh_tokens_replaced_by_fkey FOREIGN KEY (replaced_by) REFERENCES security.refresh_tokens (id)
);

CREATE TABLE security.session_context (
    user_id uuid NOT NULL,
    active_profile_type USER - DEFINED NOT NULL,
    active_profile_id uuid NOT NULL,
    active_team_id uuid,
    updated_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT session_context_pkey PRIMARY KEY (user_id),
        CONSTRAINT session_context_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

CREATE TABLE security.turnstile_verifications (
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    user_id uuid,
    ip inet NOT NULL,
    token_prefix text NOT NULL,
    success boolean NOT NULL,
    created_at timestamp
    with
        time zone NOT NULL DEFAULT now(),
        CONSTRAINT turnstile_verifications_pkey PRIMARY KEY (id),
        CONSTRAINT turnstile_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);
```

### File: db\migrations\0003_org_tables.sql

```sql
CREATE TABLE org.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  legal_name text,
  logo_url text,
  country text,
  billing_email text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  headline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  timezone text,
  default_currency text
);

CREATE TABLE org.freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  hourly_rate integer,
  skills text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  timezone text,
  country text,
  visibility text NOT NULL DEFAULT 'public', 
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    slug text NOT NULL UNIQUE,
    label text NOT NULL
);

CREATE TABLE org.user_skills (
    user_id uuid NOT NULL REFERENCES auth.users (id),
    skill_id uuid NOT NULL REFERENCES org.skills (id),
    proficiency smallint,
    PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE org.users_public (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  avatar_url text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  headline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{}',
  timezone text,
  visibility text NOT NULL DEFAULT 'unlisted',
  first_name text,
  last_name text,
  username text NOT NULL UNIQUE
);

CREATE TABLE org.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL,
    owner_user_id uuid NOT NULL REFERENCES auth.users (id),
    description text NOT NULL DEFAULT '',
    visibility text NOT NULL DEFAULT 'invite_only',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org.team_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    team_id uuid NOT NULL REFERENCES org.teams (id),
    user_id uuid NOT NULL REFERENCES auth.users (id),
    role text NOT NULL DEFAULT 'freelancer',
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (team_id, user_id)
);

CREATE TABLE org.team_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    team_id uuid NOT NULL REFERENCES org.teams (id),
    title text NOT NULL,
    permissions jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE org.user_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES auth.users (id),
    email text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    verified_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, email)
);

CREATE TABLE org.attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_profile_id uuid NOT NULL,
    bucket text NOT NULL,
    path text NOT NULL,
    original_filename text NOT NULL,
    display_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    sha256 text,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org.attachments
ADD CONSTRAINT fk_attachments_owner_freelancer FOREIGN KEY (owner_profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE org.attachments
ADD CONSTRAINT fk_attachments_owner_business FOREIGN KEY (owner_profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE org.portfolios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    freelancer_profile_id uuid NOT NULL REFERENCES org.freelancer_profiles (id),
    title text NOT NULL,
    description text NOT NULL,
    cover_url text,
    attachment_id uuid REFERENCES org.attachments (id) ON DELETE SET NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE org.profile_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    profile_type text NOT NULL,
    profile_id uuid NOT NULL,
    kind text NOT NULL,
    url text NOT NULL,
    is_public boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE org.profile_links
ADD CONSTRAINT fk_profile_links_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE org.profile_links
ADD CONSTRAINT fk_profile_links_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE org.org_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    inviter_user_id uuid NOT NULL REFERENCES auth.users (id),
    target_email text NOT NULL,
    team_id uuid REFERENCES org.teams (id) ON DELETE CASCADE,
    business_profile_id uuid REFERENCES org.business_profiles (id) ON DELETE CASCADE,
    token text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);
```

### File: db\migrations\0004_ops_tables.sql

```sql
CREATE TABLE ops.admin_users (
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin'::text,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (user_id),
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT admin_users_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id)
);
```

### File: db\migrations\0005_projects_tables.sql

```sql
CREATE TABLE IF NOT EXISTS projects.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    client_business_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    title text NOT NULL,
    description text NOT NULL,
    status project_status NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_client_business ON projects.projects (client_business_id);

CREATE INDEX IF NOT EXISTS idx_projects_status_created_at ON projects.projects (status, created_at DESC);

CREATE TABLE IF NOT EXISTS projects.project_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    name text NOT NULL,
    "order" integer NOT NULL,
    description text NOT NULL,
    status stage_status NOT NULL DEFAULT 'open',
    due_date timestamptz NULL,
    completed_at timestamptz NULL,
    stage_type text NULL,
    ip_mode text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_stages_project_order ON projects.project_stages (project_id, "order");

CREATE INDEX IF NOT EXISTS idx_project_stages_project_status ON projects.project_stages (project_id, status);

CREATE TABLE IF NOT EXISTS projects.stage_budget_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    type text NOT NULL,
    amount_currency text NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    notes text NULL
);

CREATE INDEX IF NOT EXISTS idx_stage_budget_rules_stage ON projects.stage_budget_rules (project_stage_id);

CREATE TABLE IF NOT EXISTS projects.stage_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    assignee_type assignment_type NOT NULL,
    freelancer_profile_id uuid NULL REFERENCES org.freelancer_profiles (id) ON DELETE SET NULL,
    team_id uuid NULL REFERENCES org.teams (id) ON DELETE SET NULL,
    assigned_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    status text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_stage_assignments_assignee CHECK (
        (
            assignee_type = 'freelancer'
            AND freelancer_profile_id IS NOT NULL
            AND team_id IS NULL
        )
        OR (
            assignee_type = 'team'
            AND team_id IS NOT NULL
            AND freelancer_profile_id IS NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_stage_assignments_stage ON projects.stage_assignments (project_stage_id);

CREATE INDEX IF NOT EXISTS idx_stage_assignments_freelancer ON projects.stage_assignments (freelancer_profile_id)
WHERE
    freelancer_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stage_assignments_team ON projects.stage_assignments (team_id)
WHERE
    team_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS projects.stage_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    submitted_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stage_submissions_stage_created ON projects.stage_submissions (
    project_stage_id,
    created_at DESC
);

CREATE TABLE IF NOT EXISTS projects.stage_revision_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    requested_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    type text NOT NULL,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_stage_revision_requests_stage ON projects.stage_revision_requests (project_stage_id);

CREATE INDEX IF NOT EXISTS idx_stage_revision_requests_status ON projects.stage_revision_requests (status);

CREATE TABLE IF NOT EXISTS projects.maintenance_contracts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    freelancer_profile_id uuid NOT NULL REFERENCES org.freelancer_profiles (id) ON DELETE RESTRICT,
    business_profile_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
    currency text NOT NULL,
    interval text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_contracts_project ON projects.maintenance_contracts (project_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_contracts_business ON projects.maintenance_contracts (business_profile_id);

CREATE TABLE IF NOT EXISTS projects.project_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    profile_type profile_type NOT NULL,
    profile_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_project_participants_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_project_participants_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_participants_project_profile ON projects.project_participants (
    project_id,
    profile_type,
    profile_id
);

CREATE INDEX IF NOT EXISTS idx_project_participants_profile ON projects.project_participants (profile_type, profile_id);

CREATE TABLE IF NOT EXISTS projects.project_activity (
id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
project_id    uuid        NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
actor_user_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
kind          text        NOT NULL, 
payload       jsonb       NOT NULL DEFAULT '{}'::jsonb,
entity_table  text        NOT NULL,
entity_id     uuid        NOT NULL,
created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_activity_project_created ON projects.project_activity (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_activity_entity ON projects.project_activity (entity_table, entity_id);

COMMIT;
```

### File: db\migrations\0006_comms_tables.sql

```sql
CREATE TABLE IF NOT EXISTS comms.project_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    name text NOT NULL,
    stage_id uuid NULL REFERENCES projects.project_stages (id) ON DELETE SET NULL,
    visibility text NOT NULL DEFAULT 'project_all',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_project_channels_project_name UNIQUE (project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_project_channels_project ON comms.project_channels (project_id);

CREATE INDEX IF NOT EXISTS idx_project_channels_stage ON comms.project_channels (stage_id);

CREATE TABLE IF NOT EXISTS comms.project_channel_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    channel_id uuid NOT NULL REFERENCES comms.project_channels (id) ON DELETE CASCADE,
    profile_type profile_type NOT NULL,
    profile_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'participant',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_projchan_participant_freelancer FOREIGN KEY (profile_id) REFERENCES org.freelancer_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_projchan_participant_business FOREIGN KEY (profile_id) REFERENCES org.business_profiles (id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_project_channel_participant UNIQUE (
        channel_id,
        profile_type,
        profile_id
    )
);

CREATE INDEX IF NOT EXISTS idx_project_channel_participants_channel ON comms.project_channel_participants (channel_id);

CREATE INDEX IF NOT EXISTS idx_project_channel_participants_profile ON comms.project_channel_participants (profile_type, profile_id);

CREATE TABLE IF NOT EXISTS comms.project_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    channel_id uuid NOT NULL REFERENCES comms.project_channels (id) ON DELETE CASCADE,
    sender_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    edited_at timestamptz NULL,
    deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_project_messages_channel_created ON comms.project_messages (channel_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comms.dm_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    created_by_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_threads_creator ON comms.dm_threads (
    created_by_user_id,
    created_at DESC
);

CREATE TABLE IF NOT EXISTS comms.dm_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    thread_id uuid NOT NULL REFERENCES comms.dm_threads (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    joined_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_dm_participants_thread_user UNIQUE (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_participants_user ON comms.dm_participants (user_id);

CREATE TABLE IF NOT EXISTS comms.dm_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    thread_id uuid NOT NULL REFERENCES comms.dm_threads (id) ON DELETE CASCADE,
    sender_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_created ON comms.dm_messages (thread_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comms.message_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    message_table text NOT NULL,
    message_id uuid NOT NULL,
    attachment_id uuid NOT NULL REFERENCES org.attachments (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_message_attachments_table CHECK (
        message_table IN (
            'comms.project_messages',
            'comms.dm_messages'
        )
    ),
    CONSTRAINT uq_message_attachment UNIQUE (
        message_table,
        message_id,
        attachment_id
    )
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON comms.message_attachments (message_table, message_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_attachment ON comms.message_attachments (attachment_id);

CREATE TABLE IF NOT EXISTS comms.channel_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    channel_type text NOT NULL,
    channel_id uuid NOT NULL,
    attachment_id uuid NOT NULL REFERENCES org.attachments (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_channel_files_type CHECK (
        channel_type IN ('project', 'dm')
    ),
    CONSTRAINT uq_channel_files_channel_attachment UNIQUE (
        channel_type,
        channel_id,
        attachment_id
    )
);

CREATE INDEX IF NOT EXISTS idx_channel_files_channel ON comms.channel_files (channel_type, channel_id);

CREATE INDEX IF NOT EXISTS idx_channel_files_attachment ON comms.channel_files (attachment_id);

CREATE TABLE IF NOT EXISTS comms.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    entity_table text NULL,
    entity_id uuid NULL,
    read_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON comms.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON comms.notifications (user_id)
WHERE
    read_at IS NULL;

CREATE TABLE IF NOT EXISTS comms.notification_prefs (
    user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email boolean NOT NULL DEFAULT true,
    push boolean NOT NULL DEFAULT false,
    in_app boolean NOT NULL DEFAULT true,
    digest boolean NOT NULL DEFAULT false,
    quiet_hours tstzrange NULL
);

CREATE TABLE IF NOT EXISTS comms.device_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    provider text NOT NULL,
    token text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_device_tokens_provider_token UNIQUE (provider, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON comms.device_tokens (user_id);

DO $$
BEGIN
PERFORM 1
FROM pg_publication
WHERE pubname = 'supabase_realtime';

IF NOT FOUND THEN
CREATE PUBLICATION supabase_realtime;
END IF;
END;
$$;


ALTER TABLE comms.project_messages REPLICA IDENTITY FULL;

ALTER TABLE comms.dm_messages REPLICA IDENTITY FULL;

ALTER TABLE comms.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime
ADD
TABLE comms.project_messages,
comms.dm_messages,
comms.notifications;
```

### File: db\migrations\0007_finance_tables.sql

```sql
CREATE TABLE IF NOT EXISTS finance.wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_type text NOT NULL,
    owner_id uuid NOT NULL,
    currency text NOT NULL,
    balance_cents bigint NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_wallet_owner_currency UNIQUE (
        owner_type,
        owner_id,
        currency
    )
);

CREATE INDEX IF NOT EXISTS idx_wallets_owner ON finance.wallets (owner_type, owner_id);

CREATE TABLE IF NOT EXISTS finance.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    wallet_id uuid NOT NULL REFERENCES finance.wallets (id) ON DELETE CASCADE,
    direction text NOT NULL CHECK (
        direction IN ('credit', 'debit')
    ),
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    reason text NOT NULL,
    ref_table text NULL,
    ref_id uuid NULL,
    balance_after_cents bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_created ON finance.transactions (wallet_id, created_at DESC);

CREATE TABLE IF NOT EXISTS finance.escrows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE RESTRICT,
    payer_business_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    payee_type assignment_type NOT NULL,
    payee_id uuid NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    status text NOT NULL DEFAULT 'funded',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE finance.escrows
ADD CONSTRAINT fk_escrows_payee_freelancer FOREIGN KEY (payee_id) REFERENCES org.freelancer_profiles (id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE finance.escrows
ADD CONSTRAINT fk_escrows_payee_team FOREIGN KEY (payee_id) REFERENCES org.teams (id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS idx_escrows_stage ON finance.escrows (project_stage_id);

CREATE INDEX IF NOT EXISTS idx_escrows_payer_business ON finance.escrows (payer_business_id);

CREATE INDEX IF NOT EXISTS idx_escrows_payee ON finance.escrows (payee_type, payee_id);

CREATE TABLE IF NOT EXISTS finance.payout_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    owner_type text NOT NULL,
    owner_id uuid NOT NULL,
    provider text NOT NULL,
    account_id text NOT NULL,
    status text NOT NULL DEFAULT 'pending_verification',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_payout_accounts_provider_account UNIQUE (provider, account_id)
);

CREATE INDEX IF NOT EXISTS idx_payout_accounts_owner ON finance.payout_accounts (owner_type, owner_id);

CREATE TABLE IF NOT EXISTS finance.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_stage_id uuid NOT NULL REFERENCES projects.project_stages (id) ON DELETE CASCADE,
    issue_to_business_id uuid NOT NULL REFERENCES org.business_profiles (id) ON DELETE RESTRICT,
    issue_from_profile uuid NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_business ON finance.invoices (
    issue_to_business_id,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_invoices_stage ON finance.invoices (project_stage_id);

CREATE TABLE IF NOT EXISTS finance.disputes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    escrow_id uuid NOT NULL REFERENCES finance.escrows (id) ON DELETE CASCADE,
    opened_by_profile uuid NOT NULL,
    reason text NOT NULL,
    status dispute_status NOT NULL DEFAULT 'open',
    resolution_notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_disputes_escrow ON finance.disputes (escrow_id);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON finance.disputes (status, created_at DESC);

CREATE TABLE IF NOT EXISTS finance.dispute_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    dispute_id uuid NOT NULL REFERENCES finance.disputes (id) ON DELETE CASCADE,
    sender_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_created ON finance.dispute_messages (dispute_id, created_at ASC);

CREATE TABLE IF NOT EXISTS finance.ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    project_id uuid NOT NULL REFERENCES projects.projects (id) ON DELETE CASCADE,
    rater_profile uuid NOT NULL,
    ratee_type text NOT NULL,
    ratee_id uuid NOT NULL,
    score smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_ratee ON finance.ratings (ratee_type, ratee_id);

CREATE INDEX IF NOT EXISTS idx_ratings_project ON finance.ratings (project_id);

CREATE TABLE IF NOT EXISTS finance.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    profile_id uuid NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    started_at timestamptz NOT NULL DEFAULT now(),
    ends_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON finance.subscriptions (profile_id, status);
```

### File: db\migrations\0020_helpers_functions.sql

```sql
-- db/migrations/0004_helpers_functions.sql

-- NOTE: we rely on pgcrypto/gen_random_uuid(). Make sure extension is on.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- is_admin(): check ops.admin_users
CREATE OR REPLACE FUNCTION security.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM ops.admin_users au
    WHERE au.user_id = auth.uid()
  );
$$;

-- simple debug helper: return current JWT context
CREATE OR REPLACE FUNCTION security.current_context()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'user_id', auth.uid(),
    'active_profile_type', auth.jwt()->>'active_profile_type',
    'active_profile_id',   auth.jwt()->>'active_profile_id',
    'active_team_id',      auth.jwt()->>'active_team_id'
  );
$$;
```

### File: db\policies\org\business_profiles.sql

```sql
ALTER TABLE org.business_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: owner or admin
CREATE POLICY pol_org_business_profiles_select_owner
ON org.business_profiles
FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- INSERT: user can create business profiles for themselves
CREATE POLICY pol_org_business_profiles_insert_self
ON org.business_profiles
FOR INSERT
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: owner or admin
CREATE POLICY pol_org_business_profiles_update_owner
ON org.business_profiles
FOR UPDATE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
)
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- DELETE: owner or admin
CREATE POLICY pol_org_business_profiles_delete_owner
ON org.business_profiles
FOR DELETE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);
```

### File: db\policies\org\freelancer_profiles.sql

```sql
ALTER TABLE org.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: owner or admin
CREATE POLICY pol_org_freelancer_profiles_select_owner
ON org.freelancer_profiles
FOR SELECT
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- INSERT: user can create exactly one freelancer profile tied to themselves
CREATE POLICY pol_org_freelancer_profiles_insert_self
ON org.freelancer_profiles
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: only owner / admin can edit
CREATE POLICY pol_org_freelancer_profiles_update_owner
ON org.freelancer_profiles
FOR UPDATE
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
)
WITH CHECK (
  user_id = auth.uid()
  OR security.is_admin() = true
);

/* no DELETE */
```

### File: db\policies\org\teams.sql

```sql
ALTER TABLE org.teams ENABLE ROW LEVEL SECURITY;

-- SELECT: show teams you are a member of OR that you own OR admin
CREATE POLICY pol_org_teams_select_member_or_owner
ON org.teams
FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM org.team_memberships tm
    WHERE tm.team_id = id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
  OR security.is_admin() = true
);

-- INSERT: any user can create a team they own
CREATE POLICY pol_org_teams_insert_self
ON org.teams
FOR INSERT
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: only owner or admin
CREATE POLICY pol_org_teams_update_owner
ON org.teams
FOR UPDATE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
)
WITH CHECK (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);

-- DELETE: owner or admin
CREATE POLICY pol_org_teams_delete_owner
ON org.teams
FOR DELETE
USING (
  owner_user_id = auth.uid()
  OR security.is_admin() = true
);
```

### File: db\policies\org\team_memberships.sql

```sql
ALTER TABLE org.team_memberships ENABLE ROW LEVEL SECURITY;

-- SELECT: any active member of the same team may view
CREATE POLICY pol_org_team_memberships_select_team_member
ON org.team_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM org.team_memberships me
    WHERE me.team_id = team_memberships.team_id
      AND me.user_id = auth.uid()
      AND me.status = 'active'
  )
  OR security.is_admin() = true
);

-- INSERT: only team owner (or admin) can add members
CREATE POLICY pol_org_team_memberships_insert_team_owner
ON org.team_memberships
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_id
      AND t.owner_user_id = auth.uid()
  )
  OR security.is_admin() = true
);

-- UPDATE: team owner, team_lead/admin role, or platform admin
CREATE POLICY pol_org_team_memberships_update_team_owner
ON org.team_memberships
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_memberships.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM org.team_memberships me
    WHERE me.team_id = team_memberships.team_id
      AND me.user_id = auth.uid()
      AND me.role IN ('team_lead','admin')
      AND me.status = 'active'
  )
  OR security.is_admin() = true
)
WITH CHECK (
  TRUE
);

-- DELETE: same as update (remove member)
CREATE POLICY pol_org_team_memberships_delete_team_owner
ON org.team_memberships
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM org.teams t
    WHERE t.id = team_memberships.team_id
      AND t.owner_user_id = auth.uid()
  )
  OR security.is_admin() = true
);
```

### File: db\policies\org\users_public.sql

```sql
��A L T E R   T A B L E   o r g . u s e r s _ p u b l i c   E N A B L E   R O W   L E V E L   S E C U R I T Y ; 
 
 
 
 - -   A n y   l o g g e d - i n   u s e r   c a n   r e a d   p u b l i c   p r o f i l e s 
 
 C R E A T E   P O L I C Y   p o l _ o r g _ u s e r s _ p u b l i c _ s e l e c t _ a l l _ a u t h 
 
 O N   o r g . u s e r s _ p u b l i c 
 
 F O R   S E L E C T 
 
 U S I N G   (   a u t h . u i d ( )   I S   N O T   N U L L   ) ; 
 
 
 
 - -   U s e r   c a n   c r e a t e   t h e i r   o w n   p u b l i c   r o w 
 
 C R E A T E   P O L I C Y   p o l _ o r g _ u s e r s _ p u b l i c _ i n s e r t _ s e l f 
 
 O N   o r g . u s e r s _ p u b l i c 
 
 F O R   I N S E R T 
 
 W I T H   C H E C K   ( 
 
     u s e r _ i d   =   a u t h . u i d ( ) 
 
     O R   s e c u r i t y . i s _ a d m i n ( )   =   t r u e 
 
 ) ; 
 
 
 
 - -   U s e r   c a n   u p d a t e   o n l y   t h e i r   o w n   r o w   ( o r   a d m i n   c a n ) 
 
 C R E A T E   P O L I C Y   p o l _ o r g _ u s e r s _ p u b l i c _ u p d a t e _ s e l f 
 
 O N   o r g . u s e r s _ p u b l i c 
 
 F O R   U P D A T E 
 
 U S I N G   ( 
 
     u s e r _ i d   =   a u t h . u i d ( ) 
 
     O R   s e c u r i t y . i s _ a d m i n ( )   =   t r u e 
 
 ) 
 
 W I T H   C H E C K   ( 
 
     u s e r _ i d   =   a u t h . u i d ( ) 
 
     O R   s e c u r i t y . i s _ a d m i n ( )   =   t r u e 
 
 ) ; 
 
 
 
 / *   n o   D E L E T E   * / 
 
 
```

### File: db\policies\org\user_emails.sql

```sql
ALTER TABLE org.user_emails ENABLE ROW LEVEL SECURITY;

-- SELECT: you can read only your own email records
CREATE POLICY pol_org_user_emails_select_self
ON org.user_emails
FOR SELECT
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- INSERT: you can add an email for yourself
CREATE POLICY pol_org_user_emails_insert_self
ON org.user_emails
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- UPDATE: you can update only your own row
CREATE POLICY pol_org_user_emails_update_self
ON org.user_emails
FOR UPDATE
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
)
WITH CHECK (
  user_id = auth.uid()
  OR security.is_admin() = true
);

-- DELETE: you can delete only your own row
CREATE POLICY pol_org_user_emails_delete_self
ON org.user_emails
FOR DELETE
USING (
  user_id = auth.uid()
  OR security.is_admin() = true
);
```

### File: db\policies\security\audit_logs.sql

```sql
ALTER TABLE security.audit_logs ENABLE ROW LEVEL SECURITY;

-- allow a user to read only their own audit trail, plus admins
CREATE POLICY pol_security_audit_logs_select_self_or_admin
ON security.audit_logs
FOR SELECT
USING (
  audit_logs.user_id = auth.uid()
  OR security.is_admin() = true
);

-- no INSERT/UPDATE/DELETE policies for public
-- audit rows are inserted by service_role from the API layer
```

### File: db\policies\security\refresh_tokens.sql

```sql
ALTER TABLE security.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- DO NOT expose refresh tokens to regular users at all.
-- No SELECT/INSERT/UPDATE/DELETE policies on purpose.

-- Only service_role should ever touch this table, and service_role bypasses RLS.
-- That means from the browser you literally cannot query this table.
```

### File: db\policies\security\session_context.sql

```sql
ALTER TABLE security.session_context ENABLE ROW LEVEL SECURITY;

-- SELECT own context
CREATE POLICY pol_security_session_context_select_self
ON security.session_context
FOR SELECT
USING ( user_id = auth.uid() );

-- INSERT own context
CREATE POLICY pol_security_session_context_insert_self
ON security.session_context
FOR INSERT
WITH CHECK ( user_id = auth.uid() );

-- UPDATE own context
CREATE POLICY pol_security_session_context_update_self
ON security.session_context
FOR UPDATE
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() );

-- no DELETE policy for normal users
```

### File: db\policies\security\v_current_context.sql

```sql
ALTER VIEW security.v_current_context SET (security_invoker = true);

-- Views don’t use RLS directly, so we do NOT need policies here.
-- The WHERE clause already ties it to auth.uid().
-- (If Supabase complains about querying this view from the client,
-- you can instead expose a helper RPC function.)
```

### File: db\views\analytics_earnings_by_stage_mv.sql

```sql
��- -   E x a m p l e   m a t e r i a l i z e d   v i e w 
 
 
```

### File: db\views\security\v_current_context.sql

```sql
CREATE OR REPLACE VIEW security.v_current_context AS
SELECT
  sc.user_id,
  sc.active_profile_type,
  sc.active_profile_id,
  sc.active_team_id,
  sc.updated_at
FROM security.session_context sc
WHERE sc.user_id = auth.uid();
```

### File: deno.json

```json
{
	"nodeModulesDir": "auto",
	"workspace": [
		"./apps/web",
		"./packages/shared",
		"./packages/backend",
		"./packages/ui"
	],
	"tasks": {
		"format": "deno fmt --check",
		"lint": "deno lint",
		"typecheck": "deno check",
		"names": "deno run -A scripts/validate_names.ts",
		"check": "deno fmt --check && deno lint && deno check && deno run -A scripts/validate_names.ts",
		"test": "deno test --fail-fast --coverage=coverage -A --trace-leaks",
		"dev": "vite --port 3000 --open --host --mode development",
		"build": "vite build --mode production",
		"start": "deno serve -A --watch --port 3000 --env-file=.env.production apps/web/_fresh/server.js",
		"update": "deno run -A -r jsr:@fresh/update .",
		"db:reset": "bash db/scripts/test_db_reset.sh",
		"db:smoke": "supabase db query < db/scripts/test_db_smoke.sql",
		"coverage:lcov": "deno coverage coverage --lcov --output=coverage.lcov",
		"coverage:html": "deno coverage coverage --html",
		"preview": "deno run -A main.ts"
	},
	"fmt": {
		"files": {
			"include": [
				"apps/web/**/*",
				"routes/**/*",
				"islands/**/*",
				"components/**/*",
				"features/**/*",
				"plugins/**/*",
				"utils/**/*",
				"services/**/*",
				"scripts/**/*",
				"lib/**/*",
				"_fresh/**/*",
				"*.ts",
				"*.tsx",
				"*.js",
				"*.jsx",
				"*.css"
			],
			"exclude": [
				"node_modules/**",
				"dist/**",
				"tmp/**",
				"infra/**",
				"supabase/**",
				"**/*.md"
			]
		},
		"options": {
			"lineWidth": 100,
			"indentWidth": 2,
			"useTabs": true,
			"singleQuote": true
		}
	},
	"lint": {
		"files": {
			"include": [
				"apps/web/**/*",
				"routes/**/*",
				"islands/**/*",
				"components/**/*",
				"features/**/*",
				"plugins/**/*",
				"utils/**/*",
				"services/**/*",
				"scripts/**/*",
				"lib/**/*",
				"*.ts",
				"*.tsx",
				"*.js",
				"*.jsx"
			],
			"exclude": [
				"node_modules/**",
				"dist/**",
				"tmp/**",
				"infra/**",
				"supabase/**",
				"**/*.md"
			]
		},
		"rules": { "tags": ["recommended", "fresh"] }
	},
	"compilerOptions": {
		"lib": ["dom", "dom.asynciterable", "dom.iterable", "deno.ns"],
		"jsx": "react-jsx",
		"jsxImportSource": "preact",
		"jsxPrecompileSkipElements": [
			"a",
			"img",
			"source",
			"body",
			"html",
			"head",
			"title",
			"meta",
			"script",
			"link",
			"style",
			"base",
			"noscript",
			"template"
		],
		"types": ["vite/client"]
	},
	"imports": {
		"@std/assert": "jsr:@std/assert@^1.0.15",
		"@std/dotenv": "jsr:@std/dotenv@^0.225.5",
		"@std/http": "jsr:@std/http@^1.0.21",
		"@fresh/plugin-vite": "jsr:@fresh/plugin-vite@^1.0.8",
		"@preact/signals": "npm:@preact/signals@^2.5.0",
		"@std/regexp": "jsr:@std/regexp@^1.0.1",
		"@tabler/icons-preact": "npm:@tabler/icons-preact@^3.35.0",
		"djwt": "jsr:@zaubrik/djwt@^3.0.2",
		"fresh": "jsr:@fresh/core@^2.2.0",
		"preact": "npm:preact@^10.27.2",
		"supabaseClient": "npm:@supabase/supabase-js@2.76.1",

		"packages/": "./packages/",
		"@shared": "./packages/shared/mod.ts",
		"@projective/backend": "./packages/backend/mod.ts",
		"@ui": "./packages/ui/mod.ts",

		"@/": "./apps/web/",
		"@components/": "./apps/web/components/",
		"@islands/": "./apps/web/islands/",
		"@styles/": "./apps/web/styles/",
		"@server/": "./apps/web/server/",
		"@contracts/": "./apps/web/contracts/",
		"@utils": "./apps/web/utils.ts"
	},
	"exclude": ["**/_fresh/*"]
}
```

### File: packages\backend\auth\jwt.ts

```ts
import { ENV } from '../config.ts';

// packages/server-utils/jwt.ts
let _jwtKey: CryptoKey | null = null;

export async function getJwtKey(): Promise<CryptoKey> {
	if (_jwtKey) return _jwtKey;

	// ENV.JWT_SECRET is a string. We have to turn it into bytes for importKey.
	const raw = new TextEncoder().encode(ENV.JWT_SECRET);

	_jwtKey = await crypto.subtle.importKey(
		'raw',
		raw,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify'],
	);

	return _jwtKey;
}
```

### File: packages\backend\auth\tokens.ts

```ts
import { create } from 'djwt';
import { hashArgon2id, randomTokenString } from '../crypto.ts';
import { getJwtKey } from './jwt.ts'; // <-- new

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // ~30 days

export type SessionClaims = {
	userId: string;
	activeProfileType: 'freelancer' | 'business' | null;
	activeProfileId: string | null;
	activeTeamId: string | null;
};

export async function mintAccessToken(claims: SessionClaims) {
	const exp = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;

	const payload = {
		sub: claims.userId,
		active_profile_type: claims.activeProfileType,
		active_profile_id: claims.activeProfileId,
		active_team_id: claims.activeTeamId,
		exp,
	};

	const key = await getJwtKey();

	const token = await create(
		{ alg: 'HS256', typ: 'JWT' },
		payload,
		key,
	);

	return { token, exp };
}

/**
 * Creates a new refresh token (opaque random string),
 * hashes it, and returns both the plaintext token (for cookie)
 * and the hash (for DB storage).
 */
export async function mintRefreshToken() {
	const plaintext = randomTokenString(32);
	const hash = await hashArgon2id(plaintext);
	const exp = Math.floor(Date.now() / 1000) + REFRESH_TTL_SECONDS;
	return { plaintext, hash, exp };
}

export function buildAccessCookie(accessToken: string, maxAgeSeconds = ACCESS_TTL_SECONDS) {
	return [
		'access_token=',
		accessToken,
		'; HttpOnly',
		'; Secure',
		'; SameSite=Lax',
		`; Max-Age=${maxAgeSeconds}`,
		'; Path=/',
	].join('');
}

export function buildRefreshCookie(refreshToken: string) {
	return [
		'refresh_token=',
		refreshToken,
		'; HttpOnly',
		'; Secure',
		'; SameSite=Lax',
		'; Path=/api/v1/auth',
	].join('');
}
```

### File: packages\backend\config.ts

```ts
import { loadSync } from '@std/dotenv';

loadSync({ export: true });

const mode = Deno.env.get('MODE') ??
	Deno.env.get('NODE_ENV') ??
	Deno.env.get('VITE_MODE') ??
	'development';

loadSync({ envPath: `.env.${mode}`, export: true });

function requireEnv(name: string): string {
	const value = Deno.env.get(name);
	if (!value) {
		console.error(`Missing required env var: ${name}`);
		if (Deno.env.get('DENO_DEPLOYMENT_ID')) return '';
		throw new Error(`Missing env: ${name}`);
	}
	return value;
}

export const Config = {
	SUPABASE_URL: requireEnv('SUPABASE_URL'),
	SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
	JWT_SECRET: requireEnv('JWT_SECRET'),
	APP_ENV: Deno.env.get('APP_ENV') ?? 'development',
	BASE_URL: Deno.env.get('URL'),
};
```

### File: packages\backend\cookies.ts

```ts
import { type Cookie, deleteCookie, getCookies, setCookie } from '@std/http/cookie';

type SetAuthOpts = {
	accessToken: string;
	refreshToken: string;
	/** Pass the current request URL so we can decide secure + naming correctly. */
	requestUrl: URL;
};

/** Local dev can’t use __Host-* (requires secure + no Domain + Path=/ on HTTPS). */
function resolveCookieNames(isSecureOrigin: boolean, isLocalhost: boolean) {
	if (isSecureOrigin && !isLocalhost) {
		return { ACCESS_NAME: '__Host-pjv-at', REFRESH_NAME: '__Host-pjv-rt' };
	}
	return { ACCESS_NAME: 'pjv-at', REFRESH_NAME: 'pjv-rt' };
}

function isLocalhostHost(hostname: string) {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]' ||
		/\.local(domain)?$/i.test(hostname)
	);
}

export function setAuthCookies(
	headers: Headers,
	{ accessToken, refreshToken, requestUrl }: SetAuthOpts,
) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	const { ACCESS_NAME, REFRESH_NAME } = resolveCookieNames(isSecureOrigin, isLocal);

	// Common attributes for auth cookies
	const common: Partial<Cookie> = {
		httpOnly: true,
		sameSite: 'Lax',
		secure: isSecureOrigin && !isLocal, // never mark Secure on localhost
		path: '/', // required for __Host-* and fine for non-__Host too
	};

	// Access: ~15 minutes
	setCookie(headers, {
		...common,
		name: ACCESS_NAME,
		value: accessToken,
		maxAge: 60 * 15,
	});

	// Refresh: ~30 days
	setCookie(headers, {
		...common,
		name: REFRESH_NAME,
		value: refreshToken,
		maxAge: 60 * 60 * 24 * 30,
	});

	// CSRF (readable) — double-submit token, same naming irrespective of env
	setCookie(headers, {
		name: 'pjv-csrf',
		value: randomToken(),
		httpOnly: false, // must be readable by JS
		sameSite: 'Lax',
		secure: isSecureOrigin && !isLocal,
		path: '/',
		maxAge: 60 * 60 * 24 * 30,
	});
}

export function clearAuthCookies(headers: Headers, requestUrl: URL) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	const { ACCESS_NAME, REFRESH_NAME } = resolveCookieNames(isSecureOrigin, isLocal);

	const base = { path: '/', secure: isSecureOrigin && !isLocal } as const;

	// Delete both possible names just in case a previous env wrote the other variant.
	deleteCookie(headers, ACCESS_NAME, base);
	deleteCookie(headers, REFRESH_NAME, base);
	deleteCookie(headers, 'pjv-csrf', base);

	// Also try deleting the opposite flavor to avoid sticky leftovers across envs.
	deleteCookie(headers, '__Host-pjv-at', base);
	deleteCookie(headers, '__Host-pjv-rt', base);
	deleteCookie(headers, 'pjv-at', base);
	deleteCookie(headers, 'pjv-rt', base);
}

export function getAuthCookies(req: Request) {
	const c = getCookies(req.headers);
	// Support both name variants seamlessly.
	const accessToken = c['__Host-pjv-at'] ?? c['pjv-at'];
	const refreshToken = c['__Host-pjv-rt'] ?? c['pjv-rt'];
	return {
		accessToken,
		refreshToken,
		csrf: c['pjv-csrf'],
	};
}

// ---- CSRF helpers ----

export function verifyCsrf(req: Request): boolean {
	const method = req.method.toUpperCase();
	if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;

	const cookies = getCookies(req.headers);
	const sent = req.headers.get('X-CSRF');
	const expected = cookies['pjv-csrf'];
	return Boolean(sent && expected && sent === expected);
}

// Generate a CSRF token
function randomToken(bytes = 32) {
	const a = new Uint8Array(bytes);
	crypto.getRandomValues(a);
	return btoa(String.fromCharCode(...a)).replace(/=+$/, '');
}
```

### File: packages\backend\crypto.ts

```ts
// packages/server-utils/crypto.ts

// Generate URL-safe random string (base64-ish) for refresh tokens
export function randomTokenString(byteLength = 32): string {
	const raw = crypto.getRandomValues(new Uint8Array(byteLength));
	// convert Uint8Array -> binary string -> base64
	const bin = String.fromCharCode(...raw);
	return btoa(bin); // you can further make it URL-safe if you want
}

// TODO: replace with real Argon2id
export async function hashArgon2id(value: string): Promise<string> {
	// WARNING: placeholder.
	// You MUST replace this with a secure Argon2id hash implementation
	// before production. We're returning a SHA-256 for now just so dev works.
	const data = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const bytes = new Uint8Array(digest);
	return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}
```

### File: packages\backend\deno.json

```json
{
	"name": "@projective/backend",
	"version": "0.0.0",
	"exports": "./mod.ts"
}
```

### File: packages\backend\mod.ts

```ts
import { loadSync } from '@std/dotenv';

loadSync({ export: true });

export * from './config.ts';
export * from './crypto.ts';
export * from './auth/jwt.ts';
export * from './auth/tokens.ts';
export * from './cookies.ts';
export * from './rateLimiter.ts';
```

### File: packages\backend\rateLimiter.ts

```ts
type BucketInfo = {
	count: number;
	resetAt: number;
};

// Note: In a serverless environment (Deno Deploy), this Map is not shared across regions/isolates.
// For strict global rate limiting, you must use Deno KV.
// For now, this is "per-isolate" limiting.
const buckets = new Map<string, BucketInfo>();

export function rateLimitByIP(ip: string, limit = 20, windowMs = 60_000) {
	const now = Date.now();
	const bucket = buckets.get(ip);

	if (!bucket || now > bucket.resetAt) {
		buckets.set(ip, {
			count: 1,
			resetAt: now + windowMs,
		});
		return { allowed: true, remaining: limit - 1 };
	}

	if (bucket.count >= limit) {
		return { allowed: false, remaining: 0 };
	}

	bucket.count += 1;
	return { allowed: true, remaining: limit - bucket.count };
}
```

### File: packages\shared\cookies.ts

```ts
export function getCsrfToken(name = 'pjv-csrf'): string | null {
	const cookie = typeof document !== 'undefined' ? document.cookie : '';
	if (!cookie) return null;

	const match = cookie.match(
		new RegExp('(?:^|; )' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)'),
	);

	return match ? decodeURIComponent(match[1]) : null;
}
```

### File: packages\shared\deno.json

```json
{
	"name": "@shared",
	"version": "0.0.0",
	"exports": "./mod.ts"
}
```

### File: packages\shared\math.ts

```ts
export function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(val, min), max);
}

export function roundToStep(val: number, step: number): number {
	if (step <= 0) return val;
	const inverse = 1 / step;
	return Math.round(val * inverse) / inverse;
}

export function snapToClosest(val: number, points: number[]): number {
	if (!points.length) return val;
	return points.reduce((prev, curr) => Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
}

// --- Linear Scale ---

export function valueToPercent(val: number, min: number, max: number): number {
	if (max === min) return 0;
	const pct = ((val - min) / (max - min)) * 100;
	return clamp(pct, 0, 100);
}

export function percentToValue(percent: number, min: number, max: number): number {
	const val = min + (percent / 100) * (max - min);
	return clamp(val, min, max);
}

// --- Logarithmic Scale ---

export function valueToPercentLog(val: number, min: number, max: number): number {
	// Log scale cannot handle <= 0. Clamp to 1 if needed or handle logic higher up.
	const safeMin = min <= 0 ? 1 : min;
	const safeVal = val <= safeMin ? safeMin : val;

	const minLog = Math.log(safeMin);
	const maxLog = Math.log(max);
	const valLog = Math.log(safeVal);

	const pct = ((valLog - minLog) / (maxLog - minLog)) * 100;
	return clamp(pct, 0, 100);
}

export function percentToValueLog(percent: number, min: number, max: number): number {
	const safeMin = min <= 0 ? 1 : min;
	const minLog = Math.log(safeMin);
	const maxLog = Math.log(max);

	const scale = (maxLog - minLog) / 100;
	const val = Math.exp(minLog + scale * percent);
	return clamp(val, safeMin, max);
}
```

### File: packages\shared\mod.ts

```ts
// export * from './types.ts';
export * from './validation/auth.ts';
export * from './cookies.ts';
export * from './math.ts';
export * from './validation/validators.ts';
export * from './validation/formatters.ts';
```

### File: packages\shared\types.ts

```ts
```

### File: packages\shared\validation\auth.ts

```ts
import { escape } from '@std/regexp/escape';

export type RegisterFields = {
	email: string;
	password: string;
	confirmPassword: string;
};

export type RegisterErrors = {
	email?: string;
	password?: string;
	confirmPassword?: string;
};

export class AuthValidator {
	// --- email validation ---
	static validateEmail(email: string): string | null {
		const trimmed = email.trim();
		if (!trimmed) return 'Email is required.';
		// Basic regex, can be improved
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(trimmed)) return 'Enter a valid email address.';
		return null;
	}

	// --- password validation ---
	static validatePassword(password: string, email?: string): string | null {
		if (!password) {
			return 'Password is required.';
		}

		if (password.length < 8) {
			return 'Password must be at least 8 characters long.';
		}

		if (!/[a-z]/.test(password)) {
			return 'Password must contain at least one lowercase letter.';
		}

		if (!/[A-Z]/.test(password)) {
			return 'Password must contain at least one uppercase letter.';
		}

		if (!/[0-9]/.test(password)) {
			return 'Password must contain at least one digit.';
		}

		if (!/[^A-Za-z0-9]/.test(password)) {
			return 'Password must contain at least one symbol.';
		}

		if (/\s/.test(password)) {
			return 'Password must not contain spaces.';
		}

		if (email) {
			const trimmedEmail = email.trim();
			if (trimmedEmail) {
				const escapedEmail = escape(trimmedEmail);
				const emailInPassword = new RegExp(escapedEmail, 'i');

				if (emailInPassword.test(password)) {
					return 'Password must not contain your email.';
				}
			}
		}

		return null;
	}

	// --- confirm password validation ---
	static validateConfirmPassword(
		password: string,
		confirmPassword: string,
	): string | null {
		if (!confirmPassword) {
			return 'Please confirm your password.';
		}

		if (password !== confirmPassword) {
			return 'Passwords do not match.';
		}

		return null;
	}

	// --- full validation entrypoint ---
	static validate(
		fields: RegisterFields,
	): { ok: boolean; errors: RegisterErrors } {
		const errors: RegisterErrors = {};

		const emailError = this.validateEmail(fields.email);
		if (emailError) errors.email = emailError;

		const passwordError = this.validatePassword(
			fields.password,
			fields.email,
		);
		if (passwordError) errors.password = passwordError;

		const confirmError = this.validateConfirmPassword(
			fields.password,
			fields.confirmPassword,
		);
		if (confirmError) errors.confirmPassword = confirmError;

		const ok = Object.keys(errors).length === 0;

		return { ok, errors };
	}
}
```

### File: packages\shared\validation\formatters.ts

```ts
/**
 * Formats a number string into a currency string.
 * e.g. "1234.5" -> "$1,234.50"
 */
export function formatCurrency(value: string | number, currency = 'USD'): string {
	if (value === '' || value === null || value === undefined) return '';

	const num = typeof value === 'string' ? parseFloat(value) : value;
	if (isNaN(num)) return '';

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

/**
 * Strips formatting characters to return a raw number string.
 * e.g. "$1,234.50" -> "1234.5"
 */
export function parseNumber(value: string): string {
	// Remove all non-numeric characters except the first decimal point
	return value.replace(/[^0-9.]/g, '');
}
```

### File: packages\shared\validation\validators.ts

```ts
/**
 * Validates a credit card number using the Luhn Algorithm.
 * Returns true if valid.
 */
export function isValidCreditCard(value: string): boolean {
	// Remove spaces/dashes
	const digits = value.replace(/\D/g, '');

	if (digits.length < 13 || digits.length > 19) return false;

	let sum = 0;
	let shouldDouble = false;

	// Loop backwards
	for (let i = digits.length - 1; i >= 0; i--) {
		let digit = parseInt(digits.charAt(i));

		if (shouldDouble) {
			if ((digit *= 2) > 9) digit -= 9;
		}

		sum += digit;
		shouldDouble = !shouldDouble;
	}

	return sum % 10 === 0;
}
```

### File: packages\ui\deno.json

```json
{
	"name": "@ui",
	"version": "0.0.0",
	"exports": "./mod.ts"
}
```

### File: packages\ui\mod.ts

```ts
export * from './utils/ThemeSwitcher.ts';
```

### File: packages\ui\utils\ThemeSwitcher.ts

```ts
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
```

### File: scripts\validate_names.ts

```ts
// scripts/validate_names.ts
// Adds support for special route files that start with "_" (e.g. _app, _layout, _middleware, _404)

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pascal = /^[A-Z][A-Za-z0-9]*$/;

function isDynamicSegment(name: string) {
	return /^\[.+\]$/.test(name);
}

function isSpecialRouteBase(base: string) {
	if (!base.startsWith('_')) return false;
	const rest = base.slice(1);

	// Allow numeric error pages like _404, _500
	if (/^\d+$/.test(rest)) return true;

	// Common special names (Fresh/Next-style)
	const specials = new Set([
		'app',
		'layout',
		'middleware',
		'document',
		'error',
		'404',
		'500',
	]);
	if (specials.has(rest)) return true;

	// Or allow "_<kebab-case>" generally (e.g., _app-shell)
	if (kebab.test(rest)) return true;

	return false;
}

function norm(p: string) {
	return p.replaceAll('\\', '/');
}

async function* walk(dir: string): AsyncGenerator<string> {
	try {
		for await (const entry of Deno.readDir(dir)) {
			const p = `${dir}/${entry.name}`;
			if (entry.isDirectory) yield* walk(p);
			else yield p;
		}
	} catch {
		// ignore missing dirs
	}
}

function pathHasSegment(p: string, segment: 'routes' | 'islands' | 'components'): boolean {
	const parts = norm(p).split('/');
	return parts.includes(segment);
}

function nearestSegmentRoot(p: string, segment: 'routes' | 'islands' | 'components'): string {
	const parts = norm(p).split('/');
	const idx = parts.lastIndexOf(segment);
	return idx >= 0 ? parts.slice(0, idx + 1).join('/') : segment;
}

function checkRoutesPath(filePath: string): string[] {
	const errors: string[] = [];
	const normalized = norm(filePath);
	const root = nearestSegmentRoot(normalized, 'routes');
	const rel = normalized.slice(root.length + 1); // part under routes/

	const parts = rel.split('/');

	// Validate route directories (not filenames)
	for (let i = 0; i < parts.length - 1; i++) {
		const seg = parts[i];
		if (isDynamicSegment(seg)) continue; // allow [id], [...all]
		if (/\s/.test(seg)) errors.push(`folder "${seg}" must not contain spaces`);
		if (/[A-Z]/.test(seg)) errors.push(`folder "${seg}" must not contain uppercase`);
		if (!kebab.test(seg)) errors.push(`folder "${seg}" must be kebab-case or [dynamic]`);
	}

	// Validate filename
	const file = parts[parts.length - 1];
	const extMatch = file.match(/\.(tsx|ts|jsx|js)$/);
	if (!extMatch) return errors; // only care about code files

	const base = file.replace(/\.(tsx|ts|jsx|js)$/, '');
	if (
		base === 'index' ||
		isDynamicSegment(base) ||
		isSpecialRouteBase(base) // <-- NEW: allow _app, _layout, _404, or _<kebab>
	) {
		return errors;
	}

	if (/\s/.test(base)) errors.push(`file "${file}" must not contain spaces`);
	if (/[A-Z]/.test(base)) errors.push(`file "${file}" must not contain uppercase`);
	if (!kebab.test(base)) {
		errors.push(`file "${file}" must be kebab-case (or [dynamic]/index/_special)`);
	}

	return errors.map((e) => `routes: ${e} -> ${normalized}`);
}

function checkPascalDir(filePath: string, segment: 'islands' | 'components'): string[] {
	const errors: string[] = [];
	const normalized = norm(filePath);
	if (!/\.tsx$/.test(normalized)) return errors; // only enforce for TSX components

	const file = normalized.split('/').pop()!;
	const base = file.replace(/\.tsx$/, '');
	if (!pascal.test(base)) {
		errors.push(`${segment}: "${file}" must be PascalCase.tsx -> ${normalized}`);
	}
	return errors;
}

async function run() {
	const violations: string[] = [];
	for await (const file of walk('.')) {
		const p = norm(file);

		// Skip obvious non-source areas
		if (
			p.includes('/node_modules/') ||
			p.includes('/dist/') ||
			p.includes('/tmp/') ||
			p.includes('/infra/') ||
			p.includes('/supabase/')
		) continue;

		if (pathHasSegment(p, 'routes')) violations.push(...checkRoutesPath(p));
		if (pathHasSegment(p, 'islands')) violations.push(...checkPascalDir(p, 'islands'));
		if (pathHasSegment(p, 'components')) violations.push(...checkPascalDir(p, 'components'));
	}

	if (violations.length) {
		console.error('\n❌ Naming violations (' + violations.length + '):');
		for (const v of violations) console.error(' - ' + v);
		Deno.exit(1);
	} else {
		console.log('✅ Naming conventions OK');
	}
}

await run();
```

### File: vite.config.ts

```ts
import { defineConfig } from 'vite';
import { fresh } from '@fresh/plugin-vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
	root: 'apps/web',

	plugins: [fresh()],

	resolve: {
		alias: {
			'@': r('./apps/web/'),
			'@styles': r('./apps/web/styles/'),
			'@components': r('./apps/web/components/'),
			'@features': r('./apps/web/features/'),
			'@islands': r('./apps/web/islands/'),
			'@server': r('./apps/web/server/'),
			'@services': r('./apps/web/services/'),
			'@types': r('./apps/web/types/'),
			'@utils': r('./apps/web/utils.ts'),
			'packages': r('./packages'),
		},
	},
});
```
