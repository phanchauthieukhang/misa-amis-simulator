'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  UserRole,
  FactoryItem,
  ESGAlert,
  UnitPreferences,
  TimePeriod,
  MetricType,
  RoleThresholdConfig,
  AlertResolutionPayload,
  RealtimeViewLevel,
  ESGNavigationOptions,
} from '@/types/esg';
import { INITIAL_VINAMILK_DATA, INITIAL_ALERTS, ROLE_THRESHOLD_CONFIGS } from '@/data/vinamilk-mock';
import { playIndustrialAlertSound } from '@/utils/audioAlert';

export type PresetScenarioId =
  | 'peak_production'
  | 'eco_green'
  | 'boiler_anomaly'
  | 'pipe_burst'
  | 'solar_peak'
  | 'grid_brownout';

export type EVNTariffPeriod = 'offpeak' | 'standard' | 'peak';
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';

interface ToastNotice {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
}

interface PeriodMetrics {
  powerKWh: number;
  co2Kg: number;
  waterM3: number;
}

interface ESGSimulationContextType {
  // Navigation & Drilldown
  activeNavId: string;
  navigateTo: (navId: string, options?: ESGNavigationOptions) => void;

  // Role & Scope
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentRoleConfig: RoleThresholdConfig;
  viewLevel: RealtimeViewLevel;
  setViewLevel: (level: RealtimeViewLevel) => void;
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
  selectedWorkshopId: string;
  setSelectedWorkshopId: (id: string) => void;
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;

  // Data & Realtime
  factories: FactoryItem[];
  alerts: ESGAlert[];
  roleFilteredAlerts: ESGAlert[];
  isLiveStreaming: boolean;
  toggleStreaming: () => void;
  streamInterval: number;
  setStreamInterval: (interval: number) => void;
  fluctuationLevel: 'low' | 'medium' | 'high';
  setFluctuationLevel: (lvl: 'low' | 'medium' | 'high') => void;
  lastUpdated: Date | null;

  // Actions
  triggerAnomaly: (metric: MetricType, periodTarget?: 'closed_period' | 'current_period') => void;
  resetSimulation: () => void;
  resolveAlert: (alertId: string, payload?: AlertResolutionPayload) => void;

  // Unit Preferences & Time Filter
  unitPreferences: UnitPreferences;
  toggleUnit: (metric: MetricType) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  periodsData: Record<string, PeriodMetrics>;

  // Toast
  toast: ToastNotice | null;
  dismissToast: () => void;

  // Presets & Environmental Simulation
  activeScenario: PresetScenarioId | null;
  applyPresetScenario: (scenario: PresetScenarioId) => void;
  evnTariffPeriod: EVNTariffPeriod;
  setEvnTariffPeriod: (period: EVNTariffPeriod) => void;
  weatherCondition: WeatherCondition;
  setWeatherCondition: (weather: WeatherCondition) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playAlarmBeep: () => void;

  // Calculated Totals based on current scope & selected closed/open period
  scopedTotals: {
    powerKWh: number;
    co2Kg: number;
    waterM3: number;
    deviceCount: number;
    alertCount: number;
    isClosedPeriod: boolean;
    periodLabel: string;
    dateRange: string;
    effectivePowerLimit: number;
    effectiveCo2Limit: number;
    effectiveWaterLimit: number;
  };
}

const ESGSimulationContext = createContext<ESGSimulationContextType | undefined>(undefined);

const INITIAL_PERIOD_DATA: Record<string, PeriodMetrics> = {
  // BOD:
  h1_2026: { powerKWh: 52480, co2Kg: 30100, waterM3: 3450 }, // 6T đầu năm: ĐÃ ĐÓNG SỔ (Vượt 50k định mức)
  h2_2026: { powerKWh: 32100, co2Kg: 21500, waterM3: 2400 }, // 6T cuối năm: KỲ HIỆN TẠI (64.2% định mức 50k)

  // Quản đốc NM (Bình Dương):
  q3_2026: { powerKWh: 5260, co2Kg: 2870, waterM3: 325 }, // Quý III: ĐÃ ĐÓNG SỔ (Vượt 5k định mức)
  q4_2026: { powerKWh: 2450, co2Kg: 1620, waterM3: 185 }, // Quý IV: KỲ HIỆN TẠI (49% định mức 5k)

  // Trưởng bộ phận (PX Chế biến):
  m9_2026: { powerKWh: 520, co2Kg: 295, waterM3: 34 }, // Tháng 9: ĐÃ ĐÓNG SỔ (Vượt 500 định mức)
  m10_2026: { powerKWh: 365, co2Kg: 240, waterM3: 26 }, // Tháng 10: KỲ HIỆN TẠI (73% định mức 500)
  today: { powerKWh: 145, co2Kg: 95, waterM3: 11 }, // Ca hôm nay (72.5% định mức ca 200)
};

export interface ESGSimulationProviderProps {
  children: ReactNode;
  activeNavId?: string;
  onNavigate?: (navId: string) => void;
}

