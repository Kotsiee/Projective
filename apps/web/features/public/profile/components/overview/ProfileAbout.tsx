/**
 * @file ProfileAbout.tsx
 * @description Plain-text headline + an isolated "About" section under a clean
 * standard heading. No quote styling, no rich-text/HTML rendering — text is
 * parsed as plain paragraphs with natural line breaks.
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
	const p = profile.value;
	const paragraphs = p.about.split('\n\n');

	return (
		<section class='profile-about'>
			{p.headline && <p class='profile-about__headline'>{p.headline}</p>}

			<h2 class='profile-about__heading'>About</h2>
			{paragraphs.map((para, i) => (
				<p key={i} class='profile-about__para'>
					<PlainText text={para} />
				</p>
			))}

			{p.howIWork.length > 0 && (
				<div class='profile-about__how'>
					<h3 class='profile-about__how-title'>How I work</h3>
					<ul class='profile-about__list'>
						{p.howIWork.map((item, i) => <li key={i}>{item}</li>)}
					</ul>
				</div>
			)}
		</section>
	);
}
