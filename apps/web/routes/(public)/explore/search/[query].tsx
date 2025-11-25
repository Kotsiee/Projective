import { RenderableProps } from 'preact/src/index.d.ts';
import { PageProps } from 'https://jsr.io/@fresh/core/2.2.0/src/render.ts';
import { State } from '@utils';
import SearchIsland from '@islands/pages/public/search.tsx';

export default function Search(ctx: RenderableProps<PageProps<never, State>, any>) {
	ctx.params.query;
	console.log(ctx.params.query);

	return (
		<div class='search-page__container'>
			<SearchIsland query={ctx.params.query} />
		</div>
	);
}
