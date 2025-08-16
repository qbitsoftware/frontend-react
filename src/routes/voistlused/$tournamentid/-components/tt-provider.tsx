import { TournamentTableWithStages } from '@/queries/tables'
import React, { createContext, useContext, ReactNode } from 'react'

interface TournamentTableContextProps {
    tournament_table_data: TournamentTableWithStages
    children?: ReactNode
}

const TournamentTableContext = createContext<TournamentTableWithStages | undefined>(undefined)


// eslint-disable-next-line react-refresh/only-export-components
export const useTournamentTable = () => {
    const context = useContext(TournamentTableContext)
    if (!context) {
        throw new Error('useTournamentTable must be used within a TournamentTableProvider')
    }
    return context
}

export const TournamentTableProvider: React.FC<TournamentTableContextProps> = ({ tournament_table_data, children }) => {
    return <TournamentTableContext.Provider value={tournament_table_data}>{children}</TournamentTableContext.Provider>
}