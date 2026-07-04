import '../styles/inbox.css';

/** Static placeholder rows — replaced by the real feed in Phase 2. */
const PLACEHOLDER_ROWS = Array.from({ length: 6 });

/**
 * @component InboxShell
 * @description Zero-logic structural shell for the full notifications/inbox list
 * context. Renders inside the dashboard layout; the live feed and filtering are
 * wired up in Phase 2.
 *
 * @returns {preact.JSX.Element} The inbox layout scaffold.
 */
export default function InboxShell() {
	return (
		<section class='inbox'>
			<header class='inbox__header'>
				<div class='inbox__heading'>
					<h1 class='inbox__title'>Notifications</h1>
					<p class='inbox__subtitle'>Your full activity and inbox feed.</p>
				</div>
				<div class='inbox__filters'>
					<button type='button' class='inbox__filter' data-active='true'>All</button>
					<button type='button' class='inbox__filter'>Unread</button>
				</div>
			</header>

			<ul class='inbox__list'>
				{PLACEHOLDER_ROWS.map((_, i) => (
					<li key={i} class='inbox__item'>
						<span class='inbox__item-indicator' aria-hidden='true' />
						<div class='inbox__item-body'>
							<span class='inbox__item-title'>Placeholder notification</span>
							<span class='inbox__item-text'>
								Structural placeholder — feed wiring lands in Phase 2.
							</span>
						</div>
						<span class='inbox__item-meta'>—</span>
					</li>
				))}
			</ul>
		</section>
	);
}
