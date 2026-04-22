import { useState } from "react";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const PostComposer = ({ onSubmit, isPosting }) => {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [localError, setLocalError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLocalError("Please upload an image file.");
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setPreviewImage(dataUrl);
    setImageUrl(dataUrl);
    setLocalError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!text.trim() && !imageUrl.trim()) {
      setLocalError("Add a caption or image before posting.");
      return;
    }

    const didSubmit = await onSubmit({ text, imageUrl });

    if (didSubmit) {
      setText("");
      setImageUrl("");
      setPreviewImage("");
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_45%),linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Create</p>
        <h1 className="mt-3 text-3xl font-bold">Share a moment with your circle</h1>
        <p className="mt-2 max-w-md text-sm text-slate-200">
          Write a quick update, drop in an image, and publish instantly to the community feed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Caption</label>
            <span className="text-xs font-medium text-slate-400">{text.length}/500</span>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-36 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
            placeholder="What are you building, thinking about, or celebrating today?"
            maxLength={500}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl.startsWith("data:image/") ? "" : imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setPreviewImage(event.target.value);
              }}
              className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Or upload an image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-[0.85rem] text-sm text-slate-500"
            />
          </div>
        </div>

        {previewImage ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
            <img
              src={previewImage}
              alt="Post preview"
              className="max-h-64 w-full rounded-[1.2rem] object-cover"
            />
          </div>
        ) : null}

        {localError ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{localError}</p>
        ) : null}

        <button
          type="submit"
          disabled={isPosting}
          className="w-full rounded-[1.2rem] bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPosting ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </section>
  );
};

export default PostComposer;
