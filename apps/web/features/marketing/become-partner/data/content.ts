/**
 * @file content.ts
 * @description Editorial seed for the `/become-partner` conversion funnel. Pure, serialisable data
 * (no JSX) so it can be rendered by the server shell and, for stories, re-read by the `/articles`
 * reader. Media slots hold `linear-gradient(...)` strings painted as abstract art placeholders —
 * the same pattern the profile mock uses for its editorial imagery.
 */

/** A single value-proposition card. `iconKey` is resolved to a Tabler icon in the shell. */
export interface PartnerValueProp {
	iconKey: 'compass' | 'vault' | 'shield' | 'sparkle';
	eyebrow: string;
	title: string;
	body: string;
	/** Abstract illustration placeholder (CSS gradient). */
	art: string;
}

/** A premium publication card that also backs its own `/articles/[slug]` reader page. */
export interface PartnerStory {
	slug: string;
	kicker: string;
	title: string;
	excerpt: string;
	author: string;
	role: string;
	readMins: number;
	/** Editorial cover placeholder (CSS gradient). */
	cover: string;
	/** Full article body, one string per paragraph. */
	body: string[];
}

export interface PartnerFaqItem {
	q: string;
	a: string;
}

export const PARTNER_VALUE_PROPS: PartnerValueProp[] = [
	{
		iconKey: 'compass',
		eyebrow: 'Curated demand',
		title: 'Work that finds you',
		body:
			'Your skills feed a ranking engine that surfaces you to the right clients and workspaces — no cold pitching, no race to the bottom on price.',
		art: 'linear-gradient(135deg, hsl(43 62% 52% / 0.9), hsl(38 46% 86% / 0.6) 70%, transparent)',
	},
	{
		iconKey: 'vault',
		eyebrow: 'Protected earnings',
		title: 'Escrow, before you start',
		body:
			'Every stage is funded up front and held in escrow. You deliver knowing the money is already there — released the moment your work is approved.',
		art: 'linear-gradient(150deg, hsl(222 20% 12%), hsl(43 62% 52% / 0.35) 120%)',
	},
	{
		iconKey: 'shield',
		eyebrow: 'Your terms',
		title: 'A profile that sells for you',
		body:
			'Publish premium services, showcase a portfolio, and set your own availability. Your public page becomes a storefront that quietly closes work while you sleep.',
		art: 'linear-gradient(120deg, hsl(258 70% 60% / 0.5), hsl(43 62% 52% / 0.5) 90%)',
	},
	{
		iconKey: 'sparkle',
		eyebrow: 'One identity',
		title: 'Hire and be hired',
		body:
			'Keep your client account exactly as it is. The freelancer suite layers on top — switch personas in a click, share one reputation across both.',
		art: 'linear-gradient(160deg, hsl(160 70% 42% / 0.45), hsl(38 46% 86% / 0.55) 100%)',
	},
];

export const PARTNER_STORIES: PartnerStory[] = [
	{
		slug: 'from-first-brief-to-flagship',
		kicker: 'The Craft',
		title: 'From first brief to flagship studio',
		excerpt:
			'How a solo designer turned a single stage on Projective into a six-person collective — without ever chasing an invoice.',
		author: 'Nadia Okonkwo',
		role: 'Brand & Motion Director',
		readMins: 6,
		cover: 'linear-gradient(135deg, hsl(43 62% 52%), hsl(222 20% 12%) 130%)',
		body: [
			'When Nadia unlocked her freelancer profile, she had exactly one portfolio piece and no idea whether the marketplace would notice her. Ninety days later she was turning briefs away.',
			'“The thing nobody tells you,” she says, “is that going public is a milestone, not a finish line. The moment my baseline was in — photo, headline, story, skills — the platform started routing the right work to me.”',
			'That baseline is deliberate. Projective holds a profile private until it carries enough signal to represent you well; cross the go-live threshold and you can sell premium services and apply to workspaces, even before your profile is fully polished.',
			'Nadia’s advice for new partners is disarmingly simple: fill the baseline first, publish one honest service, and let escrow do the worrying about payment.',
		],
	},
	{
		slug: 'the-economics-of-getting-paid',
		kicker: 'Money',
		title: 'The quiet economics of getting paid on time',
		excerpt:
			'Escrow-first stages changed the maths for hundreds of independents. We break down why funded work compounds.',
		author: 'Marcus Lindqvist',
		role: 'Independent Systems Engineer',
		readMins: 8,
		cover: 'linear-gradient(150deg, hsl(258 70% 60%), hsl(43 62% 52%) 120%)',
		body: [
			'Late payment is the tax nobody agrees to. On Projective, every stage is funded into escrow before a partner writes a line of code or draws a single frame.',
			'“I stopped pricing in the risk of not getting paid,” Marcus explains. “That risk used to be baked into every quote I sent. Take it out and my rates got more competitive and my income got more predictable at the same time.”',
			'The compounding effect is subtle. Predictable cash flow means partners take on the ambitious brief instead of the safe one — and ambitious work is what fills a standout portfolio.',
		],
	},
	{
		slug: 'building-a-team-worth-joining',
		kicker: 'Teams',
		title: 'Building a team worth joining',
		excerpt:
			'The best partners eventually stop working alone. Here is how the platform’s team primitives make that leap feel small.',
		author: 'Priya Anand',
		role: 'Founder, Studio Meridian',
		readMins: 5,
		cover: 'linear-gradient(120deg, hsl(160 70% 42%), hsl(222 20% 12%) 130%)',
		body: [
			'Priya never planned to run a studio. She planned to take on more interesting work than one person could deliver — and the team eventually assembled itself.',
			'“A team on Projective is just a shared identity with a vault,” she says. “The reputation you build as a partner carries into it. Clients hire the collective the same way they hired me.”',
			'Her closing thought for anyone still on the fence about unlocking a freelancer profile: “Start as one. The suite is built so that becoming many is a decision you get to make later, not a bet you make now.”',
		],
	},
];

export const PARTNER_FAQS: PartnerFaqItem[] = [
	{
		q: 'Do I lose my client account when I become a partner?',
		a: 'No. Your client account stays exactly as it is. The freelancer suite is layered on top of the same identity — you switch personas from the account menu, and your reputation is shared across both.',
	},
	{
		q: 'What does “going public” actually unlock?',
		a: 'Once your baseline is complete — a photo, a headline, your story, and your skills — you cross the go-live milestone. From there your profile can be made public, you can publish premium services, and you can apply to project workspaces, even if the rest of your profile is still a work in progress.',
	},
	{
		q: 'How do I get paid?',
		a: 'Every stage of work is funded into escrow before it begins and released the moment your delivery is approved. You never start unpaid work, and you never chase an invoice.',
	},
	{
		q: 'Is there any cost to unlock the freelancer suite?',
		a: 'Unlocking your freelancer profile is free. Projective earns only when you do, through a transparent platform fee on completed, approved work.',
	},
	{
		q: 'Can I set my own rates and availability?',
		a: 'Yes. You publish your own services, set your own availability calendar, and choose which workspaces to apply to. Nothing is auto-priced and nothing is mandatory.',
	},
];
