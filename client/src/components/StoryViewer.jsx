import { useEffect, useMemo, useState } from "react";

const STORY_DURATION_MS = 30000;

const StoryViewer = ({ group, currentUser, onClose, onViewed, onDelete, onGroupComplete }) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const story = group?.stories[index];
  const isMine = group?.user?._id === (currentUser?.id || currentUser?._id);
  const formattedTime = useMemo(
    () =>
      story
        ? new Date(story.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
        : "",
    [story]
  );

  useEffect(() => {
    setIndex(0);
  }, [group?.user?._id]);

  useEffect(() => {
    setProgress(0);
  }, [story?._id]);

  useEffect(() => {
    if (!story) {
      return undefined;
    }

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min((elapsed / STORY_DURATION_MS) * 100, 100);
      setProgress(nextProgress);

      if (elapsed >= STORY_DURATION_MS) {
        window.clearInterval(intervalId);
        handleAdvance();
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [story?._id]);

  if (!group || !story) {
    return null;
  }

  const handleAdvance = async () => {
    await onViewed(story._id);

    if (index < group.stories.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    const didMoveToNextGroup = await onGroupComplete?.(group);
    if (!didMoveToNextGroup) {
      onClose();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };

  const handleNext = async () => {
    await handleAdvance();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl">
        <div className="flex gap-1 p-4">
          {group.stories.map((item, itemIndex) => (
            <div key={item._id} className="h-1.5 flex-1 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-100"
                style={{
                  width:
                    itemIndex < index ? "100%" : itemIndex === index ? `${progress}%` : "0%"
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                group.user.profilePicture ||
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
              }
              alt={group.user.username}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{group.user.name?.trim() || group.user.username}</p>
              <p className="text-xs text-slate-300">{formattedTime}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-200">
            Close
          </button>
        </div>

        {story.imageUrl ? (
          <img src={story.imageUrl} alt="Story" className="max-h-[65vh] w-full object-cover" />
        ) : (
          <div className="grid min-h-[24rem] place-items-center bg-[linear-gradient(135deg,#1d4ed8,#0f172a)] p-8 text-center">
            <p className="text-2xl font-bold">{story.text}</p>
          </div>
        )}

        {story.text ? (
          <div className="px-5 py-4">
            <p className="text-sm leading-6 text-slate-100">{story.text}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-4">
          <button type="button" onClick={handlePrev} className="rounded-full bg-white/10 px-4 py-2 text-sm">
            Previous
          </button>
          <div className="flex gap-2">
            {isMine ? (
              <button
                type="button"
                onClick={() => onDelete(story._id)}
                className="rounded-full bg-rose-500/20 px-4 py-2 text-sm text-rose-100"
              >
                Delete
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              {index < group.stories.length - 1 ? "Next" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
