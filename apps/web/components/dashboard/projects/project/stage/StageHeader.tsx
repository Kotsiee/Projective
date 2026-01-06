import { useStageContext } from '@contexts/StageContext.tsx';
import { stageTabs } from '@projective/types';
import { useProjectContext } from '@contexts/ProjectContext.tsx';
import { useEffect } from 'preact/hooks';
import { IconDotsVertical } from '@tabler/icons-preact';

export default function StageHeader() {
	let tabs: { label: string; href: string }[] = [];
	const { stage, stage_id } = useStageContext();
	const { project_id } = useProjectContext();

	if (stage.value) {
		tabs = stageTabs(stage.value.stage_type);
	}

	useEffect(() => {
console.log(globalThis.location.href)
	}, [])

	return (
		<div className='stage-header'>
			<div className='stage-header__left'>
				<img
					src="https://placehold.co/50"
					className='sidebar-details__avatar'
				/>
				<div>
					<h3 className='stage-header__title'>Stage Title</h3>
					<p className='stage-header__meta'>Khalid is Typing...</p>
				</div>
			</div>
			<div className='stage-header__center'>
				{tabs.map((tab) => (
					<a key={tab.href} 
					className='stage-header__tab'
					data-current={globalThis.location.href.includes(`/projects/${project_id.value}/${stage_id.value}/${tab.href}`)} 
					href={`/projects/${project_id.value}/${stage_id.value}/${tab.href}`} 
					f-partial={`/projects/${project_id.value}/${stage_id.value}/${tab.href}`}>{tab.label}</a>
				))}
			</div>
			<div className='stage-header__right'>
				<IconDotsVertical/>
			</div>
		</div>
	);
}
