import { DataSource, FetchResult, Range } from '@projective/data';

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
	status?: 'sending' | 'error' | 'sent';
	tempId?: string;
}

export interface ChatRealtimeEvent {
	type: 'INSERT' | 'UPDATE' | 'DELETE';
	data: ChatMessageData | { id: string };
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

	subscribe(onMessage: (event: ChatRealtimeEvent) => void): () => void {
		console.log('[SSE] Attempting to connect to EventSource at:', this.getSubscriptionEndpoint());

		const eventSource = new EventSource(this.getSubscriptionEndpoint());

		eventSource.onopen = () => {
			console.log('[SSE] Connection successfully opened!');
		};

		eventSource.onmessage = (event) => {
			console.log('[SSE] Raw event string received:', event.data);
			try {
				const parsed = JSON.parse(event.data);

				let type = parsed.type;
				let data = parsed.data;

				if (!type) {
					type = 'INSERT';
					data = parsed;
				}

				if (this.currentUserId && data.sender) {
					data.isSelf = data.sender.id === this.currentUserId;
				}

				console.log('[SSE] Successfully parsed and dispatching:', { type, data });
				onMessage({ type, data });
			} catch (e) {
				console.error('[SSE] Error parsing SSE message payload:', e);
			}
		};

		eventSource.onerror = (err) => {
			console.error('[SSE] EventSource Error state triggered:', err);
			if (eventSource.readyState === EventSource.CLOSED) {
				console.warn('[SSE] Connection permanently closed.');
			}
		};

		return () => {
			console.log('[SSE] Closing EventSource connection.');
			eventSource.close();
		};
	}

	async getMeta(): Promise<{ totalCount: number }> {
		try {
			const response = await fetch(
				`${this.getEndpoint()}?countOnly=true&type=channel`,
			);
			if (!response.ok) throw new Error('Failed to fetch meta');
			const data = await response.json();
			return data.meta || { totalCount: 0 };
		} catch (error) {
			console.error('[HTTP] Failed to init chat meta:', error);
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

			const response = await fetch(`${this.getEndpoint()}?${params.toString()}`);
			if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

			const data = await response.json();
			return { items: data.items || [], meta: data.meta || { totalCount: 0 } };
		} catch (error) {
			console.error('[HTTP] Failed to fetch chat chunk:', error);
			return { items: [], meta: { totalCount: 0 } };
		}
	}
}
