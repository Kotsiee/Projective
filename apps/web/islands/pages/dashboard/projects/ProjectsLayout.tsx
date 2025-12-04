import '@styles/layouts/messages.css';
import { type ComponentChildren } from 'preact';

type AuthLayoutProps = {
	children: ComponentChildren;
};

export default function ProjectsLayout(props: AuthLayoutProps) {
	return (
		<div class='layout-messages'>
		</div>
	);
}
