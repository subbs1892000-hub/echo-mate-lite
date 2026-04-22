const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </div>
  );
};

export default Loader;
