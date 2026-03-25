import { useStageContext } from '../../../contexts/StageContext.tsx';

export default function StageFooter() {
	const { footer } = useStageContext();

	if (!footer.value) {
		return null;
	}

	return (
		<div class='stage-footer__container'>
			{footer.value}
		</div>
	);
}
