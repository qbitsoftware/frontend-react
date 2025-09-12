import { Button } from "@/components/ui/button";
import { UsePostParticipantRegister, UsePostParticipantUnregister } from "@/queries/participants";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    participant_id: string
    player_id: string
    register_id?: number
}

export default function RegisterButton({ participant_id, player_id, register_id }: Props) {
    const params = useParams({ strict: false })
    if (!params.tournamentid || !params.groupid) {
        return null
    }
    const [isLoading, setIsLoading] = useState(false)
    const registerMutation = UsePostParticipantRegister(Number(params.tournamentid), Number(params.groupid), participant_id, player_id)
    const unregisterMutation = UsePostParticipantUnregister(Number(params.tournamentid), Number(params.groupid), participant_id, player_id)
    const handleRegister = async () => {
        setIsLoading(true)
        try {
            await registerMutation.mutateAsync()
            toast.success("Edukalt registreeritud")
        } catch (error) {
            console.error("Error registering participant:", error)
            toast.error("Registreerimine ebaõnnestus")
        }
        setIsLoading(false)
    }
    const handleUnregister = async () => {
        if (!register_id) {
            return
        }
        setIsLoading(true)
        try {
            await unregisterMutation.mutateAsync(register_id)
            toast.success("Edukalt registreerimine tühistatud")
        } catch (error) {
            console.error("Error unregistering participant:", error)
            toast.error("Registreerimise tühistamine ebaõnnestus")
        }
        setIsLoading(false)
    }
    return (
        <div>
            {register_id ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnregister}
                    disabled={isLoading}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                    Tühista 
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="text-xs text-blue-300 hover:text-blue-700 hover:bg-blue-50"
                >
                Kinnita kohalolu
                </Button>
            )}
        </div>
    )
}
