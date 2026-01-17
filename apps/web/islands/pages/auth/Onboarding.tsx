import "@styles/pages/auth/onboarding.css";
import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import OnboardingSubmit from "@components/auth/OnboardingSubmit.tsx";
import { DateTime } from "@projective/types";
import { DateField, TextField } from "@projective/fields";

const firstName = signal("");
const lastName = signal("");
const username = signal("");
const dob = signal(new DateTime().minus(18, "years"));
const type = signal<"freelancer" | "client">("client");

export default function OnboardingIsland() {
	useEffect(() => {
		const run = async () => {
			const response = await fetch("/api/v1/auth/user", {
				method: "GET",
			});

			if (response.ok && response.status === 200) {
				const resp = await response.json();
				firstName.value = resp.firstName ?? "";
				lastName.value = resp.lastName ?? "";
				username.value = resp.username ?? "";
				console.log(resp);
			}
		};

		run();
	}, []);

	const onUserTypeChange = (e: InputEvent) => {
		type.value = (e.currentTarget as HTMLInputElement)
			.value as ("freelancer" | "client");
	};

	return (
		<div class="onboarding">
			<div class="onboarding-stages">
				<form class="onboarding-stage">
					<div class="onboarding-stage__account-type__container">
						<label
							for="onboarding-stage__account-type--client"
							class="onboarding-stage__account-type"
						>
							<input
								type="radio"
								name="onboarding-stage__account-type"
								id="onboarding-stage__account-type--client"
								value="client"
								hidden
								checked={type.value === "client"}
								onInput={onUserTypeChange}
							/>
							Client
						</label>
						<label
							for="onboarding-stage__account-type--seller"
							class="onboarding-stage__account-type"
						>
							<input
								type="radio"
								name="onboarding-stage__account-type"
								id="onboarding-stage__account-type--seller"
								value="freelancer"
								hidden
								checked={type.value === "freelancer"}
								onInput={onUserTypeChange}
							/>
							Seller
						</label>
					</div>

					<hr class="onboarding-stage__separator" />

					<div class="onboarding-stage__name">
						<TextField
							name="first_name"
							value={firstName.value}
							placeholder="First Name"
							label="First Name"
							onChange={(val) => firstName.value = val.toString()}
						/>
						<TextField
							name="last_name"
							value={lastName.value}
							placeholder="Last Name"
							label="Last Name"
							onChange={(val) => lastName.value = val.toString()}
						/>
					</div>

					<DateField
						name="dob"
						maxDate={new DateTime().minus(18, "years")}
						value={dob.value}
						placeholder="DoB"
						label="DoB"
						onChange={(val) => dob.value = val}
					/>
					<TextField
						name="username"
						value={username.value}
						placeholder="Username"
						label="Username"
						onChange={(val) => username.value = val.toString()}
					/>
				</form>
			</div>
			<div class="onboarding-stage-location">
				<OnboardingSubmit
					firstName={firstName.value}
					lastName={lastName.value}
					username={username.value}
					dob={dob.value.toISO()}
					type={type.value}
				/>
			</div>
		</div>
	);
}
