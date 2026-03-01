-- Projects
ALTER TABLE projects.projects 
  DROP CONSTRAINT IF EXISTS projects_owner_user_id_fkey,
  ADD CONSTRAINT projects_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES org.users_public (user_id);

-- Activity Log
ALTER TABLE projects.project_activity 
  DROP CONSTRAINT IF EXISTS project_activity_actor_user_id_fkey,
  ADD CONSTRAINT project_activity_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES org.users_public (user_id);

-- Stage Assignments
ALTER TABLE projects.stage_assignments 
  DROP CONSTRAINT IF EXISTS stage_assignments_assigned_by_fkey,
  ADD CONSTRAINT stage_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES org.users_public (user_id);

-- Submissions
ALTER TABLE projects.stage_submissions 
  DROP CONSTRAINT IF EXISTS stage_submissions_submitted_by_fkey,
  ADD CONSTRAINT stage_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES org.users_public (user_id);

-- User Preferences
ALTER TABLE projects.user_preferences 
  DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey,
  ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES org.users_public (user_id);

-- Revision Requests
ALTER TABLE projects.stage_revision_requests 
  DROP CONSTRAINT IF EXISTS stage_revision_requests_requested_by_fkey,
  ADD CONSTRAINT stage_revision_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES org.users_public (user_id);