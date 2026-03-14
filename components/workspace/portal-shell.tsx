import { WorkspaceHeader, WorkspaceTopbar } from "@/components/workspace/workspace-header";
import type { PortalUserRole } from "@/utils/validation/auth";

export function PortalShell({
  children,
  email,
  role,
  links = [],
}: {
  children: React.ReactNode;
  email: string;
  role: PortalUserRole;
  links?: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="shell" id="main-content">
      {/* Fixed sidebar — outside normal flow */}
      <WorkspaceHeader email={email} links={links} role={role} />

      {/* Main column — offset from sidebar, contains topbar + content */}
      <div className="content-shell">
        <WorkspaceTopbar email={email} role={role} />
        <main className="page-content">
          <div className="stack">{children}</div>
        </main>
      </div>
    </div>
  );
}
