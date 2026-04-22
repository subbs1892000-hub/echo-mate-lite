import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("UI error boundary caught an error:", error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Something broke
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">The page ran into an unexpected issue.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              This is a client-side safety net. Refresh to continue, and if the issue keeps happening
              we should inspect the failing component.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-[1.2rem] bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
