import { IconChevronLeft, IconChevronRight, IconDeviceFloppy } from '@tabler/icons-preact';
import ProjectDetails from '@components/dashboard/projects/new/ProjectDetails.tsx';

export default function NewProjectIsland() {
	return (
		<div class='new-project'>
			<h1>Create New Project</h1>
			<div class='new-project__stages'>
				<p>Details</p>
			</div>
			<div>
				<div class='new-project__edit'>
					<ProjectDetails />
				</div>
				<div class='new-project__preview'></div>
			</div>
			<div>
				<button type='button'>
					<IconDeviceFloppy /> Save
				</button>
				<div>
					<button type='button'>
						<IconChevronLeft /> Prev
					</button>
					<button type='button'>
						<IconChevronRight /> Nex
					</button>
				</div>
			</div>
		</div>
	);
}
