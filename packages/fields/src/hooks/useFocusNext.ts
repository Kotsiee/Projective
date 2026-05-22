export function focusNextElement(current: HTMLElement, explicitNext?: string | HTMLElement) {
	if (explicitNext) {
		const target = typeof explicitNext === 'string'
			? document.getElementById(explicitNext)
			: explicitNext;
		if (target) {
			target.focus();
			return;
		}
	}

	const focusableSelector =
		'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
	const root = current.closest('form') || document.body;

	const elements = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
		.filter((el) => {
			return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
		});

	const index = elements.indexOf(current);
	if (index > -1 && index < elements.length - 1) {
		elements[index + 1].focus();
	}
}
