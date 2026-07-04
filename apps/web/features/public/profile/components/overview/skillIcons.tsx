/**
 * @file skillIcons.tsx
 * @description Maps the seed's skill `icon` slugs to concrete tabler icons so
 * skill tags render a glyph without pulling the entire icon set dynamically.
 */

import type { Icon } from '@tabler/icons-preact';
import {
	IconAccessible,
	IconBrandFigma,
	IconBrush,
	IconCode,
	IconComponents,
	IconRoute,
	IconSparkles,
	IconUsersGroup,
	IconVectorSpline,
} from '@tabler/icons-preact';

const MAP: Record<string, Icon> = {
	'components': IconComponents,
	'route': IconRoute,
	'brush': IconBrush,
	'brand-figma': IconBrandFigma,
	'code': IconCode,
	'accessible': IconAccessible,
	'vector-spline': IconVectorSpline,
	'users-group': IconUsersGroup,
};

export function SkillIcon({ icon, size = 16 }: { icon?: string; size?: number }) {
	const Cmp = (icon && MAP[icon]) || IconSparkles;
	return <Cmp size={size} />;
}
