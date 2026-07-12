/**
 * @file HomeShell.tsx
 * @description The server-rendered structural shell for `/home` — a three-zone luxury layout
 * (personal-insights column · main stream · highlights strip). It renders static chrome (greeting,
 * the inert composer) on the server and mounts the atomic islands (insights, profile-setup tracker,
 * infinite feed, highlights). No data fetching happens here; everything arrives via props from the
 * route controller (one-way state flow — see apps/web/CLAUDE.md).
 */

import type {
	HomeFeedPage,
	HomeHighlight,
	HomeInsights,
	Persona,
	ProfileSetupSummary,
} from '@projective/types';
import { FeedComposer } from '@projective/ui';
import { ActionHub } from './ActionHub.tsx';
import InsightsPanel from '../islands/InsightsPanel.island.tsx';
import HighlightsRail from '../islands/HighlightsRail.island.tsx';
import ProfileSetupCard from '../islands/ProfileSetupCard.island.tsx';
import FeedStream from '../islands/FeedStream.island.tsx';

export interface HomeShellProps {
	greeting: string;
	subtitle: string;
	displayName: string | null;
	username: string | null;
	avatarUrl: string | null;
	persona: Persona;
	profileSetup: ProfileSetupSummary | null;
	insights: HomeInsights;
	highlights: HomeHighlight[];
	feed: HomeFeedPage;
	/** DB-backed signals for the state-aware Action Hub (completed CTAs are hidden). */
	hasFreelancer: boolean;
	businessCount: number;
	teamCount: number;
	hasProjects: boolean;
}

export function HomeShell(props: HomeShellProps) {
	const profileHref = props.username ? `/${props.username}` : '/join';

	return (
		<div class='home'>
			<header class='home__greeting'>
				<h1 class='home__greeting-title'>{props.greeting}</h1>
				<p class='home__greeting-sub'>{props.subtitle}</p>
			</header>

			<div class='home__grid'>
				<div class='home__col home__col--left'>
					<InsightsPanel
						insights={props.insights}
						displayName={props.displayName}
						avatarUrl={props.avatarUrl}
						persona={props.persona}
						profileHref={props.username ? `${profileHref}?me=1` : '/join'}
					/>
				</div>

				<div class='home__col home__col--main'>
					<FeedComposer avatarUrl={props.avatarUrl} displayName={props.displayName} />

					{props.profileSetup && props.profileSetup.percent < 100 && (
						<ProfileSetupCard setup={props.profileSetup} />
					)}

					<ActionHub
						persona={props.persona}
						hasFreelancer={props.hasFreelancer}
						businessCount={props.businessCount}
						teamCount={props.teamCount}
						hasProjects={props.hasProjects}
					/>

					<FeedStream
						persona={props.persona}
						initialItems={props.feed.items}
						initialNextOffset={props.feed.nextOffset}
					/>
				</div>

				<div class='home__col home__col--right'>
					<HighlightsRail highlights={props.highlights} />
				</div>
			</div>
		</div>
	);
}

export default HomeShell;
