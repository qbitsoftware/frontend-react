import { useParams } from '@tanstack/react-router'
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface NavigationContextProps {
    groupId: number | null
    setGroupId: (id: number | null) => void
    children?: ReactNode
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined)

export const useNavigationHelper = () => {
    const context = useContext(NavigationContext)
    if (!context) {
        throw new Error('useNavigationHelper must be used within a NavigationProvider')
    }
    return context
}

interface ProviderProps {
    groupId?: number | null
    children?: ReactNode
}

export const NavigationProvider: React.FC<ProviderProps> = ({ groupId: initialGroupId = null, children }) => {
    const params = useParams({ strict: false }) as { groupid?: string }
    const [groupId, setGroupId] = useState<number | null>(initialGroupId)
    useEffect(() => {
        if (params.groupid) {
            setGroupId(Number(params.groupid))
        } else {
            setGroupId(null)
        }
    }, [params.groupid])

    return (
        <NavigationContext.Provider value={{ groupId, setGroupId }}>
            {children}
        </NavigationContext.Provider>
    )
}