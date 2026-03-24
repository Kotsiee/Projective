# Selected Codebase Context

> Included paths: ./apps/web/routes/(dashboard)/projects

## Project Tree (Selected)

```text
./apps/web/routes/(dashboard)/projects/
  projects/
  (_islands)/
  Index.island.tsx
  Layout.island.tsx
  new/
  Index.island.tsx
  project/
  Index.island.tsx
  stage/
  Chat.island.tsx
  files/
  Layout.island.tsx
  index.tsx
  new/
  index.tsx
  _layout_.tsx
  [projectid]/
  finance.tsx
  index.tsx
  settings.tsx
  team.tsx
  timeline.tsx
  [stageid]/
  calendar.tsx
  chat.tsx
  details.tsx
  files/
  index.tsx
  [fileid].tsx
  submissions/
  index.tsx
  [submissionid].tsx
  _layout.tsx
  _layout.tsx
  _middleware.ts
```

## File Contents

### File: apps\web\routes\(dashboard)\projects\(_islands)\Index.island.tsx

```tsx
export default function ProjectsIsland() {
	return <div></div>;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\Layout.island.tsx

```tsx
import { ProjectsLayoutIsland } from 'packages/features/dashboard/projects/client.ts';
import { ComponentChildren } from 'preact';

type ProjectsLayoutProps = {
	url: URL;
	projectId: string | undefined;
	children: ComponentChildren;
};

export default function ProjectsLayoutIslandWrapper(props: ProjectsLayoutProps) {
	return <ProjectsLayoutIsland {...props} />;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\new\Index.island.tsx

```tsx
import { NewProjectIsland } from 'packages/features/dashboard/projects/client.ts';

export default function NewProjectIslandWrapper() {
	return <NewProjectIsland />;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\project\Index.island.tsx

```tsx
import { ProjectIsland } from 'packages/features/dashboard/projects/client.ts';

export default function ProjectIslandWrapper() {
	return <ProjectIsland />;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\project\stage\Chat.island.tsx

```tsx
import { ProjectChatIsland } from 'packages/features/dashboard/projects/client.ts';

export default function ProjectChatIslandWrapper() {
	return <ProjectChatIsland />;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\project\stage\files\File.island.tsx

```tsx
import { ProjectFileIsland } from 'packages/features/dashboard/projects/client.ts';

export default function ProjectStageFileWrapper() {
	return <ProjectFileIsland />;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\project\stage\files\Index.island.tsx

```tsx
import { ProjectFilesIsland } from 'packages/features/dashboard/projects/client.ts';

export default function ProjectStageFilesWrapper() {
	return <ProjectFilesIsland />;
}

```

### File: apps\web\routes\(dashboard)\projects\(_islands)\project\stage\Layout.island.tsx

```tsx
import { StageLayoutIsland } from 'packages/features/dashboard/projects/client.ts';
import { ComponentChildren } from 'preact';

type StageLayoutProps = {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
};

export default function StageLayoutIslandWrapper(props: StageLayoutProps) {
	return <StageLayoutIsland {...props} />;
}

```

### File: apps\web\routes\(dashboard)\projects\index.tsx

```tsx
export default function Projects() {
	return (
		<div
			style={{
				minHeight: '500vh',
			}}
		>
			<div>
				<h1>Select a project</h1>
				<p>
					Or <a href='/projects/new'>Join</a> a New One
				</p>
			</div>
			<div>
				<h3>Recommended Projects</h3>
			</div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\new\index.tsx

```tsx
import NewProjectIslandWrapper from '../(_islands)/new/Index.island.tsx';

export default function NewProject() {
	return (
		<div class='new-project__container'>
			<NewProjectIslandWrapper />
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\new\_layout_.tsx

```tsx
import { define } from '@utils';
import { LayoutConfig } from 'fresh';

export const config: LayoutConfig = {
	skipInheritedLayouts: true, // Skip already inherited layouts
};

export default define.layout(function App(ctx) {
	return (
		<div>
			<ctx.Component />
		</div>
	);
});

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\finance.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\index.tsx

```tsx
import { PageProps } from 'fresh';
import ProjectIslandWrapper from '../(_islands)/project/Index.island.tsx';

export default function Project(props: PageProps) {
	return (
		<>
			<ProjectIslandWrapper />
		</>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\settings.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\team.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\timeline.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\calendar.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\chat.tsx

```tsx
import ProjectChatIslandWrapper from '../../(_islands)/project/stage/Chat.island.tsx';

export default function ProjectChat() {
	return <ProjectChatIslandWrapper />;
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\details.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\files\index.tsx

```tsx
import ProjectStageFilesWrapper from '../../../(_islands)/project/stage/files/Index.island.tsx';

export default function ProjectStageFiles() {
	return <ProjectStageFilesWrapper />;
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\files\[fileid].tsx

```tsx
import ProjectStageFileWrapper from '../../../(_islands)/project/stage/files/File.island.tsx';

export default function ProjectStageAttachment() {
	return <ProjectStageFileWrapper />;
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\submissions\index.tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\submissions\[submissionid].tsx

```tsx
export default function Projects() {
	return (
		<div>
		</div>
	);
}

```

### File: apps\web\routes\(dashboard)\projects\[projectid]\[stageid]\_layout.tsx

```tsx
import { define } from '@utils';
import StageLayoutIslandWrapper from '../../(_islands)/project/stage/Layout.island.tsx';

export default define.layout(function App(ctx) {
	const { projectid, stageid } = ctx.params;

	return (
		<>
			<StageLayoutIslandWrapper projectId={projectid} stageId={stageid}>
				<ctx.Component />
			</StageLayoutIslandWrapper>
		</>
	);
});

```

### File: apps\web\routes\(dashboard)\projects\_layout.tsx

```tsx
import ProjectsLayoutIslandWrapper from './(_islands)/Layout.island.tsx';
import { define } from '@utils';
import { Partial } from 'fresh/runtime';

export default define.layout(function App(ctx) {
	return (
		<ProjectsLayoutIslandWrapper url={ctx.url} projectId={ctx.params.projectid}>
			<Partial name='project-content'>
				<ctx.Component />
			</Partial>
		</ProjectsLayoutIslandWrapper>
	);
});

```

### File: apps\web\routes\(dashboard)\projects\_middleware.ts

```ts
import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	if (ctx.params.projectid) {
		ctx.state.slugs = {
			projectId: ctx.params.projectid,
		};
	}

	if (ctx.params.stageid) {
		ctx.state.slugs = {
			...ctx.state.slugs,
			stageId: ctx.params.stageid,
		};
	}

	const res = await ctx.next();
	return res;
});

```

