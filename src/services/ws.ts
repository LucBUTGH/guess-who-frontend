import { Client } from '@stomp/stompjs'
import type { GameEvent } from '../types'

let client: Client | null = null

export function connectWS(
  token: string,
  gameCode: string,
  onEvent: (event: GameEvent) => void,
  onAbort: () => void
): Promise<void> {
  if (client !== null) disconnectWS()

  return new Promise((resolve) => {
    client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client!.subscribe(`/topic/game/${gameCode}`, (msg) => {
          const event: GameEvent = JSON.parse(msg.body)
          if (event.type === 'GAME_ABORT') onAbort()
          else onEvent(event)
        })
        client!.subscribe('/user/queue/game', (msg) => {
          const event: GameEvent = JSON.parse(msg.body)
          onEvent(event)
        })
        resolve()
      },
    })
    client.activate()
  })
}

export function sendGuess(gameCode: string, characterId: number) {
  client?.publish({
    destination: `/app/game/${gameCode}/guess`,
    body: JSON.stringify({ characterId }),
  })
}

export function sendChat(gameCode: string, content: string) {
  client?.publish({
    destination: `/app/game/${gameCode}/chat`,
    body: JSON.stringify({ content }),
  })
}

export function disconnectWS() {
  client?.deactivate()
  client = null
}
