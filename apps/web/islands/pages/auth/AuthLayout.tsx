import '@styles/layouts/auth.css';
import { type ComponentChildren } from 'preact';

type AuthLayoutProps = {
	children: ComponentChildren;
};

export default function AuthLayout(props: AuthLayoutProps) {
	return (
		<div class='layout-auth'>
			<img
				src='https://images.unsplash.com/photo-1690791456616-8d7a5cb8925d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
				alt='background'
				class='background'
			/>

			<div class='layout-auth__modal'>
				<div class='layout-auth__modal__window'>
					<img
						src='https://images.unsplash.com/photo-1690791456616-8d7a5cb8925d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
						alt='background'
						class='backgrounds'
					/>
					<div class='layout-auth__modal__window__content'>
						<div class='layout-auth__modal__window__content__quote'>
							<p>Everything you can imagine is real</p>
							<div class='layout-auth__modal__window__content__quote__line-container'>
								<div class='layout-auth__modal__window__content__quote__line'></div>
								<span>Pablo Picasso</span>
							</div>
						</div>

						<div class='layout-auth__modal__window__content__slogan'>
							<h1 class='build-together'>Build Together.</h1>
							<h1 class='deliver-better'>Deliver Better.</h1>
						</div>
					</div>
				</div>

				<div class='layout-auth__modal__content'>
					<h1>Welcome</h1>
					{props.children}
				</div>
			</div>
		</div>
	);
}
