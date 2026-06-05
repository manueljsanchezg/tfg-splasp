import { useState } from "react";
import { getProjectVersions } from "../../service/project.service";
import type {
	ProjectResponse,
	ProjectVersionResponse,
} from "../../types/project";

export const formatDate = (dateString: string | undefined | null) => {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
};

function ProjectRow({
	project,
	onViewAnalysis,
	onAddVersionId,
	selectedVersionIds,
}: {
	project: ProjectResponse;
	onViewAnalysis: (v: ProjectVersionResponse, title: string) => void;
	onAddVersionId: (versionId: number) => void;
	selectedVersionIds: number[];
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [versions, setVersions] = useState<ProjectVersionResponse[] | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleToggle = async () => {
		setIsExpanded(!isExpanded);

		if (!isExpanded && versions === null) {
			setIsLoading(true);
			setError(null);
			try {
				const data = await getProjectVersions(project.id);
				setVersions(data);
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Error loading versions",
				);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<>
			<tr className="hover:bg-base-200 cursor-pointer" onClick={handleToggle}>
				<td className="font-bold pl-8 py-6">{project.title}</td>
				<td className="text-center pr-8 py-6">
					{formatDate(project.createdAt)}
				</td>
			</tr>

			{isExpanded && (
				<tr className="bg-base-200/40">
					<td colSpan={2} className="p-8 border-b border-base-300">
						<h4 className="font-bold mb-6 text-xl border-b pb-2">Versions</h4>
						{error && <p className="text-error mb-4">{error}</p>}

						{isLoading ? (
							<span className="loading loading-spinner text-primary"></span>
						) : !versions || versions.length === 0 ? (
							<p className="text-base-content/60">No versions found.</p>
						) : (
							<div className="flex flex-wrap gap-4">
								{versions.map((version) => {
									const isSelected = selectedVersionIds.includes(version.id);
									return (
										<div key={version.id} className="flex w-72 flex-col gap-3">
											<button
												type="button"
												className={`card shadow-sm border w-full text-left transition-colors cursor-pointer ${
													isSelected
														? "bg-primary/10 border-primary shadow-md"
														: "bg-base-100 border-base-300"
												}`}
												onClick={() => onAddVersionId(version.id)}
											>
												<div className="card-body p-6">
													<div className="flex flex-row items-center justify-between gap-4">
														<h5 className="font-bold text-xl mb-1">
															Version {version.versionNumber}
														</h5>
														<input
															type="checkbox"
															className="checkbox checkbox-primary"
															checked={isSelected}
															readOnly
														/>
													</div>
													<p className="text-base-content/60 mb-4">
														{formatDate(version.uploadedAt)}
													</p>
												</div>
											</button>
											<button
												type="button"
												className={`btn ${isSelected ? "btn-primary" : "btn-outline"}`}
												onClick={() => onViewAnalysis(version, project.title)}
											>
												View Results
											</button>
										</div>
									);
								})}
							</div>
						)}
					</td>
				</tr>
			)}
		</>
	);
}

export default ProjectRow;
