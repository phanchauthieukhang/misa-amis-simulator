export type UserRole = 'bod' | 'factory_director' | 'workshop_lead';

export type RealtimeViewLevel = 'enterprise' | 'factory' | 'workshop' | 'device';

export interface ESGNavigationOptions {
  factoryId?: string;
  workshopId?: string;
  deviceId?: string | null;
  viewLevel?: RealtimeViewLevel;
}

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
  targetPeriod?: TimePeriod; // Kỳ kiểm soát gắn liền với sự cố (VD: 'h1_2026', 'q3_2026', 'm9_2026', 'h2_2026', 'm10_2026')
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
  // Kỳ kiểm soát đóng sổ & hiện tại theo vai trò
  | 'year_2026' // Cả năm 2026 (Lũy kế toàn bộ)
  | 'h1_2026' // 6 tháng đầu năm (01/01 - 30/06/2026) [Đã đóng sổ kiểm toán]
  | 'h2_2026' // 6 tháng cuối năm (01/07 - 31/12/2026) [Kỳ hiện tại]
  | 'q3_2026' // Quý III/2026 (01/07 - 30/09/2026) [Đã đóng sổ kiểm toán quý]
  | 'q4_2026' // Quý IV/2026 (01/10 - 31/12/2026) [Kỳ hiện tại]
  | 'm9_2026' // Tháng 9/2026 (01/09 - 30/09/2026) [Đã đóng sổ tháng]
  | 'm10_2026' // Tháng 10/2026 (01/10 - 31/10/2026) [Kỳ hiện tại]
  | 'today' // Ca vận hành hôm nay [Thời gian thực]
  // Các chu kỳ cũ / chiến lược
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | '3years'
  | '5years'
  | '10years';

export interface PeriodOption {
  value: TimePeriod;
  label: string;
  isClosed: boolean;
  periodLabel: string;
  dateRange: string;
  quotaMultiplier?: number;
}

export interface RoleThresholdConfig {
  role: UserRole;
  roleLabel: string;
  scopeLabel: string;
  evalPeriodLabel: string;
  allowedPeriods: PeriodOption[];
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
