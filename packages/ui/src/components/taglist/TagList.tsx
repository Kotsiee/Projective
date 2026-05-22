// apps/web/packages/ui/islands/TagList.island.tsx

// #region Imports
import '../../styles/components/tag-list.css';
import { useSignal, useSignalEffect } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { Tag, TagProps } from './Tag.tsx';
// #endregion

export interface TagListProps {
	tags: string[] | {
		label: string;
		color?: TagProps['color'];
		variant?: TagProps['variant'];
		rounded?: boolean;
	}[];
	mode?: 'single' | 'multi';
	expandable?: boolean;
	rounded?: boolean;
	size?: TagProps['size'];
	color?: TagProps['color'];
	variant?: TagProps['variant'];
	fontSize?: string;
	className?: string;
}

export function TagList(props: TagListProps) {
	const {
		tags,
		mode = 'multi',
		expandable = true,
		size = 'medium',
		color = 'secondary',
		variant = 'subtle',
		rounded = false,
		fontSize,
		className,
	} = props;

	// #region State & Refs
	const containerRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLDivElement>(null);

	const isExpanded = useSignal(mode === 'multi');
	const visibleCount = useSignal(tags.length);
	// #endregion

	// #region Measurement Logic
	useSignalEffect(() => {
		if (isExpanded.value || mode === 'multi' || !containerRef.current || !measureRef.current) {
			visibleCount.value = tags.length;
			return;
		}

		const container = containerRef.current;
		const measureNode = measureRef.current;

		const observer = new ResizeObserver((entries) => {
			const containerWidth = entries[0].contentRect.width;
			const children = Array.from(measureNode.children) as HTMLElement[];

			if (children.length === 0) return;

			// Assuming a standard gap of 8px (var(--gap) equivalent)
			const GAP = 8;
			const moreButtonWidth = children[children.length - 1].offsetWidth;

			let currentWidth = 0;
			let newVisibleCount = 0;

			// Pass 1: Assume everything fits
			for (let i = 0; i < tags.length; i++) {
				const itemWidth = children[i].offsetWidth;
				if (currentWidth + itemWidth > containerWidth) break;
				currentWidth += itemWidth + GAP;
				newVisibleCount++;
			}

			// Pass 2: If everything didn't fit, recalculate reserving space for the "+X" button
			if (newVisibleCount < tags.length) {
				let currentWidthWithMore = moreButtonWidth + GAP;
				let fitCount = 0;
				for (let i = 0; i < tags.length; i++) {
					const itemWidth = children[i].offsetWidth;
					if (currentWidthWithMore + itemWidth > containerWidth) break;
					currentWidthWithMore += itemWidth + GAP;
					fitCount++;
				}
				newVisibleCount = Math.max(0, fitCount);
			}

			// Update signal directly (bypasses full render if count hasn't changed)
			if (visibleCount.value !== newVisibleCount) {
				visibleCount.value = newVisibleCount;
			}
		});

		observer.observe(container);
		return () => observer.disconnect();
	});
	// #endregion

	// #region Formatting Helpers
	const normalizedTags = tags.map((t) => typeof t === 'string' ? { label: t } : t);

	const hiddenCount = tags.length - visibleCount.value;
	// #endregion

	return (
		<div
			className={`tag-list ${isExpanded.value ? 'tag-list--multi' : 'tag-list--single'} ${
				className || ''
			}`}
			ref={containerRef}
		>
			{/* MEASUREMENT LAYER */}
			{!isExpanded.value && (
				<div className='tag-list__measure' ref={measureRef} aria-hidden='true'>
					{normalizedTags.map((tag, i) => (
						<Tag
							key={`measure-${i}`}
							size={size}
							color={tag.color || color}
							variant={tag.variant || variant}
							rounded={tag.rounded ?? rounded}
							fontSize={fontSize}
						>
							{tag.label}
						</Tag>
					))}
					<Tag size={size} color='neutral' variant='solid' rounded={rounded} fontSize={fontSize}>
						+{tags.length}
					</Tag>
				</div>
			)}

			{/* VISIBLE LAYER */}
			{normalizedTags.slice(0, visibleCount.value).map((tag, i) => (
				<Tag
					key={i}
					size={size}
					color={tag.color || color}
					variant={tag.variant || variant}
					rounded={tag.rounded ?? rounded}
					fontSize={fontSize}
				>
					{tag.label}
				</Tag>
			))}

			{/* OVERFLOW BUTTON */}
			{hiddenCount > 0 && !isExpanded.value && (
				<Tag
					size={size}
					color='neutral'
					variant='solid'
					rounded={rounded}
					fontSize={fontSize}
					onClick={expandable ? () => (isExpanded.value = true) : undefined}
					className={expandable ? 'tag-list__expand-btn' : ''}
					aria-label={`Show ${hiddenCount} more tags`}
				>
					+{hiddenCount}
				</Tag>
			)}
		</div>
	);
}
