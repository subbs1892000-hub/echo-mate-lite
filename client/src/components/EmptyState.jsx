const EmptyState = ({ title, description, action }) => {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-soft">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
