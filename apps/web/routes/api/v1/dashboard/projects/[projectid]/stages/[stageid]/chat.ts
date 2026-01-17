import { define } from '@utils';

interface ChatMessageData {
	id: string;
	text: string;
	sender: string;
	timestamp: string;
	isSelf: boolean;
}

// Fixed constant for stable pagination testing
const TOTAL_MESSAGES = 125;

// Deterministic content generator
const generateMessage = (index: number): ChatMessageData => {
	// Invert timestamp so index 0 is the OLDEST (start of time)
	// and index 124 is the NEWEST (now).
	const date = new Date();
	date.setMinutes(date.getMinutes() - (TOTAL_MESSAGES - index) * 10);

	return {
		id: `msg-${index}`,
		text: `Message #${index} - ${
			[
				'Hey there!',
				'How is the project going?',
				'Just pushing some updates now. This is a longer message to test variable heights in the virtualizer.',
				'Cool. Can you send the file?',
				'Did you see the latest PR?',
				'Checking it now. Looks good but needs more tests.',
				'I will handle that tomorrow.',
				'Perfect, thanks!',
			][index % 8]
		}`,
		sender: index % 2 === 0 ? 'You' : 'Client',
		isSelf: index % 2 === 0,
		timestamp: date.toISOString(),
	};
};

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);

		// Parse query params
		const startStr = url.searchParams.get('start');
		const limitStr = url.searchParams.get('limit');
		const countOnly = url.searchParams.get('countOnly') === 'true';

		// Simulate Network Delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Metadata response
		if (countOnly) {
			return new Response(
				JSON.stringify({
					items: [],
					meta: { totalCount: TOTAL_MESSAGES },
				}),
				{
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const start = parseInt(startStr || '0');
		const limit = parseInt(limitStr || '20');

		const items: ChatMessageData[] = [];
		// Clamp ranges
		const safeStart = Math.max(0, Math.min(start, TOTAL_MESSAGES));
		const safeEnd = Math.min(safeStart + limit, TOTAL_MESSAGES);

		for (let i = safeStart; i < safeEnd; i++) {
			items.push(generateMessage(i));
		}

		return new Response(
			JSON.stringify({
				items,
				meta: {
					totalCount: TOTAL_MESSAGES,
				},
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			},
		);
	},
});
