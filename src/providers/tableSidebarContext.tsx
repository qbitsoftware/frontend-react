import React, { createContext, useContext } from 'react';

interface TableSidebarContextType {
  isCollapsed: boolean;
}

const TableSidebarContext = createContext<TableSidebarContextType | undefined>(undefined);

export const useTableSidebarContext = () => {
  const context = useContext(TableSidebarContext);
  if (!context) {
    throw new Error('useTableSidebarContext must be used within a TableSidebarContextProvider');
  }
  return context;
};

interface TableSidebarContextProviderProps {
  children: React.ReactNode;
  isCollapsed: boolean;
}

export const TableSidebarContextProvider: React.FC<TableSidebarContextProviderProps> = ({
  children,
  isCollapsed
}) => {
  const value = {
    isCollapsed,
  };

  return (
    <TableSidebarContext.Provider value={value}>
      {children}
    </TableSidebarContext.Provider>
  );
};