export const ESGSimulationProvider: React.FC<ESGSimulationProviderProps> = ({
  children,
  activeNavId = 'esg-dashboard',
  onNavigate,
}) => {
  const [role, setRoleState] = useState<UserRole>('bod');
  const [factories, setFactories] = useState<FactoryItem[]>(INITIAL_VINAMILK_DATA);
  const [alerts, setAlerts] = useState<ESGAlert[]>(INITIAL_ALERTS);

  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('nm-vnm-bd');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('px-che-bien');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<RealtimeViewLevel>('enterprise');

  const [periodsData, setPeriodsData] = useState<Record<string, PeriodMetrics>>(INITIAL_PERIOD_DATA);

  const [activeScenario, setActiveScenario] = useState<PresetScenarioId | null>(null);
  const [evnTariffPeriod, setEvnTariffPeriod] = useState<EVNTariffPeriod>('peak');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('sunny');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [streamInterval, setStreamInterval] = useState<number>(3000);
  const [fluctuationLevel, setFluctuationLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>({
    power: 'kWh',
    co2: 'kg',
    water: 'm3',
  });

  // Default timePeriod according to initial role 'bod' is 'year_2026'
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('year_2026');
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const currentRoleConfig = ROLE_THRESHOLD_CONFIGS[role];

  const showToast = useCallback((notice: Omit<ToastNotice, 'id'>) => {
    const id = Date.now().toString();
    setToast({ ...notice, id });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 5500);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const navigateTo = useCallback(
    (navId: string, options?: ESGNavigationOptions) => {
      if (options?.factoryId) {
        setSelectedFactoryId(options.factoryId);
      }
      if (options?.workshopId) {
        setSelectedWorkshopId(options.workshopId);
      }
      if (options?.deviceId !== undefined) {
        setSelectedDeviceId(options.deviceId);
      }
      if (options?.viewLevel) {
        setViewLevel(options.viewLevel);
      }
      if (onNavigate) {
        onNavigate(navId);
      }
    },
    [onNavigate]
  );

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    const newConfig = ROLE_THRESHOLD_CONFIGS[newRole];

    // Automatically set the appropriate time period according to role hierarchy!
    setTimePeriod(newConfig.defaultPeriod);

    // Adjust selections and viewLevel to match defaults for roles
    if (newRole === 'bod') {
      setViewLevel('enterprise');
      setSelectedDeviceId(null);
    } else if (newRole === 'factory_director') {
      setViewLevel('factory');
      setSelectedFactoryId('nm-vnm-bd');
      setSelectedDeviceId(null);
    } else if (newRole === 'workshop_lead') {
      setViewLevel('workshop');
      setSelectedFactoryId('nm-vnm-bd');
      setSelectedWorkshopId('px-che-bien');
      setSelectedDeviceId(null);
    }

    showToast({
      title: `Chuyển quyền: ${newConfig.roleLabel}`,
      message: `Ngưỡng: ${newConfig.thresholds.powerDanger.toLocaleString('vi-VN')} ${newConfig.thresholds.powerUnit} • ${newConfig.evalPeriodLabel}`,
      type: 'info',
    });
  };

  const toggleStreaming = () => {
    setIsLiveStreaming((prev) => {
      const next = !prev;
      showToast({
        title: next ? 'Dữ liệu thời gian thực' : 'Tạm dừng mô phỏng',
        message: next ? 'Đã kích hoạt luồng dữ liệu tự sinh live.' : 'Dữ liệu đã được đóng băng.',
        type: 'info',
      });
      return next;
    });
  };

  const toggleUnit = (metric: MetricType) => {
    setUnitPreferences((prev) => {
      if (metric === 'power') {
        return { ...prev, power: prev.power === 'kWh' ? 'MWh' : 'kWh' };
      }
      if (metric === 'co2') {
        return { ...prev, co2: prev.co2 === 'kg' ? 'ton' : 'kg' };
      }
      return { ...prev, water: prev.water === 'm3' ? 'liter' : 'm3' };
    });
  };

  // Realtime Simulation Loop: Updates current open periods ONLY!
  // Closed audit periods (h1_2026, q3_2026, m9_2026) remain STRICTLY IMMUTABLE!
  useEffect(() => {
    if (!isLiveStreaming) return;

    const timer = setInterval(() => {
      setFactories((prevFactories) => {
        const factor = fluctuationLevel === 'low' ? 0.015 : fluctuationLevel === 'medium' ? 0.035 : 0.07;

        return prevFactories.map((factory) => {
          let factoryPower = 0;
          let factoryCo2 = 0;
          let factoryWater = 0;

          const updatedWorkshops = factory.workshops.map((workshop) => {
            let workshopPower = 0;
            let workshopCo2 = 0;
            let workshopWater = 0;
            let hasWarning = false;
            let hasDanger = false;

            const updatedDevices = workshop.devices.map((device) => {
              const updatedReadings = { ...device.readings };

              if (updatedReadings.power) {
                const delta = (Math.random() * 2 - 1) * factor * updatedReadings.power.max;
                const newVal = Math.max(50, Math.min(updatedReadings.power.max * 1.05, updatedReadings.power.value + delta));
                updatedReadings.power = { ...updatedReadings.power, value: Math.round(newVal) };
                workshopPower += updatedReadings.power.value;
              }

              if (updatedReadings.co2) {
                const delta = (Math.random() * 2 - 1) * factor * updatedReadings.co2.max;
                const newVal = Math.max(20, Math.min(updatedReadings.co2.max * 1.05, updatedReadings.co2.value + delta));
                updatedReadings.co2 = { ...updatedReadings.co2, value: Math.round(newVal) };
                workshopCo2 += updatedReadings.co2.value;
              }

              if (updatedReadings.water) {
                const delta = (Math.random() * 2 - 1) * factor * updatedReadings.water.max;
                const newVal = Math.max(5, Math.min(updatedReadings.water.max * 1.05, updatedReadings.water.value + delta));
                updatedReadings.water = { ...updatedReadings.water, value: Math.round(newVal) };
                workshopWater += updatedReadings.water.value;
              }

              let devStatus: 'normal' | 'warning' | 'danger' = 'normal';
              const pRatio = updatedReadings.power ? updatedReadings.power.value / updatedReadings.power.max : 0;
              const cRatio = updatedReadings.co2 ? updatedReadings.co2.value / updatedReadings.co2.max : 0;
              const wRatio = updatedReadings.water ? updatedReadings.water.value / updatedReadings.water.max : 0;
              const maxRatio = Math.max(pRatio, cRatio, wRatio);

              if (maxRatio >= 1.0) {
                devStatus = 'danger';
                hasDanger = true;
              } else if (maxRatio >= 0.8) {
                devStatus = 'warning';
                hasWarning = true;
              }

              return {
                ...device,
                readings: updatedReadings,
                status: devStatus,
              };
            });

            factoryPower += workshopPower;
            factoryCo2 += workshopCo2;
            factoryWater += workshopWater;

            const wsPRatio = workshopPower / 2500;
            const wsCRatio = workshopCo2 / 1800;
            const wsWRatio = workshopWater / 250;
            const wsMaxRatio = Math.max(wsPRatio, wsCRatio, wsWRatio);
            const wsStatus: 'normal' | 'warning' | 'danger' =
              wsMaxRatio >= 1.0 ? 'danger' : wsMaxRatio >= 0.8 ? 'warning' : 'normal';

            return {
              ...workshop,
              devices: updatedDevices,
              totals: {
                powerKWh: Math.round(workshopPower),
                co2Kg: Math.round(workshopCo2),
                waterM3: Math.round(workshopWater),
              },
              status: wsStatus,
            };
          });

          const factPRatio = factoryPower / 5000;
          const factCRatio = factoryCo2 / 3500;
          const factWRatio = factoryWater / 400;
          const factMaxRatio = Math.max(factPRatio, factCRatio, factWRatio);
          const factStatus: 'normal' | 'warning' | 'danger' =
            factMaxRatio >= 1.0 ? 'danger' : factMaxRatio >= 0.8 ? 'warning' : 'normal';

          return {
            ...factory,
            workshops: updatedWorkshops,
            totals: {
              powerKWh: Math.round(factoryPower),
              co2Kg: Math.round(factoryCo2),
              waterM3: Math.round(factoryWater),
            },
            status: factStatus,
          };
        });
      });

      // Gradually accumulate small telemetry increments into CURRENT OPEN PERIODS only!
      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: {
          powerKWh: prev.h2_2026.powerKWh + Math.round(Math.random() * 2),
          co2Kg: prev.h2_2026.co2Kg + Math.round(Math.random() * 1.5),
          waterM3: prev.h2_2026.waterM3 + Math.round(Math.random() * 0.2 * 10) / 10,
        },
        q4_2026: {
          powerKWh: prev.q4_2026.powerKWh + Math.round(Math.random() * 1),
          co2Kg: prev.q4_2026.co2Kg + Math.round(Math.random() * 0.8),
          waterM3: prev.q4_2026.waterM3 + Math.round(Math.random() * 0.1 * 10) / 10,
        },
        m10_2026: {
          powerKWh: prev.m10_2026.powerKWh + Math.round(Math.random() * 0.5),
          co2Kg: prev.m10_2026.co2Kg + Math.round(Math.random() * 0.4),
          waterM3: prev.m10_2026.waterM3 + Math.round(Math.random() * 0.05 * 10) / 10,
        },
        today: {
          powerKWh: prev.today.powerKWh + Math.round(Math.random() * 0.3),
          co2Kg: prev.today.co2Kg + Math.round(Math.random() * 0.2),
          waterM3: prev.today.waterM3 + Math.round(Math.random() * 0.02 * 10) / 10,
        },
      }));

      setLastUpdated(new Date());
    }, streamInterval);

    return () => clearInterval(timer);
  }, [isLiveStreaming, streamInterval, fluctuationLevel]);

  // Inject Anomaly with Rigorous Period Scoping & Historical Closed-Period Integrity!
  const triggerAnomaly = (metric: MetricType, periodTarget: 'closed_period' | 'current_period' = 'closed_period') => {
    const isClosedTarget = periodTarget === 'closed_period';
    const cfg = ROLE_THRESHOLD_CONFIGS[role];

    if (role === 'bod') {
      if (isClosedTarget) {
        // Anomaly belongs to 6 MONTHS FIRST HALF (01/01 - 30/06/2026) [CLOSED AUDIT PERIOD]
        // Increases h1_2026 and year_2026. h2_2026 (current) DOES NOT CHANGE!
        const addP = metric === 'power' ? 4500 : 0;
        const addC = metric === 'co2' ? 3200 : 0;
        const addW = metric === 'water' ? 380 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          h1_2026: {
            powerKWh: prev.h1_2026.powerKWh + addP,
            co2Kg: prev.h1_2026.co2Kg + addC,
            waterM3: prev.h1_2026.waterM3 + addW,
          },
        }));

        const newAlert: ESGAlert = {
          id: `ALT-BOD-H1-${Date.now().toString().slice(-4)}`,
          timestamp: '30/06/2026 23:59',
          factoryName: 'Tập đoàn Vinamilk (Toàn hệ thống)',
          workshopName: 'Kiểm toán sau đóng sổ Bán niên 1',
          metricType: metric,
          level: 'danger',
          message: `Kiểm toán sau đóng sổ phát hiện bổ sung sản lượng ${metric === 'power' ? 'điện' : metric === 'co2' ? 'CO₂' : 'nước'} 6 tháng đầu năm vượt định mức chuẩn (+${addP || addC || addW} ${metric === 'power' ? 'kWh' : metric === 'co2' ? 'kg' : 'm³'}).`,
          value: `${(52480 + addP).toLocaleString('vi-VN')} kWh`,
          threshold: '50.000 kWh',
          status: 'new',
          scopeLevel: 'enterprise',
          targetPeriod: 'h1_2026',
          timeHorizon: 'Đánh giá tích lũy theo 6 THÁNG',
          excessDuration: 'Vượt định mức lũy kế 6 tháng đầu năm (01/01 - 30/06/2026)',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        showToast({
          title: 'ĐÃ BỔ SUNG SỰ CỐ: 6 THÁNG ĐẦU NĂM (ĐÃ ĐÓNG SỔ)',
          message: 'Số liệu cộng dồn vào kỳ 6T đầu năm và tổng năm 2026. Kỳ hiện tại (6T cuối năm) KHÔNG BỊ ẢNH HƯỞNG.',
          type: 'danger',
        });
      } else {
        // Anomaly in CURRENT PERIOD (6T Cuối năm / h2_2026)
        // Increases h2_2026 and year_2026. h1_2026 (closed) DOES NOT CHANGE!
        const addP = metric === 'power' ? 19000 : 0;
        const addC = metric === 'co2' ? 14000 : 0;
        const addW = metric === 'water' ? 1700 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          h2_2026: {
            powerKWh: prev.h2_2026.powerKWh + addP,
            co2Kg: prev.h2_2026.co2Kg + addC,
            waterM3: prev.h2_2026.waterM3 + addW,
          },
        }));

        // Also bump current telemetry in factories to visually spike the realtime SCADA dials!
        setFactories((prev) =>
          prev.map((f, i) =>
            i === 0
              ? {
                  ...f,
                  totals: {
                    ...f.totals,
                    powerKWh: f.totals.powerKWh + 800,
                    co2Kg: f.totals.co2Kg + 600,
                  },
                }
              : f
          )
        );

        const newAlert: ESGAlert = {
          id: `ALT-BOD-H2-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          factoryName: 'Tập đoàn Vinamilk (Toàn hệ thống)',
          workshopName: 'Kỳ vận hành 6 tháng cuối năm',
          metricType: metric,
          level: 'danger',
          message: `Hệ thống đo lường tự động phát hiện sản lượng ${metric === 'power' ? 'điện' : metric === 'co2' ? 'CO₂' : 'nước'} kỳ 6 tháng cuối năm vượt hạn ngạch 50.000 (${(32100 + addP).toLocaleString('vi-VN')}).`,
          value: `${(32100 + addP).toLocaleString('vi-VN')} kWh`,
          threshold: '50.000 kWh',
          status: 'new',
          scopeLevel: 'enterprise',
          targetPeriod: 'h2_2026',
          timeHorizon: 'Đánh giá tích lũy theo 6 THÁNG',
          excessDuration: 'Vượt hạn ngạch lũy kế 6 tháng cuối năm',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        showToast({
          title: 'KÍCH HOẠT SỰ CỐ KỲ HIỆN TẠI (6T CUỐI NĂM)',
          message: 'Thanh đo kỳ hiện tại đã vượt 100% định mức. Kỳ 6T đầu năm đã đóng sổ giữ nguyên số liệu.',
          type: 'danger',
        });
      }
    } else if (role === 'factory_director') {
      if (isClosedTarget) {
        // Anomaly belongs to QUÝ III (01/07 - 30/09/2026) [CLOSED AUDIT PERIOD]
        // Increases q3_2026 and year_2026. q4_2026 (current) DOES NOT CHANGE!
        const addP = metric === 'power' ? 450 : 0;
        const addC = metric === 'co2' ? 320 : 0;
        const addW = metric === 'water' ? 35 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          q3_2026: {
            powerKWh: prev.q3_2026.powerKWh + addP,
            co2Kg: prev.q3_2026.co2Kg + addC,
            waterM3: prev.q3_2026.waterM3 + addW,
          },
        }));

        const newAlert: ESGAlert = {
          id: `ALT-FACT-Q3-${Date.now().toString().slice(-4)}`,
          timestamp: '30/09/2026 23:59',
          factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
          workshopName: 'Kiểm toán sau đóng sổ Quý III',
          metricType: metric,
          level: 'danger',
          message: `Biên bản kiểm toán phát hiện bổ sung mức tiêu thụ ${metric} Quý III vượt định mức 5.000 kWh tại Nhà máy Bình Dương (+${addP || addC || addW}).`,
          value: `${(5260 + addP).toLocaleString('vi-VN')} kWh`,
          threshold: '5.000 kWh',
          status: 'new',
          scopeLevel: 'factory',
          targetPeriod: 'q3_2026',
          timeHorizon: 'Đánh giá tích lũy theo QUÝ',
          excessDuration: 'Vượt định mức lũy kế Quý III (Đã đóng sổ)',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        showToast({
          title: 'ĐÃ BỔ SUNG SỰ CỐ: QUÝ III/2026 (ĐÃ ĐÓNG SỔ)',
          message: 'Số liệu cộng vào Quý III và tổng năm. Quý IV (hiện tại) KHÔNG BỊ ẢNH HƯỞNG.',
          type: 'danger',
        });
      } else {
        // Anomaly in CURRENT PERIOD (Quý IV / q4_2026)
        const addP = metric === 'power' ? 2650 : 0;
        const addC = metric === 'co2' ? 1900 : 0;
        const addW = metric === 'water' ? 220 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          q4_2026: {
            powerKWh: prev.q4_2026.powerKWh + addP,
            co2Kg: prev.q4_2026.co2Kg + addC,
            waterM3: prev.q4_2026.waterM3 + addW,
          },
        }));

        // Bump factory telemetry in factories
        setFactories((prev) =>
          prev.map((f) =>
            f.id === selectedFactoryId
              ? {
                  ...f,
                  totals: {
                    ...f.totals,
                    powerKWh: f.totals.powerKWh + 450,
                  },
                }
              : f
          )
        );

        const newAlert: ESGAlert = {
          id: `ALT-FACT-Q4-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
          workshopName: 'Dây chuyền vận hành Quý IV',
          metricType: metric,
          level: 'danger',
          message: `Hệ thống đo lường tự động phát hiện lượng tiêu thụ ${metric} Quý IV vượt định mức 5.000 (${(2450 + addP).toLocaleString('vi-VN')}).`,
          value: `${(2450 + addP).toLocaleString('vi-VN')} kWh`,
          threshold: '5.000 kWh',
          status: 'new',
          scopeLevel: 'factory',
          targetPeriod: 'q4_2026',
          timeHorizon: 'Đánh giá tích lũy theo QUÝ',
          excessDuration: 'Vượt định mức lũy kế Quý IV',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        showToast({
          title: 'KÍCH HOẠT SỰ CỐ QUÝ IV (KỲ HIỆN TẠI)',
          message: 'Thanh đo Quý IV đã vượt 100% định mức. Quý III đã đóng sổ giữ nguyên.',
          type: 'danger',
        });
      }
    } else {
      // Workshop Lead
      if (isClosedTarget) {
        // Anomaly belongs to THÁNG 9/2026 [CLOSED AUDIT PERIOD]
        const addP = metric === 'power' ? 45 : 0;
        const addC = metric === 'co2' ? 35 : 0;
        const addW = metric === 'water' ? 4 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          m9_2026: {
            powerKWh: prev.m9_2026.powerKWh + addP,
            co2Kg: prev.m9_2026.co2Kg + addC,
            waterM3: prev.m9_2026.waterM3 + addW,
          },
        }));

        const newAlert: ESGAlert = {
          id: `ALT-WS-M9-${Date.now().toString().slice(-4)}`,
          timestamp: '30/09/2026 21:00',
          factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
          workshopName: 'PX Chế biến sữa tiệt trùng',
          deviceName: 'Máy tiệt trùng UHT Aseptic #01',
          metricType: metric,
          level: 'danger',
          message: `Kiểm tra chốt chỉ số công tơ tháng 9 phát hiện bổ sung tiêu thụ vượt định mức 500 kWh (+${addP || addC || addW}).`,
          value: `${520 + addP} kWh`,
          threshold: '500 kWh',
          status: 'new',
          scopeLevel: 'workshop',
          targetPeriod: 'm9_2026',
          timeHorizon: 'Đánh giá tích lũy theo THÁNG',
          excessDuration: 'Quá định mức bình quân tháng 9/2026 (Đã đóng sổ)',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        showToast({
          title: 'ĐÃ BỔ SUNG SỰ CỐ: THÁNG 9/2026 (ĐÃ ĐÓNG SỔ)',
          message: 'Số liệu cộng vào Tháng 9. Tháng 10 (hiện tại) KHÔNG BỊ ẢNH HƯỞNG.',
          type: 'danger',
        });
      } else {
        // Anomaly in CURRENT PERIOD (Tháng 10 & Hôm nay)
        const addP = metric === 'power' ? 150 : 0;
        const addC = metric === 'co2' ? 115 : 0;
        const addW = metric === 'water' ? 15 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          m10_2026: {
            powerKWh: prev.m10_2026.powerKWh + addP,
            co2Kg: prev.m10_2026.co2Kg + addC,
            waterM3: prev.m10_2026.waterM3 + addW,
          },
          today: {
            powerKWh: prev.today.powerKWh + addP,
            co2Kg: prev.today.co2Kg + addC,
            waterM3: prev.today.waterM3 + addW,
          },
        }));

        // Bump device reading in factories
        setFactories((prev) =>
          prev.map((f) => ({
            ...f,
            workshops: f.workshops.map((w) => ({
              ...w,
              devices: w.devices.map((d, dIdx) =>
                dIdx === 0 && d.readings.power
                  ? {
                      ...d,
                      readings: {
                        ...d.readings,
                        power: { ...d.readings.power, value: d.readings.power.value + 60 },
                      },
                      status: 'danger',
                    }
                  : d
              ),
            })),
          }))
        );

        const newAlert: ESGAlert = {
          id: `ALT-WS-M10-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
          workshopName: 'PX Chế biến sữa tiệt trùng',
          deviceName: 'Máy tiệt trùng UHT Aseptic #01',
          metricType: metric,
          level: 'danger',
          message: `Cảm biến IoT ghi nhận tiêu thụ điện tích lũy tháng 10 vượt định mức 500 kWh tại Máy UHT #01 (${365 + addP} kWh).`,
          value: `${365 + addP} kWh`,
          threshold: '500 kWh',
          status: 'new',
          scopeLevel: 'workshop',
          targetPeriod: 'm10_2026',
          timeHorizon: 'Đánh giá tích lũy theo THÁNG',
          excessDuration: 'Quá định mức bình quân tháng 10',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        showToast({
          title: 'KÍCH HOẠT SỰ CỐ THÁNG 10 (KỲ HIỆN TẠI)',
          message: 'Thanh đo Tháng 10 đã vượt định mức. Tháng 9 đã đóng sổ giữ nguyên.',
          type: 'danger',
        });
      }
    }
  };

  // Resolve Alert:
  // Strictly preserves historical consumption (Never alters past records!).
  // Establishes a CAPA resolution and prevents future overflow.
  const resolveAlert = (alertId: string, payload?: AlertResolutionPayload) => {
    const nowFull = new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          status: 'resolved' as const,
          rootCause: payload?.rootCause || 'Đã kiểm tra kỹ thuật tại hiện trường, lập biên bản xác định nguyên nhân tổn thất điện năng.',
          resolution: payload?.resolution || 'Đã ban hành quy chuẩn vận hành mới và điều tiết phụ tải để đảm bảo không tái diễn trong tương lai.',
          resolvedBy:
            payload?.resolvedBy ||
            (role === 'bod'
              ? 'Nguyễn Văn An (Chuyên viên ESG Tập đoàn)'
              : role === 'factory_director'
              ? 'Phạm Minh Quân (Trưởng phòng Kỹ thuật NM)'
              : 'Trần Thanh Hải (Quản đốc Phân xưởng)'),
          resolvedAt: nowFull,
          meetingMinute: payload?.meetingMinuteTitle
            ? {
                code: payload.meetingMinuteCode || `BB-${Date.now().toString().slice(-4)}/HSE`,
                title: payload.meetingMinuteTitle,
                date: nowFull,
                attendees: payload.meetingMinuteAttendees || 'Hội đồng Kỹ thuật & Quản lý Năng lượng',
                fileName: payload.meetingMinuteFile || 'Bien-ban-hop-khac-phuc.pdf',
                fileSize: payload.meetingMinuteFileSize || '1.5 MB',
              }
            : a.meetingMinute,
        };
      })
    );

    // Future Safeguard: Stabilize current instantaneous device readings to nominal rating
    // so future telemetry won't runaway, while historical cumulative totals remain 100% UNCHANGED.
    setFactories((prev) =>
      prev.map((f) => ({
        ...f,
        workshops: f.workshops.map((w) => ({
          ...w,
          devices: w.devices.map((d) => {
            if (d.status === 'danger') {
              return {
                ...d,
                status: 'normal',
                readings: {
                  ...d.readings,
                  power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 0.72) } : undefined,
                  co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 0.72) } : undefined,
                  water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 0.72) } : undefined,
                },
              };
            }
            return d;
          }),
        })),
      }))
    );

    showToast({
      title: 'Đã hoàn tất phê duyệt giải pháp khắc phục',
      message: 'Biên bản xử lý đã được lưu. Dữ liệu lịch sử giữ nguyên theo chuẩn kiểm toán, phương án kiểm soát mới đã được kích hoạt cho tương lai.',
      type: 'success',
    });
  };

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      showToast({
        title: next ? 'Còi báo SCADA: ĐÃ BẬT' : 'Còi báo SCADA: ĐÃ TẮT',
        message: next ? 'Hệ thống sẽ phát âm thanh cảnh báo khi có sự cố phát sinh.' : 'Âm thanh cảnh báo đã được tắt.',
        type: 'info',
      });
      return next;
    });
  }, [showToast]);

  const playAlarmBeep = useCallback(() => {
    if (isSoundEnabled) {
      playIndustrialAlertSound();
    }
  }, [isSoundEnabled]);

  const applyPresetScenario = (scenario: PresetScenarioId) => {
    setActiveScenario(scenario);
    const nowFull = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (scenario === 'peak_production') {
      // 1. Peak Production: All devices run near or slightly above capacity (95-104%)
      setFactories((prev) =>
        prev.map((f) => ({
          ...f,
          workshops: f.workshops.map((w) => ({
            ...w,
            devices: w.devices.map((d) => ({
              ...d,
              readings: {
                power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 0.98) } : undefined,
                co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 0.94) } : undefined,
                water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 0.96) } : undefined,
              },
              status: 'warning' as const,
            })),
          })),
        }))
      );

      // Bump current open periods by +15%
      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: { ...prev.h2_2026, powerKWh: prev.h2_2026.powerKWh + 4800 },
        q4_2026: { ...prev.q4_2026, powerKWh: prev.q4_2026.powerKWh + 650 },
        m10_2026: { ...prev.m10_2026, powerKWh: prev.m10_2026.powerKWh + 65 },
        today: { ...prev.today, powerKWh: prev.today.powerKWh + 30 },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-PEAK-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'Toàn nhà máy',
        deviceName: 'Cụm Dây chuyền Tiệt trùng UHT & Chiết rót',
        metricType: 'power',
        level: 'warning',
        message: 'Kích hoạt ca sản xuất cao điểm: Phụ tải đồng thời đạt 98% công suất danh định.',
        value: '98% tải',
        threshold: '85% cảnh báo',
        status: 'new',
        scopeLevel: 'factory',
        timeHorizon: 'Vận hành theo Ca sản xuất',
        excessDuration: 'Ca sản xuất tăng tốc hoàn thành đơn hàng xuất khẩu',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: 'KÍCH HOẠT: CA SẢN XUẤT CAO ĐIỂM',
        message: 'Dây chuyền UHT & Chiết rót chạy 98% công suất. Cảnh báo cận tải được ghi nhận.',
        type: 'warning',
      });
    } else if (scenario === 'eco_green') {
      // 2. Eco-Green RE100: Maximize solar & biomass, minimize EVN grid
      setFactories((prev) =>
        prev.map((f) => ({
          ...f,
          workshops: f.workshops.map((w) => ({
            ...w,
            devices: w.devices.map((d) => ({
              ...d,
              readings: {
                power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 0.65) } : undefined,
                co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 0.58) } : undefined,
                water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 0.62) } : undefined,
              },
              status: 'normal' as const,
            })),
          })),
        }))
      );

      setEvnTariffPeriod('offpeak');
      setWeatherCondition('sunny');

      showToast({
        title: 'KÍCH HOẠT: CHẾ ĐỘ XANH ECO-GREEN RE100',
        message: 'Tối ưu hóa điện mặt trời & sinh khối. Giảm 35% phát thải và đưa phụ tải về dải xanh an toàn.',
        type: 'success',
      });
    } else if (scenario === 'boiler_anomaly') {
      // 3. Boiler Anomaly: Biomass boiler fault -> FO fuel backup spikes CO2 to 138%
      setFactories((prev) =>
        prev.map((f) => ({
          ...f,
          workshops: f.workshops.map((w) => ({
            ...w,
            devices: w.devices.map((d, idx) =>
              d.name.includes('Lò hơi') || (w.id.includes('phu-tro') && idx === 0)
                ? {
                    ...d,
                    readings: {
                      ...d.readings,
                      co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 1.38) } : undefined,
                      power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 1.15) } : undefined,
                    },
                    status: 'danger' as const,
                  }
                : d
            ),
          })),
        }))
      );

      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: { ...prev.h2_2026, co2Kg: prev.h2_2026.co2Kg + 6200 },
        q4_2026: { ...prev.q4_2026, co2Kg: prev.q4_2026.co2Kg + 820 },
        m10_2026: { ...prev.m10_2026, co2Kg: prev.m10_2026.co2Kg + 85 },
        today: { ...prev.today, co2Kg: prev.today.co2Kg + 45 },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-BOILER-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'Trạm Động lực & Lò hơi Biomass',
        deviceName: 'Lò hơi tầng sôi đốt trấu 10 T/h #01',
        metricType: 'co2',
        level: 'danger',
        message: 'Mất cân bằng buồng đốt tầng sôi lò hơi: Khói thải CO₂ vượt 138% ngưỡng quy chuẩn kỹ thuật.',
        value: '138% ngưỡng',
        threshold: '100% định mức',
        status: 'new',
        scopeLevel: 'workshop',
        timeHorizon: 'Thời gian thực',
        excessDuration: 'Cần chuyển đổi quy trình cấp gió và nhiên liệu',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: 'CẢNH BÁO KHẨN CẤP: SỰ CỐ LÒ HƠI SINH KHỐI',
        message: 'Phát thải CO₂ lò hơi vượt 138% ngưỡng an toàn. Đã xuất hiện cảnh báo đỏ trên SCADA.',
        type: 'danger',
      });
    } else if (scenario === 'pipe_burst') {
      // 4. Pipe Burst: CIP Water pipe leakage jumps water reading to 145%
      setFactories((prev) =>
        prev.map((f) => ({
          ...f,
          workshops: f.workshops.map((w) => ({
            ...w,
            devices: w.devices.map((d, idx) =>
              d.name.includes('Bơm') || d.name.includes('CIP') || (w.id.includes('che-bien') && idx === 1)
                ? {
                    ...d,
                    readings: {
                      ...d.readings,
                      water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.45) } : undefined,
                    },
                    status: 'danger' as const,
                  }
                : d
            ),
          })),
        }))
      );

      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: { ...prev.h2_2026, waterM3: prev.h2_2026.waterM3 + 750 },
        q4_2026: { ...prev.q4_2026, waterM3: prev.q4_2026.waterM3 + 95 },
        m10_2026: { ...prev.m10_2026, waterM3: prev.m10_2026.waterM3 + 12 },
        today: { ...prev.today, waterM3: prev.today.waterM3 + 6 },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-PIPE-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'PX Chế biến sữa tiệt trùng',
        deviceName: 'Hệ thống Vệ sinh Đường ống Tự động CIP #02',
        metricType: 'water',
        level: 'danger',
        message: 'Bục gioăng áp lực đường ống nước vệ sinh CIP: Lưu lượng nước sạch vượt 145% định mức.',
        value: '145% lưu lượng',
        threshold: '100% định mức',
        status: 'new',
        scopeLevel: 'workshop',
        timeHorizon: 'Thời gian thực',
        excessDuration: 'Cần ngắt van áp lực để cô lập đoạn ống',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: 'CẢNH BÁO KHẨN CẤP: BỤC ĐƯỜNG ỐNG NƯỚC CIP',
        message: 'Lưu lượng nước sạch vượt 145%. Đã kích hoạt cảnh báo đỏ tại Xưởng Chế biến.',
        type: 'danger',
      });
    } else if (scenario === 'solar_peak') {
      // 5. Solar Peak: 100% solar irradiation
      setWeatherCondition('sunny');
      showToast({
        title: 'ĐIỀU KIỆN THỜI TIẾT: NẮNG ĐẠT ĐỈNH (100%)',
        message: 'Hệ thống Solar Rooftop 5.4 MWp phát tối đa công suất, giảm tải nhận từ lưới EVN.',
        type: 'info',
      });
    } else if (scenario === 'grid_brownout') {
      // 6. EVN Peak Surcharge: Demand-Response Trigger
      setEvnTariffPeriod('peak');
      const newAlert: ESGAlert = {
        id: `ALT-EVN-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Toàn hệ thống Vinamilk',
        workshopName: 'Trạm Biến áp Trung thế 22/0.4kV',
        deviceName: 'Công tơ Tổng EVN 3 Giá',
        metricType: 'power',
        level: 'warning',
        message: 'Lưới điện EVN chạm giờ cao điểm (3.250 đ/kWh). Kích hoạt chế độ giảm phụ tải đỉnh.',
        value: '3.250 đ/kWh',
        threshold: 'Khung giá cao điểm',
        status: 'new',
        scopeLevel: 'enterprise',
        timeHorizon: '09:30-11:30 & 17:00-20:00',
        excessDuration: 'Khuyến nghị dịch chuyển các phụ tải gián đoạn sang giờ thấp điểm',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: 'ĐIỀU TIẾT PHỤ TẢI: GIỜ CAO ĐIỂM EVN',
        message: 'Biểu giá chạm 3.250 đ/kWh (+82%). Khuyến nghị dịch chuyển phụ tải sạc xe nâng sang ban đêm.',
        type: 'warning',
      });
    }
  };

  const resetSimulation = () => {
    setFactories(INITIAL_VINAMILK_DATA);
    setAlerts(INITIAL_ALERTS);
    setPeriodsData(INITIAL_PERIOD_DATA);
    setActiveScenario(null);
    setEvnTariffPeriod('standard');
    setWeatherCondition('sunny');
    showToast({
      title: 'Thiết lập lại mô phỏng',
      message: 'Toàn bộ chỉ số năng lượng & phát thải các kỳ đã được hoàn trả về thông số ban đầu.',
      type: 'info',
    });
  };

  // Filter alerts by role scope
  const getRoleFilteredAlerts = () => {
    if (role === 'bod') {
      return alerts.filter((a) => a.scopeLevel === 'enterprise' || a.scopeLevel === 'factory');
    }
    if (role === 'factory_director') {
      return alerts.filter(
        (a) => a.scopeLevel === 'factory' || (a.scopeLevel === 'workshop' && a.factoryName.includes('Bình Dương'))
      );
    }
    return alerts.filter((a) => a.scopeLevel === 'workshop');
  };

  // Compute Scoped Totals strictly aligned with the selected Time Period & Role Audit Boundaries!
  const calculateScopedTotals = () => {
    let powerKWh = 0;
    let co2Kg = 0;
    let waterM3 = 0;
    let deviceCount = 0;
    let isClosedPeriod = false;
    let periodLabel = '';
    let dateRange = '';
    let effectivePowerLimit = currentRoleConfig.thresholds.powerDanger;
    let effectiveCo2Limit = currentRoleConfig.thresholds.co2Danger;
    let effectiveWaterLimit = currentRoleConfig.thresholds.waterDanger;

    // Count devices
    if (role === 'bod') {
      factories.forEach((f) => f.workshops.forEach((w) => (deviceCount += w.devices.length)));
    } else if (role === 'factory_director') {
      const targetFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
      targetFactory.workshops.forEach((w) => (deviceCount += w.devices.length));
    } else {
      const targetFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
      const targetWorkshop = targetFactory.workshops.find((w) => w.id === selectedWorkshopId) || targetFactory.workshops[0];
      deviceCount = targetWorkshop.devices.length;
    }

    if (role === 'bod') {
      if (timePeriod === 'h1_2026') {
        powerKWh = periodsData.h1_2026.powerKWh;
        co2Kg = periodsData.h1_2026.co2Kg;
        waterM3 = periodsData.h1_2026.waterM3;
        isClosedPeriod = true;
        periodLabel = '6 Tháng Đầu Năm 2026 [ĐÃ ĐÓNG SỔ KIỂM TOÁN]';
        dateRange = '01/01/2026 - 30/06/2026';
        effectivePowerLimit = 50000;
        effectiveCo2Limit = 35000;
        effectiveWaterLimit = 4000;
      } else if (timePeriod === 'h2_2026') {
        powerKWh = periodsData.h2_2026.powerKWh;
        co2Kg = periodsData.h2_2026.co2Kg;
        waterM3 = periodsData.h2_2026.waterM3;
        isClosedPeriod = false;
        periodLabel = '6 Tháng Cuối Năm 2026 [KỲ HIỆN TẠI - ĐANG VẬN HÀNH LIVE]';
        dateRange = '01/07/2026 - 31/12/2026';
        effectivePowerLimit = 50000;
        effectiveCo2Limit = 35000;
        effectiveWaterLimit = 4000;
      } else if (timePeriod === '3years') {
        powerKWh = 615000;
        co2Kg = 391500;
        waterM3 = 44900;
        isClosedPeriod = true;
        periodLabel = 'Giai đoạn 3 Năm (2024 - 2026)';
        dateRange = '2024 - 2026';
        effectivePowerLimit = 600000;
        effectiveCo2Limit = 380000;
        effectiveWaterLimit = 45000;
      } else {
        // year_2026 or default year: Sum of H1 (closed) + H2 (open live)
        powerKWh = periodsData.h1_2026.powerKWh + periodsData.h2_2026.powerKWh;
        co2Kg = periodsData.h1_2026.co2Kg + periodsData.h2_2026.co2Kg;
        waterM3 = periodsData.h1_2026.waterM3 + periodsData.h2_2026.waterM3;
        isClosedPeriod = false;
        periodLabel = 'Toàn Năm 2026 (Lũy kế 6T đầu + 6T cuối)';
        dateRange = '01/01/2026 - 31/12/2026';
        effectivePowerLimit = 100000;
        effectiveCo2Limit = 70000;
        effectiveWaterLimit = 8000;
      }
    } else if (role === 'factory_director') {
      if (timePeriod === 'q3_2026') {
        powerKWh = periodsData.q3_2026.powerKWh;
        co2Kg = periodsData.q3_2026.co2Kg;
        waterM3 = periodsData.q3_2026.waterM3;
        isClosedPeriod = true;
        periodLabel = 'Quý III/2026 [ĐÃ ĐÓNG SỔ KIỂM SOÁT QUÝ]';
        dateRange = '01/07/2026 - 30/09/2026';
        effectivePowerLimit = 5000;
        effectiveCo2Limit = 3500;
        effectiveWaterLimit = 400;
      } else if (timePeriod === 'q4_2026') {
        powerKWh = periodsData.q4_2026.powerKWh;
        co2Kg = periodsData.q4_2026.co2Kg;
        waterM3 = periodsData.q4_2026.waterM3;
        isClosedPeriod = false;
        periodLabel = 'Quý IV/2026 [KỲ HIỆN TẠI - ĐANG VẬN HÀNH LIVE]';
        dateRange = '01/10/2026 - 31/12/2026';
        effectivePowerLimit = 5000;
        effectiveCo2Limit = 3500;
        effectiveWaterLimit = 400;
      } else {
        // year_2026 for Factory Director: Q1 + Q2 + Q3 (closed) + Q4 (open live)
        powerKWh = 4800 + 4950 + periodsData.q3_2026.powerKWh + periodsData.q4_2026.powerKWh;
        co2Kg = 2600 + 2700 + periodsData.q3_2026.co2Kg + periodsData.q4_2026.co2Kg;
        waterM3 = 310 + 320 + periodsData.q3_2026.waterM3 + periodsData.q4_2026.waterM3;
        isClosedPeriod = false;
        periodLabel = 'Lũy kế Cả Năm 2026 (Q1 + Q2 + Q3 + Q4)';
        dateRange = '01/01/2026 - 31/12/2026';
        effectivePowerLimit = 20000;
        effectiveCo2Limit = 14000;
        effectiveWaterLimit = 1600;
      }
    } else {
      // Workshop Lead
      if (timePeriod === 'm9_2026') {
        powerKWh = periodsData.m9_2026.powerKWh;
        co2Kg = periodsData.m9_2026.co2Kg;
        waterM3 = periodsData.m9_2026.waterM3;
        isClosedPeriod = true;
        periodLabel = 'Tháng 9/2026 [ĐÃ ĐÓNG SỔ KIỂM SOÁT THÁNG]';
        dateRange = '01/09/2026 - 30/09/2026';
        effectivePowerLimit = 500;
        effectiveCo2Limit = 350;
        effectiveWaterLimit = 40;
      } else if (timePeriod === 'today') {
        powerKWh = periodsData.today.powerKWh;
        co2Kg = periodsData.today.co2Kg;
        waterM3 = periodsData.today.waterM3;
        isClosedPeriod = false;
        periodLabel = 'Ca vận hành hôm nay [THỜI GIAN THỰC]';
        dateRange = '21/10/2026';
        effectivePowerLimit = 200;
        effectiveCo2Limit = 140;
        effectiveWaterLimit = 16;
      } else {
        // m10_2026 (or default month)
        powerKWh = periodsData.m10_2026.powerKWh;
        co2Kg = periodsData.m10_2026.co2Kg;
        waterM3 = periodsData.m10_2026.waterM3;
        isClosedPeriod = false;
        periodLabel = 'Tháng 10/2026 [KỲ HIỆN TẠI - ĐANG VẬN HÀNH LIVE]';
        dateRange = '01/10/2026 - 31/10/2026';
        effectivePowerLimit = 500;
        effectiveCo2Limit = 350;
        effectiveWaterLimit = 40;
      }
    }

    const roleAlerts = getRoleFilteredAlerts();
    const activeAlerts = roleAlerts.filter((a) => a.status !== 'resolved');

    return {
      powerKWh,
      co2Kg,
      waterM3,
      deviceCount,
      alertCount: activeAlerts.length,
      isClosedPeriod,
      periodLabel,
      dateRange,
      effectivePowerLimit,
      effectiveCo2Limit,
      effectiveWaterLimit,
    };
  };

  return (
    <ESGSimulationContext.Provider
      value={{
        activeNavId,
        navigateTo,
        role,
        setRole,
        currentRoleConfig,
        viewLevel,
        setViewLevel,
        selectedFactoryId,
        setSelectedFactoryId,
        selectedWorkshopId,
        setSelectedWorkshopId,
        selectedDeviceId,
        setSelectedDeviceId,
        factories,
        alerts,
        roleFilteredAlerts: getRoleFilteredAlerts(),
        isLiveStreaming,
        toggleStreaming,
        streamInterval,
        setStreamInterval,
        fluctuationLevel,
        setFluctuationLevel,
        lastUpdated,
        triggerAnomaly,
        resetSimulation,
        resolveAlert,
        unitPreferences,
        toggleUnit,
        timePeriod,
        setTimePeriod,
        periodsData,
        activeScenario,
        applyPresetScenario,
        evnTariffPeriod,
        setEvnTariffPeriod,
        weatherCondition,
        setWeatherCondition,
        isSoundEnabled,
        toggleSound,
        playAlarmBeep,
        toast,
        dismissToast,
        scopedTotals: calculateScopedTotals(),
      }}
    >
      {children}
    </ESGSimulationContext.Provider>
  );
};

export const useESGSimulation = () => {
  const context = useContext(ESGSimulationContext);
  if (!context) {
    throw new Error('useESGSimulation must be used within an ESGSimulationProvider');
  }
  return context;
};
