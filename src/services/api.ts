import axios from 'axios'
import type { AuthResponse, Character, GameResponse, PlayerStats, GameHistory } from '../types'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const register = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { username, password })

export const login = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password })

export const createGame = () =>
  api.post<GameResponse>('/api/game/create')

export const joinGame = (code: string) =>
  api.post<GameResponse>(`/api/game/join/${code}`)

export const getGame = (code: string) =>
  api.get<GameResponse>(`/api/game/${code}`)

export const getCharacters = () =>
  api.get<Character[]>('/api/characters')

export const getPlayerStats = () =>
  api.get<PlayerStats>('/api/me')

export const getLeaderboard = () =>
  api.get<PlayerStats[]>('/api/leaderboard')

export const getMyGames = () =>
  api.get<GameHistory[]>('/api/me/games')