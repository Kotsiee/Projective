import '@styles/layouts/messages.css';
import { type ComponentChildren } from 'preact';
import MessagesSidebar from '@components/dashboard/messages/MessagesSidebar.tsx';

type AuthLayoutProps = {
	children: ComponentChildren;
};

export default function MessagesLayout(props: AuthLayoutProps) {
	return (
		<div class='layout-messages'>
			<div class='layout-messages__sidebar__container'>
				<MessagesSidebar />
			</div>

			<div class='layout-messages__content__container'>
				{props.children}
			</div>
		</div>
	);
}
