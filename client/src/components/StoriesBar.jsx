const StoriesBar = ({ stories, currentUser, onOpenGroup }) => {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Stories</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">What’s happening now</h3>
        </div>
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {stories.map((group) => {
          const isMine = group.user._id === (currentUser?.id || currentUser?._id);

          return (
            <button
              key={group.user._id}
              type="button"
              onClick={() => onOpenGroup(group)}
              className="min-w-[92px] text-left"
            >
              <div
                className={`rounded-[1.7rem] p-[3px] ${
                  group.hasUnseen
                    ? "bg-[linear-gradient(135deg,#2563eb,#38bdf8,#14b8a6)]"
                    : "bg-slate-200"
                }`}
              >
                <div className="rounded-[1.5rem] bg-white p-1">
                  <img
                    src={
                      group.user.profilePicture ||
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={group.user.username}
                    className="h-20 w-20 rounded-[1.2rem] object-cover"
                  />
                </div>
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">
                {isMine ? "Your story" : group.user.name?.trim() || group.user.username}
              </p>
              <p className="truncate text-xs text-slate-500">@{group.user.username}</p>
            </button>
          );
        })}

        {!stories.length ? (
          <p className="text-sm text-slate-500">No active stories yet. Post one to get started.</p>
        ) : null}
      </div>
    </section>
  );
};

export default StoriesBar;
