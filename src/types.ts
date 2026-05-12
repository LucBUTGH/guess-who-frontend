export interface Character {
  id: number
  name: string
  imageUrl: string
}

export interface GameResponse {
  code: string
  status: string
  player1: string
  player2: string | null
}

export interface GameEvent {
  type: 'GAME_START' | 'GAME_RESULT' | 'GAME_ABORT' | 'CHAT'
  character?: Character
  result?: 'WIN' | 'LOSE'
  opponentCharacter?: Character
  sender?: string
  content?: string
}

export interface AuthResponse {
  token: string
}

export interface PlayerStats {
  username: string
  wins: number
  losses: number
}

export interface GameHistory {
  result: 'WIN' | 'LOSE'
  opponent: string
  myCharacter: { name: string; imageUrl: string | null }
  opponentCharacter: { name: string; imageUrl: string | null }
}
