import { MatchesResponse, UseGetChildMatchesQuery, UsePatchMatch, UsePatchMatchReset, UsePatchMatchSwitch, UseStartMatch } from "@/queries/match";
import { Match, MatchWrapper, PlayerKey, TableTennisExtraData } from "@/types/matches";
import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { toast } from "sonner";
import { useCallback } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

interface ProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: MatchWrapper;
    tournamentId: number;
    playerCount: number
    children: ReactNode
}

interface ProtocolModalContextValues {
    playerMatches: MatchWrapper[];
    isOpen: boolean;
    tournamentId: number;
    playerCount: number;
    match: MatchWrapper;
    notes: string
    headReferee: string
    tableReferee: string
    teamACaptain: string
    teamBCaptain: string
    forfeitMatch: MatchWrapper | null
    isLoading: boolean
    childMatches: MatchesResponse | undefined
    onClose: () => void;
    setForfeitMatch: (value: MatchWrapper | null) => void
    setTableReferee: (value: string) => void
    setHeadReferee: (value: string) => void
    setNotes: (note: string) => void
    handleSwitchParticipants: () => void
    handlePlayerChange: (playerKey: string, playerId: string, playerKeys: PlayerKey[], pairKeys: PlayerKey[]) => void
    handleCaptainChange: (captainKey: string, value: string) => void
    handleMatchStart: () => void
    handleMatchReset: () => void
    handleMatchFinish: () => void
    handleForfeitMatch: (match: MatchWrapper) => void
    handleNotesChange: (value: string) => void
    handleTableRefereeChange: (value: string) => void
    handleHeadRefereeChange: (value: string) => void
}

const ProtocolModalContext = createContext<ProtocolModalContextValues | undefined>(undefined)

