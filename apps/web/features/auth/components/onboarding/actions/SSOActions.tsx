import { Button, Icon } from '@projective/ui';
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-preact';

export function SSOActions() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					color: 'var(--text-muted)',
					fontSize: '0.75rem',
					marginBottom: '0.5rem',
				}}
			>
				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
				<span style={{ padding: '0 1rem' }}>OR</span>
				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
			</div>

			<Button
				variant='secondary'
				fullWidth
				onClick={() =>
					globalThis.location.href = '/api/v1/auth/google'}
			>
				<Icon>
					<IconBrandGoogle />
				</Icon>
				Continue with Google
			</Button>
			<Button
				variant='secondary'
				fullWidth
				onClick={() => globalThis.location.href = '/api/v1/auth/github'}
			>
				<Icon>
					<IconBrandGithub />
				</Icon>
				Continue with GitHub
			</Button>
		</div>
	);
}
