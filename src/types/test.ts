export type BlockType = "group" | "single-elimination" | "double-elimination" | "swiss" | "round-robin" | "ladder"

export interface TournamentBlockData {
  id: string
  type: BlockType
  position: {
    x: number
    y: number
  }
  title: string
  participants: string[]
  config?: {
    // Group stage config
    groupCount?: number
    teamsPerGroup?: number
    advanceCount?: number
    roundRobin?: boolean

    // Elimination config
    teamCount?: number
    seeded?: boolean
    thirdPlace?: boolean
    grandFinalReset?: boolean

    // Swiss config
    rounds?: number
    acceleratedPairing?: boolean

    // Round robin config
    doubleRoundRobin?: boolean

    // Ladder config
    challengeWindow?: number
    maxChallengeRange?: number

    [key: string]: any
  }
}

export interface Connection {
  id: string
  from: string
  to: string
}
