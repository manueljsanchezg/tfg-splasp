import { useEffect, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import CreateUserModal from "../../components/CreateUserModal";
import { deleteUser, getAllUsers } from "../../service/user.service";
import type { UserResponse } from "../../types/user";

function UsersPage() {
	const [users, setUsers] = useState<UserResponse[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<number | null>(null);

	const getUsers = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await getAllUsers();
			setUsers(data);
		} catch (err) {
			console.error(err);
			setError("Error retrieving users");
		} finally {
			setIsLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: pass
	useEffect(() => {
		getUsers();
	}, []);

	const handleDeleteUser = (userId: number) => {
		setUserToDelete(userId);
	};

	const confirmDeleteUser = async () => {
		if (userToDelete === null) return;

		try {
			await deleteUser(userToDelete);
			await getUsers();
		} catch (err) {
			console.error(err);
			setError("Failed to delete user");
		} finally {
			setUserToDelete(null);
		}
	};

	const cancelDelete = () => setUserToDelete(null);

	return (
		<div className="flex flex-col gap-4 w-full px-4 py-4">
			<div className="flex flex-col justify-between items-center gap-4">
				<h1 className="text-5xl font-black text-base-content">
					User Management
				</h1>
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="btn btn-primary btn-lg text-2xl px-8 m-10"
				>
					Create User
				</button>
			</div>

			<CreateUserModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={() => {
					setIsModalOpen(false);
					getUsers();
				}}
			/>

			{error && (
				<div className="alert alert-error shadow-lg">
					<span>{error}</span>
				</div>
			)}

			<ConfirmModal
				isOpen={userToDelete !== null}
				title="Delete user"
				message="Are you sure you want to delete this user?"
				onConfirm={confirmDeleteUser}
				onCancel={cancelDelete}
			/>

			{isLoading && (
				<div className="flex justify-center items-center h-64">
					<span className="loading loading-spinner loading-lg text-primary"></span>
				</div>
			)}

			{!isLoading && users && users.length > 0 && (
				<div className="w-4/5 bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden mx-auto">
					<div className="overflow-x-auto">
						<table className="table table-lg w-full">
							<thead className="bg-base-300 text-2xl uppercase">
								<tr>
									<th className="px-4 py-4 font-bold text-center">Username</th>
									<th className="px-4 py-4 font-bold text-center">Actions</th>
								</tr>
							</thead>

							<tbody className="bg-base-100">
								{users.map((user) => (
									<tr
										key={user.id}
										className="hover:bg-base-200 border-b border-base-200 last:border-b-0"
									>
										<td className="px-4 py-4 text-center">
											<span className="font-bold text-2xl text-base-content">
												{user.username}
											</span>
										</td>
										<td className="px-4 py-4 text-center text-xl flex flex-col gap-3 items-center">
											<button
												type="button"
												className="btn btn-error text-xl"
												onClick={() => handleDeleteUser(user.id)}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{!isLoading && users && users.length === 0 && (
				<div className="flex flex-col items-center justify-center h-64 gap-4">
					<p className="text-xl font-semibold text-base-content/60">
						No users registered yet
					</p>
					<p className="text-base text-base-content/50">
						Create a user to get started
					</p>
				</div>
			)}
		</div>
	);
}

export default UsersPage;
