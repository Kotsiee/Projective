import { define } from '@utils';
import MessagesLayout from '@islands/pages/dashboard/messages/MessagesLayout.tsx';

export default define.layout(function App({ Component }) {
	return (
		<MessagesLayout>
			<Component />
		</MessagesLayout>
	);
});
