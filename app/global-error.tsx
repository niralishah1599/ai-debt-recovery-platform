"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <div className="panel panel-body">
            <h1 className="heading-lg">Application error</h1>
            <p className="body-copy">{error.message || "Unexpected application error."}</p>
            <div className="button-row" style={{ marginTop: 20 }}>
              <button className="button" onClick={() => reset()} type="button">
                Retry
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
