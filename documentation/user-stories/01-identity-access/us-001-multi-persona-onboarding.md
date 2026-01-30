# US-001: Multi-Persona Onboarding

**Epic:** Identity & Access **Persona:** New User **Status:** Ready

---

## 1. Narrative

> **As a** newly registered user\
> **I want to** select my primary persona (Freelancer or Business) and set up my basic profile\
> **So that** the platform provides me with the correct dashboard, tools, and permissions for my
> role.

---

## 2. Acceptance Criteria (AC)

- [x] **AC 1: Persona Selection:** User can choose between 'Freelancer' or 'Business'.
- [x] **AC 2: Identity Setup:** User must provide a unique `@username`, first name, and last name.
- [x] **AC 3: Profile Creation:** System creates a record in `org.users_public` and the
      corresponding persona table (`freelancer_profiles` or `business_profiles`).
- [ ] **AC 4: Context Initialization:** System initializes `security.session_context` with the new
      profile as the `active_profile_id`.
- [x] **AC 5: Validation:** Username must be alphanumeric and between 3-20 characters.
- [ ] **AC 6: Audit:** An entry is created in `security.audit_logs` capturing the onboarding event.

---

## 3. Technical Implementation Strategy

### 🏗️ Monorepo Distribution

- **`packages/types`**:
  - Create `onboarding.ts` with Zod schemas: `OnboardingInputSchema` and `ProfileTypeEnum`.
- **`packages/data`**:
  - Implement `ProfileRepository` to handle the atomic creation of public and private profile
    records.
- **`@server/services`**:
  - `AuthService.completeOnboarding(userId, data)`: Orchestrates the DB transaction and sets the
    initial session context.
- **`apps/web`**:
  - Route: `/onboarding` (Fresh Page).
  - Island: `OnboardingForm.island.tsx` (Stepper-based form).

### 🔐 Security & RLS

- **Schema**: `security`, `org`
- **Context Injection**: The API handler must use a `service_role` or a specialized function to
  create the initial `session_context`, as the user won't have an active context yet to pass RLS.
- **Audit**: Action `user.onboarding_completed`.

### 🎨 UI & BEM Components

- **Block**: `.onboarding-form`
- **UI Package**: Uses `@projective/ui/Stepper` for the multi-step flow (Persona -> Details ->
  Finish).
- **Fields**: Uses `@projective/fields/TextField` for username and name inputs.

---

## 4. CREATE Framework Alignment

- **Category**: N/A (System Identity)
- **Trigger**: Submission of the onboarding form.

---

## 5. Notes & Constraints

- **Username Conflict:** If the username is taken, the `TextField` must display an error state using
  the `MessageWrapper`.
- **Persona Switching:** While onboarding selects one, the architecture allows users to create the
  other persona later via the dashboard.
