import { PageProps } from 'fresh';
import ViewWrapper from './(_islands)/item.tsx';

export default function View(req: PageProps) {
	const id = req.url.searchParams.get('id');
	const type = req.params.item;

	return <ViewWrapper id={id} type={type} />;
}
