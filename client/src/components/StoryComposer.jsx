import { useState } from "react";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const StoryComposer = ({ onSubmit, isSubmitting }) => {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setImageUrl(dataUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const didSubmit = await onSubmit({ text, imageUrl });
    if (didSubmit) {
      setText("");
      setImageUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Story</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Share a 24-hour update</h3>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="min-h-24 w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
        placeholder="A quick temporary update..."
        maxLength={160}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="url"
          value={imageUrl.startsWith("data:image/") ? "" : imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
          placeholder="Story image URL"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full rounded-[1.1rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-[0.85rem] text-sm text-slate-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[1.1rem] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Posting story..." : "Post Story"}
      </button>
    </form>
  );
};

export default StoryComposer;
