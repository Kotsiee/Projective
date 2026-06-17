import { Button, Icon } from '@projective/ui';
import { IconMenu } from '@tabler/icons-preact';

export default function NavigationHeaderUser() {
	return (
		<Button aria-label='User' rounded className='navigation__user' variant='secondary'>
			<Icon class='navigation__user-icon' size={18}>
				<IconMenu />
			</Icon>
			<div class='navigation__user-avatar'>
				<img src='https://www.mamp.one/wp-content/uploads/2024/09/image-resources2.jpg' />
			</div>
		</Button>
	);
}
