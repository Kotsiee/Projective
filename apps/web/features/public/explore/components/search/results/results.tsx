import { useExploreContext } from '../../../contexts/ExploreContext.tsx';
import ExploreSearchResultsCategorised from './results-categorised.tsx';
import ExploreSearchResultsUncategorised from './results-uncategorised.tsx';

/**
 * @function ExploreSearchResults
 * @description Branches between the federated multi-entity view (`entityType === 'all'`) and the
 * isolated single-entity view. This is the top-level guardrail: the federated view never exposes the
 * inspector, sort, or filters; the single-entity view unlocks all three.
 */
export default function ExploreSearchResults() {
	const { entityType } = useExploreContext();
	return entityType.value === 'all'
		? <ExploreSearchResultsUncategorised />
		: <ExploreSearchResultsCategorised />;
}
