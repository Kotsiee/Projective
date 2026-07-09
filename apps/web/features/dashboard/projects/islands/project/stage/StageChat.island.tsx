import '../../../styles/components/project/stage/chat/messages.css';
import ChatMessage from '../../../components/project/stage/chat/StageChatMessage.tsx';
import { ChatMessageData, ChatNetworkSource } from './ChatNetworkSource.ts';
import { ChatList, getBurstPosition } from '@projective/data';
import { MediaViewerProvider } from '../../../contexts/MediaViewerContext.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/utils';
import { generateBlurhash } from '@/utils/processors/blurhash.ts';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { effect, untracked, useSignal } from '@preact/signals';
import { IconBuildingSkyscraper, IconMessages, IconUsers } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ChatMessageInput from '@features/dashboard/projects/components/project/stage/chat/StageChatMessageInput.tsx';
import { FileWithMeta } from '@projective/types';
import type { JSX } from 'preact';
import { type ChannelTab, ChannelTabs, FileHandoverCard } from '@projective/ui';
import { HandoverLibrary, type HandoverLibraryFile } from '@projective/files';
import type { StageChannelSummary } from '@features/shared/services/comms/getStageChannels.ts';

/** Per-scope tab presentation. RLS is the real gate; this is UX only. */
const SCOPE_META: Record<string, { label: string; icon: () => JSX.Element; lockedHint: string }> = {
	stage_all: {
		label: 'General',
		icon: () => <IconMessages size={15} />,
		lockedHint: 'You are not a member of this stage room.',
	},
	team_private: {
		label: 'Team',
		icon: () => <IconUsers size={15} />,
		lockedHint: 'Only the assigned talent can view the Team channel.',
	},
	business_private: {
		label: 'Business',
		icon: () => <IconBuildingSkyscraper size={15} />,
		lockedHint: 'Only the client business can view the Business channel.',
	},
};

