import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import '../styles/pages/home/hero.css';
import { useEffect } from 'preact/hooks';

export default function HomeHeroIsland() {
	// const { setMiddleNav } = useNavigationContext();
	// useEffect(() => {
	// 	// Mount: Show middle side-nav, hide middle header
	// 	setMiddleNav({ show: true, headerHeight: '70px', sideWidth: '240px' });

	// 	return () => {
	// 		// Unmount: Reset middle nav
	// 		setMiddleNav({ show: false });
	// 	};
	// }, []);

	return (
		<section id='hero' class='home__hero'>
			<h1>Hello</h1>
		</section>
	);
}
