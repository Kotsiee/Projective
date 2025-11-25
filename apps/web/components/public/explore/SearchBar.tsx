import '@styles/components/search/SearchBar.css';
import { IconSearch } from '@tabler/icons-preact';

export default function SearchBar() {
	return (
		<div class='search-bar'>
			<input class='search-bar__input' type='text' placeholder='Search Projects...' />
			<button class='search-bar__enter' type='submit'>
				<IconSearch />
			</button>
		</div>
	);
}
