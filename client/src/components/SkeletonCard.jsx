const SkeletonCard = () => {
  return (
    <div className="animate-pulse rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 h-4 w-full rounded bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
      <div className="mt-5 h-52 rounded-[1.5rem] bg-slate-100" />
    </div>
  );
};

export default SkeletonCard;
