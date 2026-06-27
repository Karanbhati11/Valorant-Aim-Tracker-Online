/**
 * Page loading skeleton — shown during route transitions.
 * Appears after ~200ms (Next.js built-in delay) and provides smooth visual
 * feedback that the app is responsive. Uses CSS animations only (no JS).
 */
export default function Loading() {
  return (
    <div
      className="page-loader"
      role="status"
      aria-label="Loading page content"
    >
      <div className="page-loader-inner">
        <div className="page-loader-spinner" />
        <span className="page-loader-text">Loading</span>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
