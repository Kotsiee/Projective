import SelectField from '../../../fields/SelectField.tsx';
import TextField from '../../../fields/TextField.tsx';

export default function ProjectDetails() {
	return (
		<div class='new-project__details'>
			<TextField
				name='project-title'
				label='Title'
				maxLength={50}
				placeholder='What is your project?'
			/>
			<TextField
				name='project-brief'
				label='Brief'
				maxLength={5000}
				placeholder='Describe what your project is about in detail...'
				multiline
			/>
			<div>
				<SelectField
					name='project-ip-ownership'
					label='IP Ownership Mode'
					options={[]}
					searchable={false}
					multiple={false}
				/>
			</div>
		</div>
	);
}
