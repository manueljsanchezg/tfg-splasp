import type { ReactNode } from "react";
import type { AnalysisFeedback } from "../../types/analysis";

interface FeedbackPanelProps {
	feedback: AnalysisFeedback;
	showHints?: boolean;
	actions?: ReactNode;
}

export default function FeedbackPanel({
	feedback,
	showHints = true,
	actions,
}: FeedbackPanelProps) {
	return (
		<div className="w-full rounded border border-base-300 bg-base-100 p-5">
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<h2 className="text-2xl font-bold">Feedback</h2>
				{feedback.label && (
					<div className="badge badge-primary font-semibold">
						{feedback.label}
					</div>
				)}
			</div>

			<p className="text-base leading-relaxed text-base-content/90">
				{feedback.summary}
			</p>

			{actions && <div className="mt-6">{actions}</div>}

			<div className="mt-6 grid grid-cols-3 gap-4">
				<div className="rounded border border-success/30 bg-success/10 p-3">
					<h3 className="mb-3 font-bold text-success">Strengths</h3>
					{feedback.strengths.length > 0 ? (
						<ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
							{feedback.strengths.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-base-content/70">
							No strengths detected yet.
						</p>
					)}
				</div>

				<div className="rounded border border-info/30 bg-info/10 p-3">
					<h3 className="mb-3 font-bold text-info">To improve</h3>
					{feedback.improvements.length > 0 ? (
						<ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
							{feedback.improvements.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-base-content/70">
							No improvements suggested.
						</p>
					)}
				</div>

				<div className="rounded border border-warning/30 bg-warning/10 p-3">
					<h3 className="mb-3 font-bold text-warning">Alerts</h3>
					{feedback.alerts.length > 0 ? (
						<ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
							{feedback.alerts.map((alert) => (
								<li key={alert}>{alert}</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-base-content/70">No alerts detected.</p>
					)}
				</div>
			</div>

			{showHints && (
				<div className="mt-6">
					<h3 className="mb-3 text-xl font-bold">Hints</h3>
					{feedback.hints.length > 0 ? (
						<ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
							{feedback.hints.map((hint) => (
								<li key={hint}>{hint}</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-base-content/70">
							No hints available for this analysis.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
