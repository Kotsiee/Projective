import ViewIsland from '@features/public/explore/islands/ViewIsland.tsx';
import { ViewEntityType, ViewProvider } from '@features/public/explore/contexts/ViewContext.tsx';

export default function ViewWrapper({ id, type }: { id: string; type: ViewEntityType }) {
	return (
		<ViewProvider initialId={id} initialType={type}>
			<ViewIsland />
		</ViewProvider>
	);
}
