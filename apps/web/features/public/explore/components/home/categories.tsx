import '../../styles/components/home/categories.css';
import {
	IconBrain,
	IconCode,
	IconMovie,
	IconMusic,
	IconPalette,
	IconPencil,
	IconSchool,
	IconSpeakerphone,
} from '@tabler/icons-preact';
import { HOME_CATEGORIES } from '../../data/exploreSeed.ts';

const ICONS: Record<string, typeof IconCode> = {
	'c-dev': IconCode,
	'c-design': IconPalette,
	'c-marketing': IconSpeakerphone,
	'c-courses': IconSchool,
	'c-video': IconMovie,
	'c-data': IconBrain,
	'c-writing': IconPencil,
	'c-audio': IconMusic,
};

/**
 * @function ExploreHomeCategories
 * @description Interactive row of accent-tinted category pills sitting directly beneath the hero.
 */
export default function ExploreHomeCategories() {
	return (
		<nav class='explore-categories' aria-label='Browse categories'>
			<div class='explore-categories__row'>
				{HOME_CATEGORIES.map((cat) => {
					const Icon = ICONS[cat.id];
					return (
						<a
							key={cat.id}
							href={`/explore?q=${encodeURIComponent(cat.name)}`}
							class={`explore-categories__pill accent-${cat.accent}`}
							draggable={false}
						>
							{Icon && (
								<span class='explore-categories__icon'>
									<Icon size={16} />
								</span>
							)}
							{cat.name}
						</a>
					);
				})}
			</div>
		</nav>
	);
}
