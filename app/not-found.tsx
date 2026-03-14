import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell">
      <div className="panel panel-body">
        <h1 className="heading-lg">Page not found</h1>
        <p className="body-copy">
          The route you requested does not exist in the current MVP surface.
        </p>
        <div className="button-row" style={{ marginTop: 20 }}>
          <Link className="button" href="/">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
