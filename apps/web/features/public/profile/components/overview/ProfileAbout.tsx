/**
 * @file ProfileAbout.tsx
 * @description The isolated "About" section under a clean standard heading.
 * Plain-text parsing with natural line breaks — no headline, no "How I work"
 * block, no rich-text/HTML. The subtitle in the header serves as the headline.
 */

import { useProfileContext } from '../../contexts/ProfileContext.tsx';

/** Renders plain text preserving single line breaks within a paragraph. */
function PlainText({ text }: { text: string }) {
	const lines = text.split('\n');
	return (
		<>
			{lines.map((line, i) => (
				<span key={i}>
					{line}
					{i < lines.length - 1 && <br />}
				</span>
			))}
		</>
	);
}

export default function ProfileAbout() {
	const { profile } = useProfileContext();
	const paragraphs = profile.value.about.split('\n\n');

	return (
		<section class='profile-about'>
			<h2 class='profile-about__heading'>About</h2>
			{paragraphs.map((para, i) => (
				<p key={i} class='profile-about__para'>
					<PlainText text={para} />
				</p>
			))}
		</section>
	);
}
