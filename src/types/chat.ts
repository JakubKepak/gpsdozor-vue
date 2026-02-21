export type ChatBlock =
  | { type: 'text'; content: string }
  | { type: 'vehicleCard'; vehicles: VehicleCardData[] }
  | { type: 'action'; label: string; href: string }

export interface VehicleCardData {
  name: string
  spz: string
  code: string
  odometer: number
  speed: number
  isActive: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string | ChatBlock[]
  timestamp: string
}
