import ViewIsland from '@features/public/explore/islands/ViewIsland.tsx';

export default function ViewWrapper({ id, type }: { id: string | null; type: string }) {
	return <ViewIsland id={id} type={type} />;
}
