import '@styles/components/fields/FormStages.css';

export interface IFormStages {
	stage: number;
	stages: string[];
}

export default function FormStages({ stage, stages }: IFormStages) {
	return (
		<div class='form-stages'>
			{stages.map((stg, index) => {
				return (
					<>
						<div class='form-stages__item' data-selected={stage === index + 1}>
							<div class='form-stages__item__container'>
								<div class='form-stages__item__circle'>
									<p>
										{index + 1}
									</p>
								</div>
								<p class='form-stages__item__name'>{stg}</p>
							</div>

							{index != stages.length - 1 &&
								<hr class='form-stages__item__divider' />}
						</div>
					</>
				);
			})}
		</div>
	);
}
