import { MatchesInfo } from "@/queries/match";
import { Participant } from "./participants";
import { Tournament } from "./tournaments";

export enum WSMsgType {

    WSMsgTypeTableInfo = "table_info",
    WSMsgTypeParticipants = "participants",
    WSMsgTypeTournamentCreated = "tournament_created",
    WSMsgTypeTournamentUpdated = "tournament_updated",

}

export interface WSMessage {
    type: string;
    data: WSParticipantsData | WSTableInfo;
    tournament_id: number;
    group_id?: number;
}

export interface WSEventData {
    timestamp?: number;
    metadata?: Record<string, any>;
}

export interface WSParticipantsData extends WSEventData {
    participants?: Participant[];
}

export interface WSTableInfo extends WSEventData {
    info?: MatchesInfo;
}

export interface WSTournamentData extends WSEventData {
    tournament?: Tournament
}

export interface WSTournamentsData extends WSEventData {
    tournaments?: Tournament[]
}
