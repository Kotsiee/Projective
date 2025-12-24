import { StageType } from './enums.ts';

export const stageTabs = (type: StageType) => {
	const tabs = [
		{ label: 'Chat', href: 'chat' },
		{ label: 'Files', href: 'files' },
	];

	if (type === StageType.SessionBased || type === StageType.GroupSessionBased) {
		tabs.push({ label: 'Sessions', href: 'sessions' });
	}

	if (type === StageType.ManagementBased) {
		tabs.push({ label: 'Tasks', href: 'tasks' });
	}

	if (type === StageType.MaintenanceBased) {
		tabs.push({ label: 'Tickets', href: 'tickets' });
	}

	if (type === StageType.FileBased) {
		tabs.push({ label: 'Submissions', href: 'submissions' });
	}

	return tabs;
};
