DROP POLICY IF EXISTS "Public can view active published projects" ON projects.projects;

CREATE POLICY "Public can view active published projects" ON projects.projects
    FOR SELECT
    TO public
    USING ((status = 'active'::project_status) AND (visibility = 'public'::visibility));

DROP POLICY IF EXISTS "Users can create projects" ON projects.projects;

CREATE POLICY "Users can create projects" ON projects.projects FOR
INSERT
    TO public
WITH
    CHECK (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects.projects;

CREATE POLICY "Users can delete own projects" ON projects.projects FOR DELETE TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects.projects;

CREATE POLICY "Users can update own projects" ON projects.projects FOR
UPDATE TO public USING (auth.uid () = owner_user_id);

DROP POLICY IF EXISTS "Users can view own projects" ON projects.projects;

CREATE POLICY "Users can view own projects" ON projects.projects FOR
SELECT TO public USING (auth.uid () = owner_user_id);