import type { ReactNode } from "react";

interface MetricCardProps {
	value: ReactNode;
	label: string;
	tooltip?: string;
}

function MetricCard({ value, label, tooltip }: MetricCardProps) {
	return (
		<div className="flex flex-col gap-3 rounded border border-base-300 bg-base-100 p-4">
			<div className="flex items-center gap-1.5">
				<span className="text-sm font-bold uppercase text-base-content/60">
					{label}
				</span>
				{tooltip && (
					<div
						className="tooltip tooltip-bottom flex items-center justify-center"
						data-tip={tooltip}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="h-4 w-4 stroke-current text-base-content/50 hover:text-base-content cursor-help"
						>
							<title>Info</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				)}
			</div>
			<span className="text-5xl font-black leading-tight tabular-nums text-base-content">
				{value}
			</span>
		</div>
	);
}

export default MetricCard;
