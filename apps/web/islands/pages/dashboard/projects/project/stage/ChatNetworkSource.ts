import { DataSource, FetchResult, Range } from '@projective/data';

export interface ChatMessageSender {
	id: string;
	name: string;
	avatarUrl?: string;
}

export interface ChatMessageData {
	id: string;
	text: string;
	sender: ChatMessageSender;
	timestamp: string;
	isSelf: boolean;
}

export class ChatNetworkSource extends DataSource<ChatMessageData> {
	private channelId: string;

	constructor(channelId: string) {
		super({
			// deno-lint-ignore no-explicit-any
			keyExtractor: (item: any) => item.id,
		});
		this.channelId = channelId;
	}

	private getEndpoint() {
		return `/api/v1/dashboard/comms/channels/${this.channelId}/messages`;
	}

	async getMeta(): Promise<{ totalCount: number }> {
		try {
			const params = new URLSearchParams({
				countOnly: 'true',
				type: 'channel',
			});
			const response = await fetch(`${this.getEndpoint()}?${params.toString()}`, { method: 'GET' });
			if (!response.ok) throw new Error('Failed to fetch meta');
			const data = await response.json();
			return data.meta || { totalCount: 0 };
		} catch (error) {
			console.error('Failed to init chat:', error);
			return { totalCount: 0 };
		}
	}

	async fetch(range: Range): Promise<FetchResult<ChatMessageData>> {
		try {
			const params = new URLSearchParams({
				start: range.start.toString(),
				limit: range.length.toString(),
				type: 'channel',
			});

			const response = await fetch(`${this.getEndpoint()}?${params.toString()}`, { method: 'GET' });

			if (!response.ok) {
				throw new Error(`API Error: ${response.statusText}`);
			}

			const data = await response.json();

			return {
				items: data.items || [],
				meta: data.meta || { totalCount: 0 },
			};
		} catch (error) {
			console.error('Failed to fetch chat messages:', error);
			return { items: [], meta: { totalCount: 0 } };
		}
	}
}
