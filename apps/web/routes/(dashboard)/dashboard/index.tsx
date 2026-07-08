import DashboardIslandWrapper from './(_islands)/DashboardIslandWrapper.tsx';

/**
 * Business Administration & Financial Overview (US-008). The dashboard home renders the live admin
 * panel: real-time wallet balances, active-project counts, quick actions, the finance hub and the
 * member visibility list — all driven by the Postgres ledger engine.
 */
export default function Dashboard() {
	return <DashboardIslandWrapper />;
}
