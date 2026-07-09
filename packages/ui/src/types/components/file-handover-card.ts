export interface FileHandoverCardProps {
	projectTitle: string;
	/** Raw IP-mode key, e.g. `exclusive_transfer` | `license` | `non_exclusive`. */
	ipMode?: string;
	/** ISO timestamp of when the handover unlocked. */
	unlockedAt?: string;
	/** Number of released assets, shown as a "N files ready to download" line. */
	fileCount?: number;
	/** When given, renders the primary "Download all assets" action. */
	onDownloadAll?: () => void;
	className?: string;
}
