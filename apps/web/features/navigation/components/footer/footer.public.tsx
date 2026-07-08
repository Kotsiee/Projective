import { Icon, Logo } from '@projective/ui';
import {
	IconBrandDribbble,
	IconBrandGithub,
	IconBrandInstagram,
	IconBrandLinkedin,
	IconBrandX,
	IconShieldCheck,
} from '@tabler/icons-preact';

/**
 * @component PublicFooter
 * @description The dense, multi-column global footer rendered beneath every public route. Purely
 * presentational + server-rendered, so its stylesheet ships via the global aggregator
 * (`apps/web/styles/styles.css` → `footer.public.css`) rather than an island bundle.
 */

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
	{
		title: 'Discover',
		links: [
			{ label: 'Explore', href: '/explore' },
			{ label: 'Services', href: '/explore?type=service' },
			{ label: 'Talent', href: '/explore?type=person' },
			{ label: 'Teams', href: '/explore?type=team' },
			{ label: 'Projects', href: '/explore?type=project' },
			{ label: 'Products', href: '/explore?type=product' },
		],
	},
	{
		title: 'For clients',
		links: [
			{ label: 'Post a project', href: '/join' },
			{ label: 'Hire talent', href: '/explore?type=person' },
			{ label: 'How escrow works', href: '/about' },
			{ label: 'Pricing', href: '/about' },
			{ label: 'Enterprise', href: '/about' },
		],
	},
	{
		title: 'For talent',
		links: [
			{ label: 'Find work', href: '/explore?type=project' },
			{ label: 'Build a profile', href: '/join' },
			{ label: 'Get paid', href: '/about' },
			{ label: 'Community', href: '/help' },
			{ label: 'Academy', href: '/help' },
		],
	},
	{
		title: 'Company',
		links: [
			{ label: 'About', href: '/about' },
			{ label: 'Careers', href: '/about' },
			{ label: 'Blog', href: '/help' },
			{ label: 'Help center', href: '/help' },
			{ label: 'Contact', href: '/help' },
		],
	},
];

const SOCIALS = [
	{ label: 'X', href: 'https://x.com', icon: <IconBrandX size={17} /> },
	{ label: 'GitHub', href: 'https://github.com', icon: <IconBrandGithub size={17} /> },
	{ label: 'LinkedIn', href: 'https://linkedin.com', icon: <IconBrandLinkedin size={17} /> },
	{ label: 'Instagram', href: 'https://instagram.com', icon: <IconBrandInstagram size={17} /> },
	{ label: 'Dribbble', href: 'https://dribbble.com', icon: <IconBrandDribbble size={17} /> },
];

const LEGAL = [
	{ label: 'Terms', href: '/terms' },
	{ label: 'Privacy', href: '/privacy' },
	{ label: 'Security', href: '/about' },
	{ label: 'Cookies', href: '/privacy' },
];

export default function PublicFooter() {
	return (
		<footer class='site-footer' aria-labelledby='site-footer-brand'>
			<div class='site-footer__glow' aria-hidden='true' />

			<div class='site-footer__inner'>
				{/* Brand + trust + socials */}
				<div class='site-footer__brand'>
					<a href='/' class='site-footer__logo' id='site-footer-brand' aria-label='Projective home'>
						<Icon size={26}>
							<Logo color='var(--primary)' />
						</Icon>
						<span class='site-footer__wordmark'>Projective</span>
					</a>
					<p class='site-footer__tagline'>
						Stage-based freelancing where every milestone is escrow-backed. Fund a stage, ship the
						work, release with confidence.
					</p>
					<div class='site-footer__trust'>
						<IconShieldCheck size={16} />
						<span>Escrow-protected payments · Dispute resolution built in</span>
					</div>
					<div class='site-footer__socials'>
						{SOCIALS.map((s) => (
							<a
								key={s.label}
								class='site-footer__social'
								href={s.href}
								target='_blank'
								rel='noopener noreferrer'
								aria-label={s.label}
							>
								{s.icon}
							</a>
						))}
					</div>
				</div>

				{/* Link columns */}
				<nav class='site-footer__nav' aria-label='Footer'>
					{COLUMNS.map((col) => (
						<div class='site-footer__col' key={col.title}>
							<h3 class='site-footer__col-title'>{col.title}</h3>
							<ul class='site-footer__list'>
								{col.links.map((l) => (
									<li key={l.label}>
										<a class='site-footer__link' href={l.href}>{l.label}</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>
			</div>

			{/* Bottom bar */}
			<div class='site-footer__bar'>
				<div class='site-footer__inner site-footer__bar-inner'>
					<span class='site-footer__copy'>© 2026 Projective. All rights reserved.</span>
					<span class='site-footer__region'>🌐 English (US) · USD</span>
					<ul class='site-footer__legal'>
						{LEGAL.map((l) => (
							<li key={l.label}>
								<a class='site-footer__legal-link' href={l.href}>{l.label}</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</footer>
	);
}
