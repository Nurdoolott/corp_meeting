export default function TopBar({ user }) {
  if (!user) return null;

  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">CorpMeet</h1>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {user.full_name}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold
          ${
            user.role === "admin"
              ? "bg-red-100 text-red-700"
              : user.role === "organizer"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {user.role}
        </span>
      </div>
    </div>
  );
}
