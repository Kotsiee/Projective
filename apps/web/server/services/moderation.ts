export class ModerationService {
	private static BLOCKLIST = ['badword', 'scam', 'bank_transfer'];
	private static SENSITIVE_REGEX = /\b(?:\d[ -]*?){13,16}\b/;

	static scan(text: string): { flagged: boolean; reason?: string } {
		if (!text) return { flagged: false };

		const lower = text.toLowerCase();

		const foundWord = this.BLOCKLIST.find((w) => lower.includes(w));
		if (foundWord) {
			return { flagged: true, reason: 'Content contains prohibited keywords.' };
		}

		if (this.SENSITIVE_REGEX.test(text)) {
			return { flagged: true, reason: 'Potential sensitive financial data detected.' };
		}

		return { flagged: false };
	}
}
