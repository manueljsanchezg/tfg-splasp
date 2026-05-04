import { useAuth } from "../hooks/useAuth";

function HomePage() {
	const { isAuthenticated } = useAuth();

	return (
		<div className="flex flex-col items-center gap-12 w-full py-10 px-6">
			<div className="w-full max-w-6xl">
				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
					<div className="flex flex-col gap-6 text-center lg:text-left lg:max-w-sm">
						<h1 className="text-8xl font-black text-base-content drop-shadow-sm">
							Splasp<span className="text-primary">!</span>
						</h1>
						<h2 className="text-3xl text-base-content/60 font-medium">
							Variability Analyzer for Snap!
						</h2>
					</div>
					<div className="flex flex-col gap-4 w-full lg:max-w-3xl">
						<div className="border border-base-300 rounded-2xl p-8 shadow-sm">
							<h3 className="text-2xl font-bold mb-6 text-left">
								{isAuthenticated
									? "Features for Educators & Researchers"
									: "Features for Students"}
							</h3>
							<div className="grid gap-4 text-left sm:grid-cols-2">
								<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
									<h4 className="text-lg font-bold">Project analysis</h4>
									<p className="mt-2 text-base-content/70">
										Analyze your project and understand its variability profile.
									</p>
								</div>
								<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
									<h4 className="text-lg font-bold">Instant feedback</h4>
									<p className="mt-2 text-base-content/70">
										Get quick, clear feedback on project structure and metrics.
									</p>
								</div>
								{isAuthenticated ? (
									<>
										<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
											<h4 className="text-lg font-bold">Bulk uploads</h4>
											<p className="mt-2 text-base-content/70">
												Upload multiple files via URL or a zip with XML
												projects.
											</p>
										</div>
										<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
											<h4 className="text-lg font-bold">Session management</h4>
											<p className="mt-2 text-base-content/70">
												Create and manage sessions for classroom activities.
											</p>
										</div>
										<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
											<h4 className="text-lg font-bold">Visual comparisons</h4>
											<p className="mt-2 text-base-content/70">
												Compare projects and sessions with clear charts.
											</p>
										</div>
										<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
											<h4 className="text-lg font-bold">Exportable metrics</h4>
											<p className="mt-2 text-base-content/70">
												Download session results for reporting and review.
											</p>
										</div>
									</>
								) : (
									<>
										<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
											<h4 className="text-lg font-bold">Join by code</h4>
											<p className="mt-2 text-base-content/70">
												Access sessions in seconds with a short join code.
											</p>
										</div>
										<div className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
											<h4 className="text-lg font-bold">No account needed</h4>
											<p className="mt-2 text-base-content/70">
												Start analyzing without creating a login.
											</p>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default HomePage;
