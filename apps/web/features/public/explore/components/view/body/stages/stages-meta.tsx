import { IconCalendar, IconUpload } from '@tabler/icons-preact';
import { DateTime } from '@projective/types'; // Adjust import path if needed
import '../../../../styles/components/view/body/stages/view-stages-meta.css';

export default function ViewStagesMeta({ stage }: { stage: any }) {
	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return 'TBD';
		try {
			// Utilizing the DateTime utility wrapper for formatting
			return DateTime.fromISO(dateStr).toFormat('MMM D, YYYY');
		} catch {
			return 'TBD';
		}
	};

	return (
		<div className='view-stages-meta'>
			<div className='view-stages-meta__item'>
				<IconCalendar size={18} className='view-stages-meta__icon' />
				<div className='view-stages-meta__text'>
					<span className='view-stages-meta__label'>Timeline</span>
					<span className='view-stages-meta__value'>
						{formatDate(stage.start_date)} — {formatDate(stage.end_date)}
					</span>
				</div>
			</div>

			{stage.file_upload_required && (
				<div className='view-stages-meta__item'>
					<IconUpload size={18} className='view-stages-meta__icon' />
					<div className='view-stages-meta__text'>
						<span className='view-stages-meta__label'>Deliverable</span>
						<span className='view-stages-meta__value'>File Upload Required</span>
					</div>
				</div>
			)}
		</div>
	);
}
