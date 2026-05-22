import '../../../styles/components/view/view-body.css';
import ViewStagesOverview from '@features/public/explore/components/view/body/body-stages-overview.tsx';
import ViewDescription from './body-description.tsx';
import ViewTags from './body-tags.tsx';
import ViewStages from './stages/stages.tsx';

export default function ViewBody() {
	return (
		<div className='view-body'>
			<ViewStagesOverview />
			<ViewDescription />
			<ViewTags />
			<ViewStages />
		</div>
	);
}
