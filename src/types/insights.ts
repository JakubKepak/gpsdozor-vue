export type InsightModule = 'dashboard' | 'fleet' | 'drivers' | 'fuel' | 'health' | 'eco-driving'

export type InsightSeverity = 'info' | 'warning' | 'critical' | 'positive'

export interface InsightCard {
  title: string
  description: string
  severity: InsightSeverity
  recommendations: string[]
}

export interface InsightResponse {
  insights: InsightCard[]
}
