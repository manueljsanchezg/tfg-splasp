import type { ReactNode } from "react";

interface MetricCardProps {
	value: ReactNode;
	label: string;
}

function MetricCard({ value, label }: MetricCardProps) {
	return (
		<div className="flex flex-col gap-3 rounded border border-base-300 bg-base-100 p-4">
			<span className="text-sm font-bold uppercase text-base-content/60">
				{label}
			</span>
			<span className="text-5xl font-black leading-tight tabular-nums text-base-content">
				{value}
			</span>
		</div>
	);
}

export default MetricCard;