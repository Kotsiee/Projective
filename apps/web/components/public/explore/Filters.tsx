import '@styles/components/public/explore/filters.css';
import DropdownField from '../../fields/DropdownField.tsx';

export default function ExploreFilters() {
	return (
		<div class='explore-filters'>
			<DropdownField values={[]} placeholder='Skills' options={{ searchable: true }} />
		</div>
	);
}
