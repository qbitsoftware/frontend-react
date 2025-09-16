import React, { createContext, useContext, useState, useCallback } from 'react';

interface TableSidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const TableSidebarContext = createContext<TableSidebarContextType | undefined>(undefined);

export const useTableSidebar = () => {
  const context = useContext(TableSidebarContext);
  if (!context) {
    throw new Error('useTableSidebar must be used within a TableSidebarProvider');
  }
  return context;
};

interface TableSidebarProviderProps {
  children: React.ReactNode;
}

export const TableSidebarProvider: React.FC<TableSidebarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  const value = {
    isCollapsed,
    toggleCollapsed,
    setCollapsed,
  };

  return (
    <TableSidebarContext.Provider value={value}>
      {children}
    </TableSidebarContext.Provider>
  );
};