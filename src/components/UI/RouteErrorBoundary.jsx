import React from "react";
import { isDynamicImportError } from "../../utils/lazyWithRetry";

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error, info) {
    try {
      console.error("Route render error:", error, info);
    } catch {
      // no-op
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const moduleLoadError = isDynamicImportError(error);

    return (
      <div className="flex min-h-[calc(100vh-104px)] items-center justify-center px-4 py-12 text-white">
        <div className="max-w-xl border border-white/12 bg-black/35 p-5 text-center shadow-[0_0_32px_rgba(0,0,0,0.35)]">
          <div className="font-heading text-xl font-bold uppercase tracking-[2px] text-primary">
            Không thể hiển thị trang
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {moduleLoadError
              ? "Module của trang tải không thành công sau vài lần thử. Hãy reload lại web, rất mong bạn thông cảm vấn đề này."
              : "Hãy bấm F5"}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 border border-primary/40 bg-primary px-5 py-2 font-heading text-sm font-bold uppercase tracking-[1.6px] text-primary-foreground"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
