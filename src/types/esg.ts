export type UserRole = 'bod' | 'factory_director' | 'workshop_lead';

export type RealtimeViewLevel = 'enterprise' | 'factory' | 'workshop' | 'device';

export type MetricType = 'power' | 'co2' | 'water';

export interface MetricThreshold {
  warning: number;
  danger: number;
  unit: string;
}

export interface MetricReading {
  power?: {
    value: number; // in kWh
    max: number;
    unit: string;
  };
  co2?: {
    value: number; // in kg CO2e
    max: number;
    unit: string;
  };
  water?: {
    value: number; // in m3
    max: number;
    unit: string;
  };
}

export interface DeviceItem {
  id: string;
  code: string;
  name: string;
  workshopId: string;
  factoryId: string;
  metrics: MetricType[];
  readings: MetricReading;
  status: 'normal' | 'warning' | 'danger';
  installedDate: string;
  specification: string;
  lastMaintenance: string;
}

export interface WorkshopItem {
  id: string;
  code: string;
  name: string;
  factoryId: string;
  manager: string;
  deviceCount: number;
  devices: DeviceItem[];
  totals: {
    powerKWh: number;
    co2Kg: number;
    waterM3: number;
  };
  status: 'normal' | 'warning' | 'danger';
}

export interface FactoryItem {
  id: string;
  code: string;
  name: string;
  location: string;
  director: string;
  workshops: WorkshopItem[];
  totals: {
    powerKWh: number;
    co2Kg: number;
    waterM3: number;
  };
  status: 'normal' | 'warning' | 'danger';
}

export interface IncidentMeetingMinute {
  code: string;
  title: string;
  date: string;
  attendees: string;
  fileName?: string;
  fileSize?: string;
}

export interface AlertResolutionPayload {
  rootCause: string;
  resolution: string;
  meetingMinuteCode?: string;
  meetingMinuteTitle?: string;
  meetingMinuteAttendees?: string;
  meetingMinuteFile?: string;
  meetingMinuteFileSize?: string;
  resolvedBy: string;
}

export interface ESGAlert {
  id: string;
  timestamp: string;
  factoryName: string;
  workshopName: string;
  deviceName?: string;
  metricType: MetricType;
  level: 'warning' | 'danger';
  message: string;
  value: string;
  threshold: string;
  status: 'new' | 'investigating' | 'resolved';
  scopeLevel: 'enterprise' | 'factory' | 'workshop';
  timeHorizon: string; // e.g. "Đánh giá tích lũy theo Tháng", "Đánh giá tích lũy theo Quý", "Đánh giá tích lũy 6 Tháng - Năm"
  excessDuration: string; // e.g. "Vượt quá định mức bình quân tháng", "Vượt quá hạn ngạch quý III"
  rootCause?: string; // Nguyên nhân sự cố xác định qua điều tra
  resolution?: string; // Biện pháp & hướng giải quyết đã phê duyệt
  meetingMinute?: IncidentMeetingMinute; // Biên bản cuộc họp đính kèm
  resolvedBy?: string; // Cán bộ chủ trì / phê duyệt
  resolvedAt?: string; // Thời gian hoàn tất biên bản
}

export interface UnitPreferences {
  power: 'kWh' | 'MWh';
  co2: 'kg' | 'ton';
  water: 'm3' | 'liter';
}

export type TimePeriod =
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | '3years'
  | '5years'
  | '10years';

export interface RoleThresholdConfig {
  role: UserRole;
  roleLabel: string;
  scopeLabel: string;
  evalPeriodLabel: string;
  allowedPeriods: { value: TimePeriod; label: string }[];
  defaultPeriod: TimePeriod;
  thresholds: {
    powerWarning: number;
    powerDanger: number;
    powerUnit: string;
    co2Warning: number;
    co2Danger: number;
    co2Unit: string;
    waterWarning: number;
    waterDanger: number;
    waterUnit: string;
  };
  rationale: string;
}
