export interface Group {
  Code: string
  Name: string
}

export interface VehiclePosition {
  Latitude: string
  Longitude: string
}

export interface Vehicle {
  Code: string
  GroupCode: string
  BranchId: number
  BranchName: string
  Name: string
  SPZ: string
  BatteryPercentage: number
  Speed: number
  LastPosition: VehiclePosition
  DeviceImei: string
  IsActive: boolean
  LastPositionTimestamp: string
  IsEcoDrivingEnabled: boolean
  Odometer: number
  IsInvoiced: boolean
  RefuelingCards: string[]
}

export interface PositionHistoryResponse {
  Name: string
  VehicleCode: string
  From: string
  To: string
  Positions: PositionPoint[]
}

export interface PositionPoint {
  Lat: string
  Lng: string
  Time: string
  Speed: number
}

export interface Trip {
  Id: number
  AverageSpeed: number
  MaxSpeed: number
  TripType: boolean
  StartTime: string
  FinishTime: string
  StartPosition: { Latitude: string; Longitude: string }
  FinishPosition: { Latitude: string; Longitude: string }
  StartAddress: string
  FinishAddress: string
  TripLength: string
  TripWaitingTime: string
  TotalDistance: number
  DriverName: string
  DriverChipCode: string
  IsFinished: boolean
  Odometer: number
  FuelConsumed: { Value: number; VolumeUnit: number }
  TripCost: { Value: number; Currency: number }
}

export interface SensorDataPoint {
  t: string
  v: number
}

export interface SensorItem {
  name: string
  units: string
  data: SensorDataPoint[]
}

export interface SensorResponse {
  items: SensorItem[]
}

export interface EcoDrivingEvent {
  EventType: number
  EventValue: number
  Timestamp: string
  Position: { Latitude: number; Longitude: number }
  EventSeverity: number
  Speed: number
}

/** EventType enum: 0=Unknown, 1=CorneringLeft, 2=CorneringRight, 3=Cornering, 4=Acceleration, 5=Braking, 6=Bump, 7=LongClutch, 8=DriveOnNeutral, 9=LongFreeWheel */
export const EcoDrivingEventType: Record<number, string> = {
  0: 'Unknown',
  1: 'CorneringLeft',
  2: 'CorneringRight',
  3: 'Cornering',
  4: 'Acceleration',
  5: 'Braking',
  6: 'Bump',
  7: 'LongClutch',
  8: 'DriveOnNeutral',
  9: 'LongFreeWheel',
}

/** EventSeverity enum: 0=None, 1=Low, 2=Medium, 3=High */
export const EcoDrivingSeverity: Record<number, string> = {
  0: 'None',
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

export interface EngineRelayState {
  State: number
  LastEventTimestamp: string
}

export interface Branch {
  Id: number
  Name: string
}
