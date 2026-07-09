import BusinessListIsland from '@features/dashboard/business/islands/BusinessList.island.tsx';

/**
 * Businesses list. The static page header is server-rendered here; the interactive search toolbar
 * and the virtualized data grid hydrate as the `BusinessList` island.
 */
export default function Business() {
	return (
		<div class='business-island'>
			<div class='business-island__page-header'>
				<h1>Businesses</h1>
				<p>Manage your legal entities, billing profiles, and client relationships.</p>
			</div>

			<BusinessListIsland />
		</div>
	);
}
