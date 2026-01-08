import React, { useEffect, useState } from "react";
import { fetchUsers, updateUserRole, deleteUser } from "../api/admin";
import toast from "react-hot-toast";
import { Search, Trash2 } from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({ page, perPage, q });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, perPage]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const changeRole = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const removeUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500 mt-1">Administer user accounts and permissions.</p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm"
            placeholder="Search by name or email..."
          />
        </form>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Role', 'Phone', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
                    >
                      <option value="donor">Donor</option>
                      <option value="recipient">Recipient</option>
                      <option value="logistics">Logistics</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => removeUser(u._id)} 
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400">No users found matching your search.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 px-2">
        <div className="text-sm text-slate-500">
          Showing {Math.min((page - 1) * perPage + 1, total)} - {Math.min(page * perPage, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
          >
            Previous
          </button>
          <button
            disabled={page * perPage >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;