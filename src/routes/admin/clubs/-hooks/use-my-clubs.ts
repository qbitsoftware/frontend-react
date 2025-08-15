import { useState, useCallback } from "react";
import { axiosInstance } from "@/queries/axiosconf";
import { Club } from "@/types/clubs";

export function useMyClubs() {
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [isLoadingMyClubs, setIsLoadingMyClubs] = useState(false);

  const fetchMyClubs = useCallback(async () => {
    setIsLoadingMyClubs(true);
    try {
      const { data } = await axiosInstance.get('/api/v1/clubs/admin/me', {
        withCredentials: true
      });
      setMyClubs(data.data?.clubs || []);
    } catch (error) {
      void error;
      setMyClubs([]);
    } finally {
      setIsLoadingMyClubs(false);
    }
  }, []);

  return {
    myClubs,
    isLoadingMyClubs,
    fetchMyClubs,
  };
}