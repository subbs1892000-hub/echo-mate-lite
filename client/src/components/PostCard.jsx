import { useState } from "react";
import { Link } from "react-router-dom";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

const PostCard = ({
  post,
  currentUser,
  onLike,
  onSave,
  onDelete,
  onUpdate,
  onAddComment,
  onDeleteComment
}) => {
  const displayName = post.user?.name?.trim() || post.user?.username || "Unknown User";
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(post.text || "");
  const [draftImage, setDraftImage] = useState(post.imageUrl || "");
  const [commentText, setCommentText] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUserId === post.user?._id;
  const hasLiked = post.likes?.some((like) => like === currentUserId);
  const hasSaved = currentUser?.savedPosts?.some((savedPostId) => savedPostId === post._id);

  const handleSave = async () => {
    const didSave = await onUpdate(post._id, { text: draftText, imageUrl: draftImage });
    if (didSave) {
      setIsEditing(false);
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    const didComment = await onAddComment(post._id, commentText);
    if (didComment) {
      setCommentText("");
      setIsCommentsOpen(true);
    }
  };

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/u/${post.user?.username}`} className="flex items-center gap-3">
            <img
              src={
                post.user?.profilePicture ||
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
              }
              alt={displayName}
              className="h-12 w-12 rounded-full object-cover ring-4 ring-slate-100"
            />
            <div>
              <h3 className="font-semibold text-slate-900">{displayName}</h3>
              <p className="text-sm text-slate-500">@{post.user?.username}</p>
            </div>
          </Link>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {formatDate(post.createdAt)}
            </p>
            {post.editedAt ? <p className="mt-1 text-xs text-slate-400">Edited</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              className="min-h-28 w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
              maxLength={500}
            />
            <input
              type="text"
              value={draftImage}
              onChange={(event) => setDraftImage(event.target.value)}
              className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
              placeholder="Image URL or uploaded data URL"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Save Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftText(post.text || "");
                  setDraftImage(post.imageUrl || "");
                  setIsEditing(false);
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.text ? <p className="whitespace-pre-wrap text-slate-700">{post.text}</p> : null}
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="max-h-[420px] w-full rounded-[1.5rem] object-cover"
              />
            ) : null}
          </>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onLike(post._id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              hasLiked
                ? "bg-rose-100 text-rose-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {hasLiked ? "Liked" : "Like"} · {post.likes?.length || 0}
          </button>

          <button
            type="button"
            onClick={() => setIsCommentsOpen((prev) => !prev)}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Comments · {post.comments?.length || 0}
          </button>

          <button
            type="button"
            onClick={() => onSave(post._id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              hasSaved
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {hasSaved ? "Saved" : "Save"}
          </button>

          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                {isEditing ? "Close Editor" : "Edit"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(post._id)}
                className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Delete
              </button>
            </>
          ) : null}
        </div>

        {isCommentsOpen ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <form onSubmit={handleComment} className="flex flex-col gap-3">
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                className="min-h-24 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                placeholder="Write a thoughtful reply..."
                maxLength={200}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{commentText.length}/200</span>
                <button
                  type="submit"
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Add Comment
                </button>
              </div>
            </form>

            <div className="mt-4 space-y-3">
              {post.comments?.length ? (
                post.comments.map((comment) => {
                  const commentUserId = comment.user?._id;
                  const canDeleteComment = commentUserId === currentUserId || isOwner;

                  return (
                    <div
                      key={comment._id}
                      className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/u/${comment.user?.username}`}
                            className="text-sm font-semibold text-slate-900"
                          >
                            {comment.user?.name?.trim() || comment.user?.username}
                          </Link>
                          <p className="mt-1 text-sm text-slate-600">{comment.text}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                          {canDeleteComment ? (
                            <button
                              type="button"
                              onClick={() => onDeleteComment(post._id, comment._id)}
                              className="mt-2 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No comments yet. Start the conversation.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default PostCard;
