export enum WSMsgType {
    // Tournament events
    TournamentCreated = "tournament_created",
    TournamentUpdated = "tournament_updated",
    TournamentDeleted = "tournament_deleted",

    // Tournament table events
    TournamentTableCreated = "tournament_table_created",
    TournamentTableUpdated = "tournament_table_updated",
    TournamentTableDeleted = "tournament_table_deleted",

    // Match events
    MatchCreated = "match_created",
    MatchUpdated = "match_updated",
    MatchDeleted = "match_deleted",
    MatchReset = "match_reset",
    MatchStarted = "match_started",

    // Participant events
    ParticipantCreated = "participant_created",
    ParticipantUpdated = "participant_updated",
    ParticipantDeleted = "participant_deleted",
    ParticipantsImported = "participants_imported",
    ParticipantSeeded = "participant_seeded",
    ParticipantMerged = "participant_merged",

    // Bracket events
    BracketGenerated = "bracket_generated",
    BracketDeleted = "bracket_deleted",
    BracketUpdated = "bracket_updated",

    // Timetable events
    TimetableGenerated = "timetable_generated",
    TimetableUpdated = "timetable_updated",
    TimetableVisibilityChanged = "timetable_visibility_changed",
    TimetableReset = "timetable_reset",

    // User events
    UserRegistered = "user_registered",
    UserUnregistered = "user_unregistered",

    // System events
    Ping = "ping",
    Pong = "pong",
}

export interface WSMessage {
    type: string;
    data: any;
}

export interface WSEventData {
    tournament_id?: string;
    table_id?: string;
    match_id?: string;
    participant_id?: string;
    user_id?: string;
    timestamp?: number;
    metadata?: Record<string, any>;
}

export interface WSParticipantsImportedData extends WSEventData {
    count: number;
}

export interface WSMatchTimeUpdatedData extends WSEventData {
    start_time?: string;
    end_time?: string;
}

export interface WSTimetableData extends WSEventData {
    visible?: boolean;
}
