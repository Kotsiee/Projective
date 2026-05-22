import { Button } from '@projective/ui';
import '../../../../styles/components/view/body/stages/view-stages-skills.css';

export default function ViewStagesSkills({ stage }: { stage: any }) {
	const skills = stage.skills || [];

	if (skills.length === 0) return null;

	return (
		<div className='view-stages-skills'>
			<h5 className='view-stages-skills__title'>Required Skills</h5>
			<div className='view-stages-skills__list'>
				{skills.map((skill: string) => (
					<Button
						key={skill}
						variant='secondary'
						size='small'
						outlined
						rounded
						href={`/explore?q=${encodeURIComponent(skill)}`}
					>
						{skill}
					</Button>
				))}
			</div>
		</div>
	);
}
