/* #region Imports */
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import {
	IconChevronDown,
	IconChevronRight,
	IconFileText,
	IconFolder,
	IconUser,
} from '@tabler/icons-preact';
import type { SubmissionTreeNode } from '../../../../contracts/Submissions.ts';
/* #endregion */

/* #region Interfaces */
export interface SubmissionTreeProps {
	nodes: SubmissionTreeNode[];
	/** Currently selected node id. */
	selectedId: string | null;
	onSelect: (node: SubmissionTreeNode) => void;
}
/* #endregion */

/* #region Component */
/**
 * @function SubmissionTree
 * @description The client review workspace's far-left hierarchy. Shape is decided
 * upstream by buildSubmissionTree — this component only renders/expands it:
 *   Multi-freelancer → Freelancers > Submissions > Custom Directories
 *   Single-freelancer → Submissions > Custom Directories
 */
export function SubmissionTree({ nodes, selectedId, onSelect }: SubmissionTreeProps): JSX.Element {
	// Everything is expanded by default so the reviewer sees the full picture.
	const collapsed = useSignal<Set<string>>(new Set());

	const toggle = (id: string) => {
		const next = new Set(collapsed.value);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		collapsed.value = next;
	};

	const iconFor = (kind: SubmissionTreeNode['kind']) => {
		if (kind === 'freelancer') return <IconUser size={16} />;
		if (kind === 'submission') return <IconFileText size={16} />;
		return <IconFolder size={16} />;
	};

	const renderNode = (node: SubmissionTreeNode, depth: number): JSX.Element => {
		const hasChildren = node.children.length > 0;
		const isCollapsed = collapsed.value.has(node.id);
		// Freelancer nodes are pure containers; submission/directory nodes are selectable.
		const selectable = node.kind !== 'freelancer';
		const isActive = selectable && node.id === selectedId;

		return (
			<div key={node.id} class='submission-tree__branch'>
				<div
					class={`submission-tree__row${isActive ? ' submission-tree__row--active' : ''}`}
					style={{ paddingLeft: `${0.5 + depth * 0.85}rem` }}
					onClick={() => (selectable ? onSelect(node) : toggle(node.id))}
				>
					{hasChildren
						? (
							<button
								type='button'
								class='submission-tree__caret'
								aria-label={isCollapsed ? 'Expand' : 'Collapse'}
								onClick={(e) => {
									e.stopPropagation();
									toggle(node.id);
								}}
							>
								{isCollapsed ? <IconChevronRight size={14} /> : <IconChevronDown size={14} />}
							</button>
						)
						: <span class='submission-tree__caret submission-tree__caret--leaf' />}

					<span class='submission-tree__icon'>{iconFor(node.kind)}</span>
					<span class='submission-tree__label'>{node.label}</span>
					{typeof node.count === 'number' && (
						<span class='submission-tree__count'>{node.count}</span>
					)}
				</div>

				{hasChildren && !isCollapsed && (
					<div class='submission-tree__children'>
						{node.children.map((child) => renderNode(child, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div class='submission-tree'>
			{nodes.map((node) => renderNode(node, 0))}
		</div>
	);
}
/* #endregion */
