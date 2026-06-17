import { IconSearch } from '@tabler/icons-preact';

export default function NavigationHeaderSearch() {
	return (
		<div class='navigation__search'>
			<button class='navigation__search__btn' aria-label='Search'>
				<IconSearch size={16} />
			</button>
			<input
				class='navigation__search__input'
				type='text'
				placeholder='Search...'
				aria-label='Search'
			/>
		</div>
	);
}
