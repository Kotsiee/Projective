export interface PiiNoticeProps {
	/** Raw masked-content category keys (e.g. `email`, `phone`, `payment_link`, `handle`). */
	categories?: string[];
	/** Single tight line with a smaller font, for dense message threads. */
	compact?: boolean;
	className?: string;
}