export default function ProjectChatIsland() {
	const { stage, refresh } = useStageContext();
	const { setMiddleNav } = useNavigationContext();

	const optimisticMsgs = useSignal<ChatMessageData[]>([]);
	const attachments = useSignal<FileWithMeta[]>([]);
	const replyingTo = useSignal<ChatMessageData | null>(null);
	const pendingUploads = useRef(new Map<string, { message: string; files: FileWithMeta[] }>());

	// Private-channel state (General / Team / Business) + the Projective-Unlock handover status.
	const channels = useSignal<StageChannelSummary[]>([]);
	const activeChannelId = useSignal<string | null>(null);
	const handoverUnlockedAt = useSignal<string | null>(null);
	const libraryFiles = useSignal<HandoverLibraryFile[]>([]);

	// Seed the active channel from the stage's General room so the room works even before (or if) the
	// scoped-channel fetch resolves.
	if (activeChannelId.value === null && stage?.value?.channel_id) {
		activeChannelId.value = stage.value.channel_id;
	}

	/** Load the three scoped rooms + handover state for this stage. */
	const fetchChannels = async (stageId: string) => {
		try {
			const res = await fetch(`/api/v1/dashboard/comms/channels/stage/${stageId}`);
			if (!res.ok) return; // e.g. 403 for a non-member — fall back to the General room.
			const data = await res.json();
			const list: StageChannelSummary[] = data.channels ?? [];
			channels.value = list;
			handoverUnlockedAt.value = data.handoverUnlockedAt ?? null;

			// Keep the current tab if still accessible, else snap to the General room (or first allowed).
			const stillValid = list.find((c) => c.id === activeChannelId.value && c.accessible);
			if (!stillValid) {
				const general = list.find((c) => c.visibility === 'stage_all' && c.accessible);
				const firstOpen = list.find((c) => c.accessible);
				activeChannelId.value = (general ?? firstOpen)?.id ?? activeChannelId.value;
			}
		} catch {
			// Network hiccup — the General-room fallback above keeps chat usable.
		}
	};

	useEffect(() => {
		const stageId = stage?.value?.stage_id;
		if (stageId) fetchChannels(stageId);
	}, [stage?.value?.stage_id, stage?.value?.channel_id]);

	// Once handover is unlocked, load the stage's shared files for the unrestricted downloader.
	useEffect(() => {
		const channelId = activeChannelId.value;
		if (!handoverUnlockedAt.value || !channelId) return;
		(async () => {
			try {
				const res = await fetch(
					`/api/v1/dashboard/comms/channels/${channelId}/files?type=channel&limit=100`,
				);
				if (!res.ok) return;
				const data = await res.json();
				// deno-lint-ignore no-explicit-any
				libraryFiles.value = (data.items ?? []).map((it: any) => ({
					id: it.attachment?.id ?? it.id,
					name: it.attachment?.name ?? 'file',
					mimeType: it.attachment?.type ?? '',
					size: it.attachment?.size ?? 0,
					url: it.attachment?.url,
					uploadedAt: it.message?.timestamp,
					senderName: it.message?.sender?.name,
				}));
			} catch {
				// Non-fatal — the confirmation card still renders.
			}
		})();
	}, [handoverUnlockedAt.value, activeChannelId.value]);

	const downloadOne = (f: HandoverLibraryFile) => {
		if (!f.url) return;
		const a = document.createElement('a');
		a.href = f.url;
		a.download = f.name;
		a.rel = 'noopener';
		document.body.appendChild(a);
		a.click();
		a.remove();
	};
	const downloadAll = () => libraryFiles.value.forEach(downloadOne);

	const handleSend = async (message: string, files: FileWithMeta[], retryId?: string) => {
		const tempId = retryId || crypto.randomUUID();
		const targetChannel = activeChannelId.value || 'new';

		// Optimistic UI
		if (!retryId) {
			const activeReply = replyingTo.value;
			const optimisticData: ChatMessageData = {
				id: tempId,
				tempId: tempId,
				text: message,
				sender: { id: 'self', name: 'Me' },
				timestamp: new Date().toISOString(),
				isSelf: true,
				status: 'sending',
				attachments: files.map((f) => ({
					id: f.id as string,
					name: f.file.name as string,
					type: f.type as string,
					size: f.file.size,
					url: '',
				})),
				replyTo: activeReply
					? {
						id: activeReply.id,
						senderName: activeReply.sender.name,
						snippet: (activeReply.text?.trim() ||
							activeReply.attachments?.[0]?.name || 'Attachment').slice(0, 80),
					}
					: undefined,
			};
			optimisticMsgs.value = [...optimisticMsgs.value, optimisticData];
			pendingUploads.current.set(tempId, { message, files });
			replyingTo.value = null;
		}

		try {
			const isNewChannel = targetChannel === 'new';

			const formData = new FormData();
			formData.append('message', message);
			formData.append('tempId', tempId);

			// First message in a stage: the channel is created lazily server-side
			// (sendMessage → get_or_create_project_channel), which needs the stage id.
			if (isNewChannel) {
				formData.append('targetStageId', stage?.value?.stage_id || '');
			}

			// BlurHash placeholders: reuse the hash the processor pipeline already
			// produced (image resizer), else generate one here. Best-effort — a null
			// hash just means that attachment renders without a placeholder.
			const blurhashes: Record<string, string> = {};
			await Promise.all(files.map(async (f) => {
				const hash = f.processingMeta?.blurhash ?? await generateBlurhash(f.file);
				if (hash) blurhashes[f.file.name] = hash;
			}));

			files.forEach((f) => {
				formData.append('files', f.file);
				// Flag this specific file as an audio message based on the meta injected in the input component
				if (f.meta?.isAudioMessage) {
					formData.append('voiceMessages', f.file.name);
				}
			});

			// One JSON field: { [file.name]: blurhash }, read back in the messages route.
			if (Object.keys(blurhashes).length > 0) {
				formData.append('blurhashes', JSON.stringify(blurhashes));
			}

			const csrfToken = await getCsrfToken();

			// Both the "new" and existing cases post to the channel messages route; the
			// channelid segment is literally `new` when no channel exists yet.
			const endpoint = `/api/v1/dashboard/comms/channels/${targetChannel}/messages?type=channel`;

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'X-CSRF': csrfToken || '' },
				body: formData,
			});

			if (!res.ok) throw new Error('Network response was not ok');

			const realMsg = await res.json();

			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId
					? {
						...m,
						id: realMsg.id,
						status: 'sent',
						timestamp: realMsg.timestamp,
						// The server (PII trigger) may have masked contact info during the protected phase.
						text: realMsg.body ?? m.text,
						piiMasked: realMsg.piiMasked ?? false,
						piiCategories: realMsg.piiCategories ?? [],
					}
					: m
			);
			pendingUploads.current.delete(tempId);

			// Reload the stage so it picks up the freshly-created channel_id and the
			// realtime data source re-subscribes to it.
			if (isNewChannel) {
				refresh();
				if (stage?.value?.stage_id) fetchChannels(stage.value.stage_id);
			}
		} catch (err) {
			console.error('Failed to send message:', err);
			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId ? { ...m, status: 'error' } : m
			);
		}
	};

	const onSend = (msg: string, files: FileWithMeta[]) => handleSend(msg, files);

	const onSendRef = useRef(onSend);
	onSendRef.current = onSend;

	const onRetry = (tempId: string) => {
		const data = pendingUploads.current.get(tempId);
		if (data) handleSend(data.message, data.files, tempId);
	};

	/** Drops an optimistic message from the local buffer (client-side delete). */
	const handleDeleteMessage = (msg: ChatMessageData) => {
		optimisticMsgs.value = optimisticMsgs.value.filter(
			(o) => o.id !== msg.id && o.tempId !== msg.tempId,
		);
		pendingUploads.current.delete(msg.tempId ?? msg.id);
	};

	useEffect(() => {
		const dispose = effect(() => {
			const hasAttachments = attachments.value.length > 0;
			const isReplying = replyingTo.value !== null;
			const baseHeight = hasAttachments ? 150 : 86;

			untracked(() => {
				setMiddleNav({
					footerHeight: `${baseHeight + (isReplying ? 44 : 0)}px`,
					footerContent: (
						<ChatMessageInput
							onSend={(text, files) => onSendRef.current(text, files)}
							files={attachments}
							replyingTo={replyingTo}
							onCancelReply={() => (replyingTo.value = null)}
						/>
					),
				});
			});
		});

		return () => {
			dispose();
			setMiddleNav({
				footerHeight: '0px',
				footerContent: null,
			});
		};
	}, []);

	const dataSource = useMemo(() => {
		if (!activeChannelId.value) return null;
		return new ChatNetworkSource(activeChannelId.value);
	}, [activeChannelId.value]);

	// Build the channel tab strip (General / Team / Business), locking scopes the viewer can't access.
	const tabs: ChannelTab[] = channels.value.map((c) => {
		const meta = SCOPE_META[c.visibility] ?? { label: c.name, icon: undefined, lockedHint: '' };
		return {
			id: c.id,
			label: meta.label,
			icon: meta.icon ? meta.icon() : undefined,
			locked: !c.accessible,
			lockedHint: meta.lockedHint,
		};
	});

	const isUnlocked = !!handoverUnlockedAt.value;

	return (
		<MediaViewerProvider>
			<div class='project-chat-island messages-container'>
				{tabs.length > 1 && (
					<div class='stage-chat__tabs' style={{ padding: '0 0.75rem' }}>
						<ChannelTabs
							tabs={tabs}
							activeId={activeChannelId.value ?? ''}
							onSelect={(id) => (activeChannelId.value = id)}
						/>
					</div>
				)}

				{isUnlocked && (
					<div
						class='stage-chat__handover'
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '0.75rem',
							padding: '0.75rem',
						}}
					>
						<FileHandoverCard
							projectTitle={stage?.value?.title ?? 'This project'}
							ipMode={stage?.value?.ip_mode}
							unlockedAt={handoverUnlockedAt.value ?? undefined}
							fileCount={libraryFiles.value.length || undefined}
							onDownloadAll={libraryFiles.value.length ? downloadAll : undefined}
						/>
						{libraryFiles.value.length > 0 && (
							<HandoverLibrary
								files={libraryFiles.value}
								onDownload={downloadOne}
								onDownloadAll={downloadAll}
								title='Delivered assets'
							/>
						)}
					</div>
				)}

				<div class='project-chat-island__messages'>
					{dataSource
						? (
							<ChatList
								dataSource={dataSource}
								optimisticItems={optimisticMsgs.value}
								renderItem={(item, index, items) => {
									const { isFirstInBurst, isLastInBurst } = getBurstPosition(items, index);
									return (
										<ChatMessage
											message={item}
											isFirstInBurst={isFirstInBurst}
											isLastInBurst={isLastInBurst}
											onRetry={onRetry}
											onReply={(m) => (replyingTo.value = m)}
											onDelete={handleDeleteMessage}
										/>
									);
								}}
								estimateHeight={120}
								pageSize={20}
								scrollMode='window'
							/>
						)
						: (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									height: '100%',
									color: 'var(--text-muted)',
									gap: '1rem',
								}}
							>
								<IconMessages size={48} opacity={0.5} />
								<p>Send a message to start the conversation.</p>
							</div>
						)}
				</div>
			</div>
		</MediaViewerProvider>
	);
}
