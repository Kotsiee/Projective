import { useSignal } from '@preact/signals';
import { Button, Overlay } from '@projective/ui';
import { SelectField, SelectOption, TextField } from '@projective/fields';
import { useViewContext } from '../../../contexts/ViewContext.tsx';
import '../../../styles/components/view/overlay/view-join-form.css';

export interface ViewJoinFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	isOpen: boolean;
	onClose?: () => void;
}

export function ViewOverlayJoin({ onSuccess, onCancel, isOpen, onClose }: ViewJoinFormProps) {
	const { entityId, data } = useViewContext();

	const message = useSignal('');
	const selectedTargets = useSignal<string[]>([]);
	const isSubmitting = useSignal(false);

	const stages = data.value?.stages || [];
	const roles = data.value?.roles || [];

	// #region Options Mapping
	const formatCurrency = (cents: number) => {
		if (!cents) return 'TBD';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
			cents / 100,
		);
	};

	// Map backend stages and roles into a grouped SelectOption format
	const selectOptions: SelectOption<string>[] = stages.map((stage: any) => {
		const stageRoles = roles.filter((r: any) =>
			r.project_stage_id === stage.id || r.stage_id === stage.id
		);

		if (stageRoles.length > 0) {
			return {
				label: stage.name,
				value: `stage_${stage.id}`, // Group ID
				options: stageRoles.map((role: any) => ({
					label: `${role.role_title}`,
					value: role.id,
				})),
			};
		} else {
			return {
				label: `${stage.name}`,
				value: stage.id,
			};
		}
	});
	// #endregion

	// #region Submission Handler
	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (selectedTargets.value.length === 0) return;

		isSubmitting.value = true;

		try {
			// Construct the payload for your backend endpoint
			const payload = {
				project_id: entityId.value,
				message: message.value,
				targets: selectedTargets.value.map((id) => {
					// Determine if the selected ID is a role or a raw stage (open seat)
					const isRole = roles.some((r: any) => r.id === id);
					return {
						target_type: isRole ? 'role' : 'stage',
						target_id: id,
					};
				}),
			};

			// TODO: Call your backend API here
			// await fetch('/api/v1/dashboard/applications', { method: 'POST', body: JSON.stringify(payload) });

			console.log('Submitted Proposal:', payload);

			// Simulate network request
			await new Promise((res) => setTimeout(res, 1000));

			if (onSuccess) onSuccess();
		} catch (err) {
			console.error('Failed to submit application', err);
		} finally {
			isSubmitting.value = false;
		}
	};
	// #endregion

	return (
		<Overlay
			isOpen={isOpen}
			onClose={onClose}
			title='Join Request'
			type='modal'
			style={{ maxWidth: '800px' }} // Expanded width for 2-column layout
		>
			<form className='view-join-form' onSubmit={handleSubmit}>
				<div className='view-join-form__body'>
					{/* Left Column: Message */}
					<div className='view-join-form__section view-join-form__section--left'>
						<TextField
							className='view-join-form__textfield'
							placeholder="Introduce yourself, highlight relevant experience, and explain why you're a good fit..."
							multiline
							value={message}
							position='top'
							floatingRule='never'
						/>
					</div>

					{/* Vertical Divider */}
					<div className='view-join-form__divider' aria-hidden='true'></div>

					{/* Right Column: Target Selections */}
					<div className='view-join-form__section view-join-form__section--right'>
						<SelectField
							label='Select Stages or Seats to Apply For'
							placeholder='Choose roles...'
							options={selectOptions}
							value={selectedTargets}
							multiple
							searchable
							clearable
							displayMode='chips-inside'
							groupSelectMode='members'
							position='top'
							floatingRule='never'
						/>
						<span className='view-join-form__hint'>
							You must select at least one item to apply.
						</span>
					</div>
				</div>

				<div className='view-join-form__actions'>
					<Button
						variant='secondary'
						ghost
						onClick={onCancel || onClose}
						disabled={isSubmitting.value}
					>
						Cancel
					</Button>
					<Button
						variant='primary'
						loading={isSubmitting.value}
						disabled={selectedTargets.value.length === 0}
						onClick={handleSubmit}
					>
						Send Request
					</Button>
				</div>
			</form>
		</Overlay>
	);
}
