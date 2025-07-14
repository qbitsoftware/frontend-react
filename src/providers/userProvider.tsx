import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGetCurrentUserQuery } from '@/queries/users';
import { UserLogin } from '@/types/users';

interface UserContextType {
  user: UserLogin | null;
  setUser: (user: UserLogin | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user_data } = useGetCurrentUserQuery();
  const [user, setUser] = useState<UserLogin | null>(null);

  useEffect(() => {
    if (user_data) {
      setUser(user_data.data);
    } else {
      setUser(null);
    }
  }, [user_data]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};