export const ProtocolModalProvider = ({
    isOpen,
    onClose,
    match,
    tournamentId,
    playerCount,
    children
}: ProtocolModalProps) => {

    const extraData = match.match.extra_data || {} as TableTennisExtraData
    const [notes, setNotes] = useState<string>("")
    const [teamACaptain, setTeamACaptain] = useState<string>("")
    const [teamBCaptain, setTeamBCaptain] = useState<string>("")
    const [tableReferee, setTableReferee] = useState<string>("")
    const [headReferee, setHeadReferee] = useState<string>("")
    const [forfeitMatch, setForfeitMatch] = useState<MatchWrapper | null>(null);

    // Initialize state
    useEffect(() => {
        setNotes(extraData.notes || "")
        setTeamACaptain(extraData.captain_a || "")
        setTeamBCaptain(extraData.captain_b || "")
        setTableReferee(extraData.table_referee || "")
        setHeadReferee(extraData.head_referee || "")
        setForfeitMatch(null)
    }, [isOpen, match.match.id])

    // Queries
    const { data: childMatches, isLoading } = UseGetChildMatchesQuery(
        tournamentId,
        match.match.tournament_table_id,
        match.match.id
    )
    // Mutations
    const { mutateAsync: startMatch } = UseStartMatch(
        tournamentId,
        match.match.tournament_table_id,
        match.match.id
    )
    const { mutateAsync: updateMatch } = UsePatchMatch(
        tournamentId,
        match.match.tournament_table_id,
        match.match.id
    )

    const { mutateAsync: switchParticipants } = UsePatchMatchSwitch(
        tournamentId,
        match.match.tournament_table_id,
        match.match.id
    )

    const { mutateAsync: resetMatch } = UsePatchMatchReset(
        tournamentId,
        match.match.tournament_table_id,
        match.match.id
    )

    const { t } = useTranslation()

    const handleSwitchParticipants = async () => {
        try {
            await switchParticipants(match.match)
        } catch (error) {
            void error;
            toast.error(t("toasts.protocol_modals.switch_participant_error"))
        }
    }

    const handleForfeitMatch = (match: MatchWrapper) => {
        setForfeitMatch(match)
    }

    const changePlayer = async (playerKey: string, playerId: string) => {
        const updatedExtraData = {
            ...extraData,
            [playerKey]: playerId
        };

        const sendMatch: Match = {
            id: match.match.id,
            tournament_table_id: match.match.tournament_table_id,
            type: match.match.type,
            round: match.match.round,
            p1_id: match.match.p1_id,
            p2_id: match.match.p2_id,
            winner_id: match.match.winner_id,
            order: match.match.order,
            sport_type: match.match.sport_type,
            location: match.match.location,
            state: match.match.state,
            finish_date: match.match.finish_date,
            start_date: match.match.start_date,
            bracket: match.match.bracket,
            forfeit: match.match.forfeit,
            extra_data: updatedExtraData,
            forfeit_type: match.match.forfeit_type,
            readable_id: match.match.readable_id,
            topCoord: 0,
            table_type: match.match.table_type,
            previous_match_readable_id_1: match.match.previous_match_readable_id_1,
            previous_match_readable_id_2: match.match.previous_match_readable_id_2,
        };

        await updateMatch(sendMatch);
    }

    const handlePlayerChange = async (
        currentKey: string,
        playerId: string,
        playerKeys: PlayerKey[],
        pairKeys: PlayerKey[]
    ) => {
        try {
            const currentExtraData = { ...extraData };

            const isPlayerKey = playerKeys.includes(currentKey as PlayerKey);
            const isPairKey = pairKeys.includes(currentKey as PlayerKey);

            let existingAssignment: string | undefined;

            if (isPlayerKey) {
                existingAssignment = playerKeys.find((key) =>
                    key !== currentKey && currentExtraData[key] === playerId
                );
            } else if (isPairKey) {
                existingAssignment = pairKeys.find((key) =>
                    key !== currentKey && currentExtraData[key] === playerId
                );
            }

            if (existingAssignment && playerId !== '') {
                const completeUpdatedExtraData = {
                    ...currentExtraData,
                    [existingAssignment]: '',
                    [currentKey]: playerId
                };

                const sendMatch: Match = {
                    ...match.match,
                    extra_data: completeUpdatedExtraData,
                    topCoord: 0,
                };

                await updateMatch(sendMatch);
            } else {
                await changePlayer(currentKey, playerId);
            }
        } catch (error) {
            void error;
            toast.error(t("toasts.protocol_modals.player_assign_error"))
        }
    };

    const debouncedUpdateField = useCallback(
        debounce(async (fieldKey: string, value: string) => {
            try {
                const updatedExtraData = {
                    ...match.match.extra_data,
                    [fieldKey]: value
                };

                const sendMatch: Match = {
                    ...match.match,
                    extra_data: updatedExtraData,
                    topCoord: 0,
                };

                await updateMatch(sendMatch);
            } catch (error) {
                void error;
                toast.error(t("toasts.protocol_modals.update_error"))
            }
        }, 500),
        [match.match, updateMatch]
    );

    const handleCaptainChange = (value: string, captainKey: string) => {
        if (captainKey === "captain_a") {
            setTeamACaptain(value);
        } else if (captainKey === "captain_b") {
            setTeamBCaptain(value);
        }
        debouncedUpdateField(captainKey, value);
    };

    const handleNotesChange = (value: string) => {
        setNotes(value);
        debouncedUpdateField('notes', value);
    };

    const handleTableRefereeChange = (value: string) => {
        setTableReferee(value);
        debouncedUpdateField('table_referee', value);
    };

    const handleHeadRefereeChange = (value: string) => {
        setHeadReferee(value);
        debouncedUpdateField('head_referee', value);
    };

    const handleMatchStart = async () => {
        try {
            await startMatch()
            toast.success(t("toasts.protocol_modals.match_start_success"))
        } catch (error) {
            void error
            toast.error(t("toasts.protocol_modals.match_start_error"))
        }
    }

    const handleMatchReset = async () => {
        try {
            await resetMatch()
            toast.success(t("toasts.protocol_modals.match_reset_success"))
        } catch (error) {
            void error
            toast.error(t("toasts.protocol_modals.match_reset_error"))
        }
    }

    const handleMatchFinish = async () => {
        try {
            const match_payload: Match = {
                ...match.match,
                winner_id: "finished",
            }
            await updateMatch(match_payload)
            toast.success(t("toasts.protocol_modals.match_finish_success"))
            setForfeitMatch(null)
        } catch (error) {
            void error;
            toast.error(t("toasts.protocol_modals.match_finish_error"))
        }
    }

    const [playerMatches, setPlayerMatches] = useState<MatchWrapper[]>([])

    useEffect(() => {
        if (childMatches && childMatches.data) {
            setPlayerMatches(childMatches.data)
        }
    }, [childMatches, match.match.extra_data])

    const ProtocolModalValues: ProtocolModalContextValues = {
        playerMatches,
        isOpen,
        tournamentId,
        playerCount,
        match,
        notes,
        headReferee,
        tableReferee,
        forfeitMatch,
        isLoading,
        childMatches,
        teamACaptain,
        teamBCaptain,
        setForfeitMatch,
        setHeadReferee,
        setTableReferee,
        setNotes,
        onClose,
        handleSwitchParticipants,
        handlePlayerChange,
        handleCaptainChange,
        handleMatchStart,
        handleMatchReset,
        handleMatchFinish,
        handleForfeitMatch,
        handleNotesChange,
        handleTableRefereeChange,
        handleHeadRefereeChange,
    }

    return (
        <ProtocolModalContext.Provider value={ProtocolModalValues}>
            {children}
        </ProtocolModalContext.Provider>
    )
}

export const useProtocolModal = () => {
    const context = useContext(ProtocolModalContext)
    if (context === undefined) {
        throw new Error("ProtocolModal must be used within a useProtocolModal")
    }
    return context
}