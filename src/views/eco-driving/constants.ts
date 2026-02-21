import type { EcoDrivingEvent } from '@/types/api'

export const INT_MIN = -2147483648

export const EVENT_TYPE_COLORS: Record<number, string> = {
  0: '#6b7280',
  1: '#3b82f6',
  2: '#3b82f6',
  3: '#3b82f6',
  4: '#ef4444',
  5: '#f59e0b',
  6: '#8b5cf6',
  7: '#6b7280',
  8: '#6b7280',
  9: '#6b7280',
}

export interface VehicleRanking {
  vehicleCode: string
  vehicleName: string
  vehicleSPZ: string
  total: number
  high: number
  medium: number
  low: number
  rawScore: number
  byType: { type: number; count: number }[]
}

export type EcoEventWithVehicle = EcoDrivingEvent & {
  vehicleCode: string
  vehicleName: string
  vehicleSPZ: string
}
