import type React from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";

function PageLayout({
	children,
	showNav = true,
}: {
	children: React.ReactNode;
	showNav?: boolean;
}) {
	const location = useLocation();
	const hideNavPaths = ["/login"];
	const effectiveShowNav = showNav && !hideNavPaths.includes(location.pathname);

	return (
		<>
			{effectiveShowNav && <NavBar />}
			<div className="min-h-screen bg-base-200 flex flex-col items-center py-2 px-2 gap-12 font-sans w-full">
				<main className="w-full flex-1 flex flex-col items-center">
					{children}
				</main>
			</div>
		</>
	);
}

export default PageLayout;
