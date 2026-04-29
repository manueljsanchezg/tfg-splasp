import { useEffect, useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { SavedAnalysisResult } from "../../types/project";

interface ComparisonModalProps {
	isOpen: boolean;
	analyses: SavedAnalysisResult[];
	isLoading: boolean;
	onClose: () => void;
}

type MetricKey =
	| "projectLevel"
	| "duplicateScripts"
	| "duplicationRatio"
	| "totalCombinations"
	| "maxTangling";

const metricOptions: Array<{ key: MetricKey; label: string }> = [
	{ key: "projectLevel", label: "Project level" },
	{ key: "duplicateScripts", label: "Duplicate scripts" },
	{ key: "duplicationRatio", label: "Duplication ratio" },
	{ key: "totalCombinations", label: "Total combinations" },
	{ key: "maxTangling", label: "Max tangling" },
];

function ComparisonModal({
	isOpen,
	analyses,
	isLoading,
	onClose,
}: ComparisonModalProps) {
	const [activeMetric, setActiveMetric] = useState<MetricKey>("projectLevel");

	useEffect(() => {
		if (isOpen) {
			setActiveMetric("projectLevel");
		}
	}, [isOpen]);

	const chartData = useMemo(
		() =>
			analyses.map((analysis, index) => ({
				name: `Analysis ${analysis.id ?? index + 1}`,
				value: analysis[activeMetric] ?? 0,
			})),
		[analyses, activeMetric],
	);

	return (
		<dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
			<div className="modal-box flex h-[85vh] w-11/12 max-w-6xl flex-col p-0">
				<div className="flex items-center justify-between border-b border-base-300 bg-base-200 p-4">
					<div>
						<h3 className="text-3xl font-bold">Comparison</h3>
						<p className="text-base text-base-content/70">
							{analyses.length} versions selected
						</p>
					</div>
					<button
						type="button"
						className="btn btn-ghost btn-lg"
						onClick={onClose}
					>
						X
					</button>
				</div>

				<div className="flex-1 overflow-y-auto bg-base-100 p-4">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center h-full gap-4">
							<span className="loading loading-spinner loading-lg text-primary"></span>
							<span className="text-xl font-medium text-base-content/70">
								Loading comparison...
							</span>
						</div>
					) : analyses.length === 0 ? (
						<div className="alert alert-info shadow-md">
							<span>No analyses loaded yet.</span>
						</div>
					) : (
						<div className="flex flex-col gap-6">
							<div className="join w-fit">
								{metricOptions.map((metric) => (
									<button
										type="button"
										key={metric.key}
										className={`btn join-item ${activeMetric === metric.key ? "btn-primary" : "btn-outline"}`}
										onClick={() => setActiveMetric(metric.key)}
									>
										{metric.label}
									</button>
								))}
							</div>

							<div className="h-105 w-full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={chartData}
										margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar
											dataKey="value"
											name={
												metricOptions.find(
													(metric) => metric.key === activeMetric,
												)?.label
											}
											fill="#2563eb"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					)}
				</div>
			</div>

			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose}>
					close
				</button>
			</form>
		</dialog>
	);
}

export default ComparisonModal;
