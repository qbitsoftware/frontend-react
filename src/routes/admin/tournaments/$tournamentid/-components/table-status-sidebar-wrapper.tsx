import React, { useEffect, useState } from 'react';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TableSidebarContextProvider } from "@/providers/tableSidebarContext";
import TableStatusSidebar from './table-status-sidebar';

// Inner component that has access to the sidebar state and exposes it
const TableStatusSidebarWithContext = ({ onStateChange }: { onStateChange: (isCollapsed: boolean) => void }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    onStateChange(isCollapsed);
  }, [isCollapsed, onStateChange]);

  return <TableStatusSidebar />;
};

// Main wrapper that manages the sidebar context and exposes state
const TableStatusSidebarWrapper = ({ onStateChange }: { onStateChange?: (isCollapsed: boolean) => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleStateChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onStateChange?.(collapsed);
  };

  return (
    <TableSidebarContextProvider isCollapsed={isCollapsed}>
      <div className="hidden lg:block fixed top-0 right-0 z-10 h-screen">
        <SidebarProvider
          style={{ '--sidebar-width': '16rem', '--sidebar-width-icon': '4rem' } as React.CSSProperties}
        >
          <TableStatusSidebarWithContext onStateChange={handleStateChange} />
        </SidebarProvider>
      </div>
    </TableSidebarContextProvider>
  );
};

export default TableStatusSidebarWrapper;