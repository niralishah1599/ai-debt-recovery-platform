"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell">
      <div className="panel panel-body">
        <h1 className="heading-lg">Something failed</h1>
        <p className="body-copy">{error.message || "Unexpected application error."}</p>
        <div className="button-row" style={{ marginTop: 20 }}>
          <button className="button" onClick={() => reset()} type="button">
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
