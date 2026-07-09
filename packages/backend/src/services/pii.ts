/**
 * @file pii.ts
 * @description Anti-disintermediation PII filter (Epic E7). During a project's *protected phase*
 * (before the "Projective Unlock" — i.e. before the final escrow release) contact details must not be
 * exchanged in the stage rooms, so parties cannot take the work off-platform. This filter masks and
 * classifies the restricted shapes — email addresses, external phone numbers, and third-party payment
 * links / handles — leaving a friendly placeholder in their place.
 *
 * This is the TypeScript mirror of the authoritative SQL masker `comms.mask_pii` (migration 0311). The
 * database trigger is the real enforcement gate (it cannot be bypassed via direct PostgREST writes);
 * this class gives the message service an instant, identical result to echo back to the sender and to
 * unit-test without a database. Keep the two in lock-step — same shapes, same ordering.
 *
 * See documentation/business/brain.md §Messaging ("Platform Integrity & Monitoring" / "The Handover
 * State").
 */

export type PiiCategory = 'email' | 'payment_link' | 'handle' | 'phone';

export interface PiiScanResult {
	/** The message body with every restricted match replaced by a placeholder. */
	masked: string;
	/** Which categories were found and masked (empty when the message was clean). */
	categories: PiiCategory[];
	/** Convenience flag: `categories.length > 0`. */
	wasMasked: boolean;
}

interface PiiRule {
	category: PiiCategory;
	/** Built fresh per call so the global-flag `lastIndex` never leaks between scans. */
	pattern: () => RegExp;
	placeholder: string;
}

/**
 * @class PIIFilter
 * @description Pure, stateless masker. Order is deliberate and matches the SQL: emails first, then
 * payment links/handles, then bare phone numbers (a payment URL can contain digits that the phone
 * pass would otherwise eat).
 */
export class PIIFilter {
	private static readonly RULES: PiiRule[] = [
		{
			category: 'email',
			pattern: () => /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
			placeholder: '[email hidden]',
		},
		{
			category: 'payment_link',
			pattern: () =>
				/(https?:\/\/)?(www\.)?(paypal(\.me)?|venmo|cash\.?app|cash\.me|zelle|wise\.com|revolut\.me|monzo\.me|ko-?fi\.com|buymeacoffee\.com|t\.me|wa\.me|telegram\.me)[^\s]*/gi,
			placeholder: '[link hidden]',
		},
		{
			category: 'handle',
			pattern: () => /\$[A-Za-z][A-Za-z0-9_]+/g,
			placeholder: '[handle hidden]',
		},
		{
			category: 'phone',
			pattern: () => /[+(]?\d[\d ().-]{6,}\d/g,
			placeholder: '[phone hidden]',
		},
	];

	/**
	 * Mask and classify a message body. Safe on empty/nullish input (returns it untouched).
	 */
	static apply(text: string | null | undefined): PiiScanResult {
		if (!text) return { masked: text ?? '', categories: [], wasMasked: false };

		let masked = text;
		const categories: PiiCategory[] = [];

		for (const rule of this.RULES) {
			if (rule.pattern().test(masked)) {
				masked = masked.replace(rule.pattern(), rule.placeholder);
				categories.push(rule.category);
			}
		}

		return { masked, categories, wasMasked: categories.length > 0 };
	}

	/** Alias of {@link PIIFilter.apply} — reads naturally next to `ModerationService.scan`. */
	static scan(text: string | null | undefined): PiiScanResult {
		return this.apply(text);
	}
}
