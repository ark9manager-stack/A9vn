import React from "react";

function isChunkLoadError(error) {
  const message = String(error?.message || error || "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError|dynamically imported module/i.test(
    message,
  );
}

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

    if (isChunkLoadError(error) && typeof window !== "undefined") {
      try {
        const key = `a9vn_route_chunk_reload_v1:${window.location.pathname}`;
        if (window.sessionStorage.getItem(key) !== "1") {
          window.sessionStorage.setItem(key, "1");
          window.location.reload();
        }
      } catch {
        // no-op
      }
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkError = isChunkLoadError(error);

    return (
      <div className="flex min-h-[calc(100vh-104px)] items-center justify-center px-4 py-12 text-white">
        <div className="max-w-xl border border-white/12 bg-black/35 p-5 text-center shadow-[0_0_32px_rgba(0,0,0,0.35)]">
          <div className="font-heading text-xl font-bold uppercase tracking-[2px] text-primary">
            Page module failed to render
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {chunkError
              ? "Trình duyệt đang giữ chunk cũ hoặc tải module động bị lỗi. Trang sẽ tự reload một lần; nếu vẫn lỗi, bấm Reload."
              : "Một phần của trang bị lỗi khi render, nhưng app đã được chặn để không trắng màn hình."}
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
