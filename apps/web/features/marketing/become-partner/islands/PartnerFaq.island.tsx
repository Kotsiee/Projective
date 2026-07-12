/**
 * @file PartnerFaq.island.tsx
 * @description A sophisticated single-open FAQ accordion for the `/become-partner` funnel. Smooth
 * `grid-template-rows` height transitions (luxe curve) rather than a hard show/hide. Pure client
 * state — the questions/answers are seeded from props (server-resolved), never fetched here.
 */

import { useSignal } from '@preact/signals';
import { IconMinus, IconPlus } from '@tabler/icons-preact';
import type { PartnerFaqItem } from '../data/content.ts';

export default function PartnerFaq({ items }: { items: PartnerFaqItem[] }) {
	// -1 = all collapsed; only one panel is open at a time.
	const openIndex = useSignal(-1);

	return (
		<div class='partner-faq'>
			{items.map((item, i) => {
				const open = openIndex.value === i;
				return (
					<div class='partner-faq__item' data-open={open ? 'true' : 'false'} key={item.q}>
						<button
							type='button'
							class='partner-faq__q'
							aria-expanded={open}
							onClick={() => (openIndex.value = open ? -1 : i)}
						>
							<span class='partner-faq__q-text'>{item.q}</span>
							<span class='partner-faq__q-icon' aria-hidden='true'>
								{open ? <IconMinus size={18} /> : <IconPlus size={18} />}
							</span>
						</button>
						<div class='partner-faq__a'>
							<div class='partner-faq__a-inner'>
								<p>{item.a}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
