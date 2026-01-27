import { DataSource, FetchResult, Range } from '@projective/data';

export interface ChatMessageSender {
	id: string;
	name: string;
	avatarUrl?: string;
}

export interface ChatMessageSender {
	id: string;
	name: string;
	avatarUrl?: string;
}

export interface ChatMessageAttachment {
	id: string;
	name: string;
	type: string;
	size: number;
	url: string;
}

export interface ChatMessageData {
	id: string;
	text: string;
	sender: ChatMessageSender;
	timestamp: string;
	isSelf: boolean;
	attachments?: ChatMessageAttachment[];
}
export class ChatNetworkSource extends DataSource<ChatMessageData> {
	private channelId: string;
	private currentUserId: string | null = null;

	constructor(channelId: string) {
		super({
			// deno-lint-ignore no-explicit-any
			keyExtractor: (item: any) => item.id,
		});
		this.channelId = channelId;
	}

	public setCurrentUser(userId: string) {
		this.currentUserId = userId;
	}

	private getEndpoint() {
		return `/api/v1/dashboard/comms/channels/${this.channelId}/messages`;
	}

	private getSubscriptionEndpoint() {
		return `/api/v1/dashboard/comms/channels/${this.channelId}/subscribe?type=channel`;
	}

	/**
	 * Subscribes using Server-Sent Events (EventSource)
	 */
	subscribe(onMessage: (msg: ChatMessageData) => void): () => void {
		console.log(
			'Connecting to EventSource:',
			this.getSubscriptionEndpoint(),
		);

		const eventSource = new EventSource(this.getSubscriptionEndpoint());

		console.log('EventSource connected:', eventSource);

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				if (this.currentUserId) {
					data.isSelf = data.sender.id === this.currentUserId;
				}

				console.log('Received SSE message:', data);

				onMessage(data);
			} catch (e) {
				console.error('Error parsing SSE message', e);
			}
		};

		eventSource.onerror = (err) => {
			console.error('EventSource failed:', err);
			if (eventSource.readyState === EventSource.CLOSED) {
				// Handle closed connection
			}
		};

		return () => {
			eventSource.close();
		};
	}

	async getMeta(): Promise<{ totalCount: number }> {
		try {
			const response = await fetch(
				`${this.getEndpoint()}?countOnly=true`,
			);
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

			const response = await fetch(
				`${this.getEndpoint()}?${params.toString()}`,
			);
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
