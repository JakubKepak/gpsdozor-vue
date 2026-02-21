import type { Vehicle, Trip, SensorItem } from '@/types/api'
import type { ChatBlock, ChatMessage } from '@/types/chat'
import type { InsightCard } from '@/types/insights'

export function createVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    Code: 'V001',
    GroupCode: 'G001',
    BranchId: 1,
    BranchName: 'Prague',
    Name: 'Skoda Octavia',
    SPZ: '1A2 3456',
    BatteryPercentage: 85,
    Speed: 60,
    LastPosition: { Latitude: '50.0755', Longitude: '14.4378' },
    DeviceImei: '123456789',
    IsActive: true,
    LastPositionTimestamp: new Date().toISOString(),
    IsEcoDrivingEnabled: true,
    Odometer: 150000,
    IsInvoiced: false,
    RefuelingCards: [],
    ...overrides,
  }
}

export function createTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    Id: 1,
    AverageSpeed: 55,
    MaxSpeed: 90,
    TripType: true,
    StartTime: '2025-01-15T08:00:00',
    FinishTime: '2025-01-15T09:30:00',
    StartPosition: { Latitude: '50.0755', Longitude: '14.4378' },
    FinishPosition: { Latitude: '49.1951', Longitude: '16.6068' },
    StartAddress: 'Prague, Hlavni 1',
    FinishAddress: 'Brno, Masarykova 5',
    TripLength: '01:30:00',
    TripWaitingTime: '00:05:00',
    TotalDistance: 205.3,
    DriverName: 'Jan Novak',
    DriverChipCode: 'CHIP001',
    IsFinished: true,
    Odometer: 150205,
    FuelConsumed: { Value: 14.5, VolumeUnit: 1 },
    TripCost: { Value: 580, Currency: 1 },
    ...overrides,
  }
}

export function createInsight(overrides: Partial<InsightCard> = {}): InsightCard {
  return {
    title: 'Test Insight',
    description: 'This is a test insight description.',
    severity: 'info',
    recommendations: ['Fix this', 'Check that'],
    ...overrides,
  }
}

export function createTextBlock(content = 'Hello world'): ChatBlock {
  return { type: 'text', content }
}

export function createVehicleCardBlock(): ChatBlock {
  return {
    type: 'vehicleCard',
    vehicles: [
      {
        name: 'Skoda Octavia',
        spz: '1A2 3456',
        code: 'V001',
        odometer: 150000,
        speed: 60,
        isActive: true,
      },
    ],
  }
}

export function createStatCardBlock(): ChatBlock {
  return {
    type: 'statCard',
    stats: [
      { label: 'Active', value: '5' },
      { label: 'Idle', value: '3', description: 'Parked vehicles' },
    ],
  }
}

export function createActionBlock(): ChatBlock {
  return { type: 'action', label: 'View Fleet', href: '/fleet' }
}

export function createChatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    role: 'user',
    content: 'Hello',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

export function createSensorItem(overrides: Partial<SensorItem> = {}): SensorItem {
  return {
    name: 'ExternalBatteryVoltage',
    units: 'V',
    data: [
      { t: '2025-01-15T08:00:00', v: 12.8 },
      { t: '2025-01-15T09:00:00', v: 13.1 },
    ],
    ...overrides,
  }
}
