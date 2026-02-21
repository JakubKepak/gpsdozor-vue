import type { EcoDrivingEvent } from '@/types/api'
import { EcoDrivingEventType, EcoDrivingSeverity } from '@/types/api'

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

export function eventTypeName(type: number): string {
  return EcoDrivingEventType[type] ?? 'Unknown'
}

export function severityName(sev: number): string {
  return EcoDrivingSeverity[sev] ?? 'None'
}

export function severityColor(sev: number): string {
  if (sev === 3) return 'red'
  if (sev === 2) return 'orange'
  if (sev === 1) return 'green'
  return 'default'
}

export function formatSpeed(speed: number): string {
  if (speed === INT_MIN || speed < 0) return '—'
  return `${speed} km/h`
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

export function eventKey(e: EcoEventWithVehicle): string {
  return `${e.vehicleCode}-${e.EventType}-${e.Timestamp}-${e.Position.Latitude}-${e.Position.Longitude}`
}
