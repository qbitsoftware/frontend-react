import { Tournament } from '@/types/tournaments'
import React, { createContext, useContext, ReactNode } from 'react'

interface TournamentContextProps {
  tournamentData: Tournament
  children?: ReactNode
}

const TournamentContext = createContext<TournamentContextProps | undefined>(undefined)

export const useTournament = () => {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}

interface ProviderProps {
  tournamentData: Tournament
  groupId?: number | null
  children?: ReactNode
}

export const TournamentProvider: React.FC<ProviderProps> = ({ tournamentData, children }) => {

  return (
    <TournamentContext.Provider value={{ tournamentData }}>
      {children}
    </TournamentContext.Provider>
  )
}