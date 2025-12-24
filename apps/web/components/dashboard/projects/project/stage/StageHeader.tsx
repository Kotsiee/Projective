import { useStageContext } from '@contexts/StageContext.tsx';
import { stageTabs } from '@projective/types';

export default function StageHeader() {
	let tabs: { label: string; href: string }[] = [];
	const { stage } = useStageContext();

	if (stage.value) {
		tabs = stageTabs(stage.value.stage_type);
	}

	return (
		<div className='stage-header'>
			<div className='stage-header__left'>
				<img
					src={'https://placehold.co/50'}
					className='sidebar-details__avatar'
				/>
				<div>
					<h3 className='stage-header__title'>Stage Title</h3>
					<p className='stage-header__meta'>Khalid is Typing...</p>
				</div>
			</div>
			<div className='stage-header__center'>
				{tabs.map((tab) => (
					<a key={tab.href} className='stage-header__tab' href={tab.href}>{tab.label}</a>
				))}
			</div>
			<div className='stage-header__right'></div>
		</div>
	);
}
