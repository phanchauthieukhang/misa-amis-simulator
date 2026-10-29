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
  q4_2026: { powerKWh: 3450, co2Kg: 2320, waterM3: 265 }, // Quý IV: KỲ HIỆN TẠI (69% định mức 5k)

  // Trưởng bộ phận (PX Chế biến):
  m9_2026: { powerKWh: 520, co2Kg: 295, waterM3: 34 }, // Tháng 9: ĐÃ ĐÓNG SỔ (Vượt 500 định mức)
  m10_2026: { powerKWh: 365, co2Kg: 240, waterM3: 26 }, // Tháng 10: KỲ HIỆN TẠI (73% định mức 500)
  today: { powerKWh: 145, co2Kg: 95, waterM3: 11 }, // Ca hôm nay (72.5% định mức ca 200)
};

// Pure helper: Synchronously recalculates Device Status -> Workshop Totals & Status -> Factory Totals & Status
// Ensures 100% bottom-up mathematical & visual consistency across all charts, tables, and SCADA views.
const recalculateFactoriesHierarchy = (factoriesList: FactoryItem[]): FactoryItem[] => {
  return factoriesList.map((factory) => {
    let factoryPower = 0;
    let factoryCo2 = 0;
    let factoryWater = 0;
    let factoryHasDangerWorkshop = false;
    let factoryHasWarningWorkshop = false;

    const updatedWorkshops = factory.workshops.map((workshop) => {
      let workshopPower = 0;
      let workshopCo2 = 0;
      let workshopWater = 0;
      let wsHasDangerDevice = false;
      let wsHasWarningDevice = false;

      const updatedDevices = workshop.devices.map((device) => {
        const pVal = device.readings.power?.value || 0;
        const pMax = device.readings.power?.max || 1;
        const cVal = device.readings.co2?.value || 0;
        const cMax = device.readings.co2?.max || 1;
        const wVal = device.readings.water?.value || 0;
        const wMax = device.readings.water?.max || 1;

        workshopPower += pVal;
        workshopCo2 += cVal;
        workshopWater += wVal;

        const pRatio = device.readings.power ? pVal / pMax : 0;
        const cRatio = device.readings.co2 ? cVal / cMax : 0;
        const wRatio = device.readings.water ? wVal / wMax : 0;
        const maxRatio = Math.max(pRatio, cRatio, wRatio);

        let devStatus: 'normal' | 'warning' | 'danger' = 'normal';
        if (maxRatio >= 1.0) {
          devStatus = 'danger';
          wsHasDangerDevice = true;
        } else if (maxRatio >= 0.8) {
          devStatus = 'warning';
          wsHasWarningDevice = true;
        }

        return {
          ...device,
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

      let wsStatus: 'normal' | 'warning' | 'danger' = 'normal';
      if (wsMaxRatio >= 1.0 || wsHasDangerDevice) {
        wsStatus = wsMaxRatio >= 1.0 ? 'danger' : 'warning';
      } else if (wsMaxRatio >= 0.8 || wsHasWarningDevice) {
        wsStatus = 'warning';
      }

      if (wsStatus === 'danger') factoryHasDangerWorkshop = true;
      if (wsStatus === 'warning') factoryHasWarningWorkshop = true;

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

    let factStatus: 'normal' | 'warning' | 'danger' = 'normal';
    if (factMaxRatio >= 1.0) {
      factStatus = 'danger';
    } else if (factMaxRatio >= 0.8 || factoryHasDangerWorkshop || factoryHasWarningWorkshop) {
      factStatus = 'warning';
    }

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
  // Importantly, if a device metric is in an active over-quota anomaly state (>= max * 1.02),
  // it fluctuates within its over-quota band [max * 1.08, max * 1.48] instead of being clamped back down below 100%!
  useEffect(() => {
    if (!isLiveStreaming) return;

    const timer = setInterval(() => {
      setFactories((prevFactories) => {
        const factor = fluctuationLevel === 'low' ? 0.015 : fluctuationLevel === 'medium' ? 0.035 : 0.07;

        const mutated = prevFactories.map((factory) => ({
          ...factory,
          workshops: factory.workshops.map((workshop) => ({
            ...workshop,
            devices: workshop.devices.map((device) => {
              const updatedReadings = { ...device.readings };

              if (updatedReadings.power) {
                const { value, max } = updatedReadings.power;
                const delta = (Math.random() * 2 - 1) * factor * max;
                const isOverQuota = value >= max * 1.02;
                const minBound = isOverQuota ? max * 1.08 : max * 0.25;
                const maxBound = isOverQuota ? max * 1.48 : max * 0.96;
                const newVal = Math.max(minBound, Math.min(maxBound, value + delta));
                updatedReadings.power = { ...updatedReadings.power, value: Math.round(newVal) };
              }

              if (updatedReadings.co2) {
                const { value, max } = updatedReadings.co2;
                const delta = (Math.random() * 2 - 1) * factor * max;
                const isOverQuota = value >= max * 1.02;
                const minBound = isOverQuota ? max * 1.08 : max * 0.25;
                const maxBound = isOverQuota ? max * 1.48 : max * 0.96;
                const newVal = Math.max(minBound, Math.min(maxBound, value + delta));
                updatedReadings.co2 = { ...updatedReadings.co2, value: Math.round(newVal) };
              }

              if (updatedReadings.water) {
                const { value, max } = updatedReadings.water;
                const delta = (Math.random() * 2 - 1) * factor * max;
                const isOverQuota = value >= max * 1.02;
                const minBound = isOverQuota ? max * 1.08 : max * 0.25;
                const maxBound = isOverQuota ? max * 1.48 : max * 0.96;
                const newVal = Math.max(minBound, Math.min(maxBound, value + delta));
                updatedReadings.water = { ...updatedReadings.water, value: Math.round(newVal) };
              }

              return {
                ...device,
                readings: updatedReadings,
              };
            }),
          })),
        }));

        return recalculateFactoriesHierarchy(mutated);
      });

      // Gradually accumulate small telemetry increments into CURRENT OPEN PERIODS only!
      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: {
          powerKWh: prev.h2_2026.powerKWh + Math.round(Math.random() * 2),
          co2Kg: prev.h2_2026.co2Kg + Math.round(Math.random() * 1.5),
          waterM3: Number((prev.h2_2026.waterM3 + Math.round(Math.random() * 0.2 * 10) / 10).toFixed(1)),
        },
        q4_2026: {
          powerKWh: prev.q4_2026.powerKWh + Math.round(Math.random() * 1),
          co2Kg: prev.q4_2026.co2Kg + Math.round(Math.random() * 0.8),
          waterM3: Number((prev.q4_2026.waterM3 + Math.round(Math.random() * 0.1 * 10) / 10).toFixed(1)),
        },
        m10_2026: {
          powerKWh: prev.m10_2026.powerKWh + Math.round(Math.random() * 0.5),
          co2Kg: prev.m10_2026.co2Kg + Math.round(Math.random() * 0.4),
          waterM3: Number((prev.m10_2026.waterM3 + Math.round(Math.random() * 0.05 * 10) / 10).toFixed(1)),
        },
        today: {
          powerKWh: prev.today.powerKWh + Math.round(Math.random() * 0.3),
          co2Kg: prev.today.co2Kg + Math.round(Math.random() * 0.2),
          waterM3: Number((prev.today.waterM3 + Math.round(Math.random() * 0.02 * 10) / 10).toFixed(1)),
        },
      }));

      setLastUpdated(new Date());
    }, streamInterval);

    return () => clearInterval(timer);
  }, [isLiveStreaming, streamInterval, fluctuationLevel]);

  // Inject Anomaly with Rigorous Period Scoping, Historical Closed-Period Integrity & Bottom-Up UX/UI Sync!
  const triggerAnomaly = (metric: MetricType, periodTarget: 'closed_period' | 'current_period' = 'closed_period') => {
    const isClosedTarget = periodTarget === 'closed_period';

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
          value:
            metric === 'power'
              ? `${(52480 + addP).toLocaleString('vi-VN')} kWh`
              : metric === 'co2'
              ? `${(30100 + addC).toLocaleString('vi-VN')} kg CO₂e`
              : `${(3450 + addW).toLocaleString('vi-VN')} m³`,
          threshold: metric === 'power' ? '50.000 kWh' : metric === 'co2' ? '35.000 kg CO₂e' : '4.000 m³',
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
        // Anomaly in CURRENT PERIOD (6T Cuối năm / h2_2026 & year_2026)
        const addP = metric === 'power' ? 24500 : 0;
        const addC = metric === 'co2' ? 18500 : 0;
        const addW = metric === 'water' ? 2150 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          h2_2026: {
            powerKWh: prev.h2_2026.powerKWh + addP,
            co2Kg: prev.h2_2026.co2Kg + addC,
            waterM3: prev.h2_2026.waterM3 + addW,
          },
        }));

        // Synchronously push devices across all 3 factories over 100% for the triggered metric
        // so that Factory Comparison Chart, Ranking Table, and SCADA all turn RED in unison!
        setFactories((prev) =>
          recalculateFactoriesHierarchy(
            prev.map((f, fIdx) => ({
              ...f,
              workshops: f.workshops.map((w) => ({
                ...w,
                devices: w.devices.map((d, dIdx) => {
                  const mult = 1.24 + ((fIdx + dIdx) % 3) * 0.06; // 124% - 136%
                  return {
                    ...d,
                    readings: {
                      ...d.readings,
                      power:
                        metric === 'power' && d.readings.power
                          ? { ...d.readings.power, value: Math.round(d.readings.power.max * mult) }
                          : d.readings.power,
                      co2:
                        metric === 'co2' && d.readings.co2
                          ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * mult) }
                          : d.readings.co2,
                      water:
                        metric === 'water' && d.readings.water
                          ? { ...d.readings.water, value: Math.round(d.readings.water.max * (mult + 0.08)) }
                          : d.readings.water,
                    },
                  };
                }),
              })),
            }))
          )
        );

        const newAlert: ESGAlert = {
          id: `ALT-BOD-H2-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          factoryName: 'Tập đoàn Vinamilk (Toàn hệ thống 3 Nhà máy)',
          workshopName: 'Kỳ vận hành 6 tháng cuối năm',
          metricType: metric,
          level: 'danger',
          message: `Hệ thống SCADA Tập đoàn phát hiện sản lượng ${metric === 'power' ? 'điện' : metric === 'co2' ? 'phát thải CO₂' : 'nước'} kỳ 6 tháng cuối năm & cả năm vượt trần hạn ngạch tại cả 3 Nhà máy.`,
          value:
            metric === 'power'
              ? `${(32100 + addP).toLocaleString('vi-VN')} kWh`
              : metric === 'co2'
              ? `${(21500 + addC).toLocaleString('vi-VN')} kg CO₂e`
              : `${(2400 + addW).toLocaleString('vi-VN')} m³`,
          threshold: metric === 'power' ? '50.000 kWh' : metric === 'co2' ? '35.000 kg CO₂e' : '4.000 m³',
          status: 'new',
          scopeLevel: 'enterprise',
          targetPeriod: 'h2_2026',
          timeHorizon: 'Đánh giá tích lũy theo 6 THÁNG / NĂM',
          excessDuration: 'Vượt hạn ngạch lũy kế 6 tháng cuối năm & tổng năm 2026',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        if (isSoundEnabled) playIndustrialAlertSound();
        showToast({
          title: 'KÍCH HOẠT SỰ CỐ TOÀN TẬP ĐOÀN (KỲ LIVE)',
          message: 'Cả 3 Nhà máy, Biểu đồ so sánh, Bảng xếp hạng và KPI Kỳ hiện tại đồng loạt báo đỏ vượt ngưỡng >100%.',
          type: 'danger',
        });
      }
    } else if (role === 'factory_director') {
      if (isClosedTarget) {
        // Anomaly belongs to QUÝ III (01/07 - 30/09/2026) [CLOSED AUDIT PERIOD]
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
          message: `Biên bản kiểm toán phát hiện bổ sung mức tiêu thụ ${metric} Quý III vượt định mức tại Nhà máy Bình Dương (+${addP || addC || addW}).`,
          value:
            metric === 'power'
              ? `${(5260 + addP).toLocaleString('vi-VN')} kWh`
              : metric === 'co2'
              ? `${(2870 + addC).toLocaleString('vi-VN')} kg CO₂e`
              : `${(325 + addW).toLocaleString('vi-VN')} m³`,
          threshold: metric === 'power' ? '5.000 kWh' : metric === 'co2' ? '3.500 kg CO₂e' : '400 m³',
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
        const addP = metric === 'power' ? 2450 : 0;
        const addC = metric === 'co2' ? 1750 : 0;
        const addW = metric === 'water' ? 210 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          q4_2026: {
            powerKWh: prev.q4_2026.powerKWh + addP,
            co2Kg: prev.q4_2026.co2Kg + addC,
            waterM3: prev.q4_2026.waterM3 + addW,
          },
        }));

        // Synchronously push workshops & devices of selectedFactoryId over 100% for the triggered metric!
        setFactories((prev) =>
          recalculateFactoriesHierarchy(
            prev.map((f) =>
              f.id === selectedFactoryId
                ? {
                    ...f,
                    workshops: f.workshops.map((w, wIdx) => ({
                      ...w,
                      devices: w.devices.map((d, dIdx) => {
                        const mult = 1.25 + ((wIdx + dIdx) % 3) * 0.06; // 125% - 137%
                        return {
                          ...d,
                          readings: {
                            ...d.readings,
                            power:
                              metric === 'power' && d.readings.power
                                ? { ...d.readings.power, value: Math.round(d.readings.power.max * mult) }
                                : d.readings.power,
                            co2:
                              metric === 'co2' && d.readings.co2
                                ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * mult) }
                                : d.readings.co2,
                            water:
                              metric === 'water' && d.readings.water
                                ? { ...d.readings.water, value: Math.round(d.readings.water.max * (mult + 0.08)) }
                                : d.readings.water,
                          },
                        };
                      }),
                    })),
                  }
                : f
            )
          )
        );

        const targetFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
        const newAlert: ESGAlert = {
          id: `ALT-FACT-Q4-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          factoryName: targetFactory.name,
          workshopName: 'Toàn bộ các Phân xưởng sản xuất',
          metricType: metric,
          level: 'danger',
          message: `Hệ thống đo lường tự động phát hiện lượng tiêu thụ ${metric === 'power' ? 'điện' : metric === 'co2' ? 'phát thải CO₂' : 'nước'} Quý IV vượt định mức tại tất cả phân xưởng trực thuộc.`,
          value:
            metric === 'power'
              ? `${(3450 + addP).toLocaleString('vi-VN')} kWh`
              : metric === 'co2'
              ? `${(2320 + addC).toLocaleString('vi-VN')} kg CO₂e`
              : `${(265 + addW).toLocaleString('vi-VN')} m³`,
          threshold: metric === 'power' ? '5.000 kWh' : metric === 'co2' ? '3.500 kg CO₂e' : '400 m³',
          status: 'new',
          scopeLevel: 'factory',
          targetPeriod: 'q4_2026',
          timeHorizon: 'Đánh giá tích lũy theo QUÝ',
          excessDuration: 'Vượt định mức lũy kế Quý IV ở các phân xưởng',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        if (isSoundEnabled) playIndustrialAlertSound();
        showToast({
          title: 'KÍCH HOẠT SỰ CỐ CẤP NHÀ MÁY (QUÝ IV LIVE)',
          message: 'Các phân xưởng trực thuộc, Biểu đồ so sánh và KPI Quý IV đồng loạt vượt 100% định mức.',
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
          message: `Kiểm tra chốt chỉ số công tơ tháng 9 phát hiện bổ sung tiêu thụ vượt định mức (+${addP || addC || addW}).`,
          value:
            metric === 'power'
              ? `${520 + addP} kWh`
              : metric === 'co2'
              ? `${295 + addC} kg CO₂e`
              : `${34 + addW} m³`,
          threshold: metric === 'power' ? '500 kWh' : metric === 'co2' ? '350 kg CO₂e' : '40 m³',
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
        const addP = metric === 'power' ? 220 : 0;
        const addC = metric === 'co2' ? 165 : 0;
        const addW = metric === 'water' ? 22 : 0;

        setPeriodsData((prev) => ({
          ...prev,
          m10_2026: {
            powerKWh: prev.m10_2026.powerKWh + addP,
            co2Kg: prev.m10_2026.co2Kg + addC,
            waterM3: prev.m10_2026.waterM3 + addW,
          },
          today: {
            powerKWh: prev.today.powerKWh + Math.round(addP * 0.45),
            co2Kg: prev.today.co2Kg + Math.round(addC * 0.45),
            waterM3: prev.today.waterM3 + Math.round(addW * 0.45),
          },
        }));

        // Synchronously push key devices in selectedWorkshopId to 128% - 142% of max!
        setFactories((prev) =>
          recalculateFactoriesHierarchy(
            prev.map((f) =>
              f.id === selectedFactoryId
                ? {
                    ...f,
                    workshops: f.workshops.map((w) =>
                      w.id === selectedWorkshopId
                        ? {
                            ...w,
                            devices: w.devices.map((d, dIdx) => {
                              // Push top 3 devices into clear over-quota (128% - 142%) and others into warning/high (96%)
                              const mult = dIdx < 3 ? 1.42 - dIdx * 0.06 : 0.96;
                              return {
                                ...d,
                                readings: {
                                  ...d.readings,
                                  power:
                                    metric === 'power' && d.readings.power
                                      ? { ...d.readings.power, value: Math.round(d.readings.power.max * mult) }
                                      : d.readings.power,
                                  co2:
                                    metric === 'co2' && d.readings.co2
                                      ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * mult) }
                                      : d.readings.co2,
                                  water:
                                    metric === 'water' && d.readings.water
                                      ? { ...d.readings.water, value: Math.round(d.readings.water.max * mult) }
                                      : d.readings.water,
                                },
                              };
                            }),
                          }
                        : w
                    ),
                  }
                : f
            )
          )
        );

        const targetFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
        const targetWorkshop =
          targetFactory.workshops.find((w) => w.id === selectedWorkshopId) || targetFactory.workshops[0];
        const leadDevice = targetWorkshop.devices[0];

        const newAlert: ESGAlert = {
          id: `ALT-WS-M10-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          factoryName: targetFactory.name,
          workshopName: targetWorkshop.name,
          deviceName: leadDevice.name,
          metricType: metric,
          level: 'danger',
          message: `Cảm biến IoT ghi nhận phụ tải ${metric === 'power' ? 'điện' : metric === 'co2' ? 'phát thải CO₂' : 'nước'} tại ${leadDevice.name} vọt lên 142% định mức, kéo tổng tích lũy Tháng 10 vượt trần an toàn.`,
          value:
            metric === 'power'
              ? `${365 + addP} kWh`
              : metric === 'co2'
              ? `${240 + addC} kg CO₂e`
              : `${26 + addW} m³`,
          threshold: metric === 'power' ? '500 kWh' : metric === 'co2' ? '350 kg CO₂e' : '40 m³',
          status: 'new',
          scopeLevel: 'workshop',
          targetPeriod: 'm10_2026',
          timeHorizon: 'Đánh giá tích lũy theo THÁNG',
          excessDuration: 'Thiết bị vượt 142% công suất & tổng tháng vượt định mức',
        };

        setAlerts((prev) => [newAlert, ...prev]);
        if (isSoundEnabled) playIndustrialAlertSound();
        showToast({
          title: 'KÍCH HOẠT SỰ CỐ CẤP BỘ PHẬN (THÁNG 10 LIVE)',
          message: 'Thiết bị đầu bảng (142%), Biểu đồ so sánh 150%, Bảng xếp hạng và KPI Tháng 10 đồng loạt báo đỏ!',
          type: 'danger',
        });
      }
    }
  };

  // Resolve Alert:
  // Strictly preserves historical consumption (Never alters past records!).
  // Establishes a CAPA resolution and stabilizes current instantaneous device readings.
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
    // and recalculate workshop/factory hierarchy while keeping cumulative historical records unchanged.
    setFactories((prev) =>
      recalculateFactoriesHierarchy(
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
      )
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

  // ============================================================================
  // 6 ROLE-TIERED INDUSTRIAL SCENARIOS (RBAC + Technical Theory + Full UX/UI Sync)
  // ============================================================================
  const applyPresetScenario = (scenario: PresetScenarioId) => {
    setActiveScenario(scenario);
    const nowFull = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (scenario === 'boiler_anomaly') {
      // [CẤP 3 - TRƯỞNG BỘ PHẬN / PHÂN XƯỞNG]
      // Lý thuyết kỹ thuật: Độ ẩm trấu ép cao gây nghẹt ghi lò hơi Biomass, sụt áp suất hơi bão hòa
      // buộc hệ thống đốt bù dầu DO/FO và bật gia nhiệt điện trở phụ tại cụm Máy tiệt trùng UHT #01, #02 & Đồng hóa.
      setRoleState('workshop_lead');
      setTimePeriod('m10_2026');
      setSelectedFactoryId('nm-vnm-bd');
      setSelectedWorkshopId('px-che-bien');
      setViewLevel('workshop');

      setFactories((prev) =>
        recalculateFactoriesHierarchy(
          prev.map((f) =>
            f.id === 'nm-vnm-bd'
              ? {
                  ...f,
                  workshops: f.workshops.map((w) => {
                    if (w.id === 'px-che-bien') {
                      return {
                        ...w,
                        devices: w.devices.map((d) => {
                          if (d.id === 'tb-uht-01') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 1.35) } : undefined,
                                co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 1.42) } : undefined,
                              },
                            };
                          }
                          if (d.id === 'tb-uht-02') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 1.26) } : undefined,
                                co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 1.34) } : undefined,
                              },
                            };
                          }
                          if (d.id === 'tb-dong-hoa') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 1.18) } : undefined,
                                co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 1.25) } : undefined,
                              },
                            };
                          }
                          return d;
                        }),
                      };
                    }
                    if (w.id === 'px-nang-luong') {
                      return {
                        ...w,
                        devices: w.devices.map((d) =>
                          d.id === 'tb-lo-hoi'
                            ? {
                                ...d,
                                readings: {
                                  ...d.readings,
                                  power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 1.32) } : undefined,
                                  co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 1.45) } : undefined,
                                },
                              }
                            : d
                        ),
                      };
                    }
                    return w;
                  }),
                }
              : f
          )
        )
      );

      // Đồng bộ kỳ hiện tại cấp Bộ phận (Tháng 10 & Ca hôm nay vượt ngưỡng > 118% - 127%)
      setPeriodsData((prev) => ({
        ...prev,
        m10_2026: {
          ...prev.m10_2026,
          powerKWh: 590, // 118% của 500 kWh
          co2Kg: 448, // 128% của 350 kg
        },
        today: {
          ...prev.today,
          powerKWh: 238, // 119% của 200 kWh
          co2Kg: 184, // 131% của 140 kg
        },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-BOILER-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'PX Chế biến sữa tiệt trùng',
        deviceName: 'Máy tiệt trùng UHT #01, #02 & Lò hơi Biomass',
        metricType: 'co2',
        level: 'danger',
        message: 'Nghẹt ghi lò hơi Biomass gây sụt áp hơi, buộc bật đốt bù dầu FO & điện trở phụ UHT: Phát thải CO₂ thiết bị vọt lên 142% và tích lũy Tháng 10 vượt định mức (448 / 350 kg).',
        value: '448 kg CO₂e (128%)',
        threshold: '350 kg CO₂e',
        status: 'new',
        scopeLevel: 'workshop',
        targetPeriod: 'm10_2026',
        timeHorizon: 'Đánh giá tích lũy theo THÁNG (Cấp Bộ phận)',
        excessDuration: '3 thiết bị vượt ngưỡng 125%–142% • Tổng tháng vượt 128%',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: '[CẤP BỘ PHẬN] SỰ CỐ LÒ HƠI & QUÁ NHIỆT UHT',
        message: 'Đã chuyển sang góc nhìn Trưởng bộ phận (Tháng 10): Thiết bị UHT #01/#02 (142%), PX Chế biến và KPI Tháng 10 đồng loạt báo đỏ vượt ngưỡng!',
        type: 'danger',
      });
    } else if (scenario === 'pipe_burst') {
      // [CẤP 3 - TRƯỞNG BỘ PHẬN / PHÂN XƯỞNG]
      // Lý thuyết kỹ thuật: Bục gioăng cao su chịu nhiệt EPDM đường ống CIP tự động & kẹt van xả đáy bồn phối trộn,
      // làm lưu lượng nước RO súc rửa và nước thải tràn về Trạm XLNT vượt ngưỡng thiết kế.
      setRoleState('workshop_lead');
      setTimePeriod('m10_2026');
      setSelectedFactoryId('nm-vnm-bd');
      setSelectedWorkshopId('px-che-bien');
      setViewLevel('workshop');

      setFactories((prev) =>
        recalculateFactoriesHierarchy(
          prev.map((f) =>
            f.id === 'nm-vnm-bd'
              ? {
                  ...f,
                  workshops: f.workshops.map((w) => {
                    if (w.id === 'px-che-bien') {
                      return {
                        ...w,
                        devices: w.devices.map((d) => {
                          if (d.id === 'tb-cip-clean') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.46) } : undefined,
                                power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 1.18) } : undefined,
                              },
                            };
                          }
                          if (d.id === 'tb-bon-tron') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.38) } : undefined,
                              },
                            };
                          }
                          if (d.id === 'tb-uht-01') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.29) } : undefined,
                              },
                            };
                          }
                          if (d.id === 'tb-uht-02') {
                            return {
                              ...d,
                              readings: {
                                ...d.readings,
                                water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.16) } : undefined,
                              },
                            };
                          }
                          return d;
                        }),
                      };
                    }
                    if (w.id === 'px-nang-luong') {
                      return {
                        ...w,
                        devices: w.devices.map((d) =>
                          d.id === 'tb-xlnt-hieu-khi'
                            ? {
                                ...d,
                                readings: {
                                  ...d.readings,
                                  water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.42) } : undefined,
                                },
                              }
                            : d
                        ),
                      };
                    }
                    return w;
                  }),
                }
              : f
          )
        )
      );

      setPeriodsData((prev) => ({
        ...prev,
        m10_2026: {
          ...prev.m10_2026,
          waterM3: 55, // 137.5% của định mức 40 m3
        },
        today: {
          ...prev.today,
          waterM3: 22.5, // 140.6% của định mức ca 16 m3
        },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-PIPE-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'PX Chế biến sữa tiệt trùng',
        deviceName: 'Hệ thống CIP tự động & Bồn phối trộn 5000L',
        metricType: 'water',
        level: 'danger',
        message: 'Bục gioăng áp lực EPDM đường ống CIP & kẹt van xả bồn phối trộn: Lưu lượng nước tại CIP vọt lên 146% định mức, kéo tổng nước Tháng 10 vượt trần (55 / 40 m³).',
        value: '55 m³ (137.5%)',
        threshold: '40 m³',
        status: 'new',
        scopeLevel: 'workshop',
        targetPeriod: 'm10_2026',
        timeHorizon: 'Đánh giá tích lũy theo THÁNG (Cấp Bộ phận)',
        excessDuration: 'Thiết bị CIP vượt 146% • Tổng nước phân xưởng & tháng vượt 137%',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: '[CẤP BỘ PHẬN] BỤC VAN ÁP LỰC ĐƯỜNG ỐNG CIP',
        message: 'Đã chuyển sang góc nhìn Trưởng bộ phận (Tháng 10): Hệ thống CIP (146% Nước), Bồn trộn (138%) và KPI Nước Tháng 10 đồng loạt báo đỏ!',
        type: 'danger',
      });
    } else if (scenario === 'peak_production') {
      // [CẤP 2 - QUẢN ĐỐC NHÀ MÁY]
      // Lý thuyết kỹ thuật: Chồng lấn phụ tải đỉnh cả 3 phân xưởng (Chế biến + Đóng gói + Năng lượng)
      // cùng vận hành 100% dây chuyền vào khung Giờ Cao điểm EVN (3.250 đ/kWh), làm tổng công suất
      // từng phân xưởng (>2.500 kWh) và tổng Quý IV của Nhà máy Bình Dương (>5.000 kWh) vượt ngưỡng đỏ.
      setRoleState('factory_director');
      setTimePeriod('q4_2026');
      setSelectedFactoryId('nm-vnm-bd');
      setViewLevel('factory');
      setEvnTariffPeriod('peak');

      setFactories((prev) =>
        recalculateFactoriesHierarchy(
          prev.map((f) =>
            f.id === 'nm-vnm-bd'
              ? {
                  ...f,
                  workshops: f.workshops.map((w, wIdx) => ({
                    ...w,
                    devices: w.devices.map((d, dIdx) => {
                      const pMult = 1.18 + ((wIdx + dIdx) % 3) * 0.07; // 118% - 132%
                      const cMult = 1.16 + ((wIdx + dIdx) % 3) * 0.06; // 116% - 128%
                      return {
                        ...d,
                        readings: {
                          ...d.readings,
                          power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * pMult) } : undefined,
                          co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * cMult) } : undefined,
                          water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 1.12) } : undefined,
                        },
                      };
                    }),
                  })),
                }
              : f
          )
        )
      );

      setPeriodsData((prev) => ({
        ...prev,
        q4_2026: {
          ...prev.q4_2026,
          powerKWh: 6150, // 123% của định mức Quý 5.000 kWh
          co2Kg: 4220, // 120.5% của định mức Quý 3.500 kg
          waterM3: 435, // 108.7% của định mức Quý 400 m3
        },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-PEAK-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'Toàn bộ 3 Phân xưởng (Chế biến, Đóng gói, Năng lượng)',
        deviceName: 'Trạm Biến áp Tổng & Cụm Dây chuyền UHT - Chiết rót - Chiller',
        metricType: 'power',
        level: 'danger',
        message: 'Chồng lấn phụ tải đỉnh cả 3 phân xưởng vào khung Giờ Cao điểm EVN (3.250 đ/kWh): Cả 3 phân xưởng đều vượt ngưỡng 2.500 kWh, đẩy lũy kế Quý IV Nhà máy vượt 123% định mức.',
        value: '6.150 kWh (123%)',
        threshold: '5.000 kWh',
        status: 'new',
        scopeLevel: 'factory',
        targetPeriod: 'q4_2026',
        timeHorizon: 'Đánh giá tích lũy theo QUÝ (Cấp Nhà máy)',
        excessDuration: '3/3 Phân xưởng vượt ngưỡng • Trùng giờ cao điểm EVN 3.250 đ/kWh',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: '[CẤP NHÀ MÁY] CHỒNG LẤN PHỤ TẢI ĐỈNH 3 PHÂN XƯỞNG',
        message: 'Đã chuyển sang góc nhìn Quản đốc Nhà máy (Quý IV): Cả 3 Phân xưởng, Biểu đồ so sánh và KPI Quý IV đồng loạt vượt ngưỡng >120%!',
        type: 'danger',
      });
    } else if (scenario === 'grid_brownout') {
      // [CẤP 2 - QUẢN ĐỐC NHÀ MÁY]
      // Lý thuyết kỹ thuật: Mưa bão diện rộng tại KCN Mỹ Phước làm suy giảm 85% công suất Solar Rooftop,
      // buộc Trạm biến áp đóng lấy 100% điện lưới EVN giờ cao điểm (hệ số phát thải 0.72 kg CO2/kWh)
      // kết hợp tăng tải Lò hơi & Chiller hút ẩm, đẩy phát thải CO2 và Điện Quý IV vượt ngưỡng.
      setRoleState('factory_director');
      setTimePeriod('q4_2026');
      setSelectedFactoryId('nm-vnm-bd');
      setViewLevel('factory');
      setWeatherCondition('rainy');
      setEvnTariffPeriod('peak');

      setFactories((prev) =>
        recalculateFactoriesHierarchy(
          prev.map((f) =>
            f.id === 'nm-vnm-bd'
              ? {
                  ...f,
                  workshops: f.workshops.map((w) => ({
                    ...w,
                    devices: w.devices.map((d, dIdx) => {
                      const cMult = 1.24 + (dIdx % 3) * 0.06; // 124% - 136%
                      const pMult = 1.15 + (dIdx % 3) * 0.05; // 115% - 125%
                      return {
                        ...d,
                        readings: {
                          ...d.readings,
                          co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * cMult) } : undefined,
                          power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * pMult) } : undefined,
                        },
                      };
                    }),
                  })),
                }
              : f
          )
        )
      );

      setPeriodsData((prev) => ({
        ...prev,
        q4_2026: {
          ...prev.q4_2026,
          powerKWh: 5680, // 113.6% định mức Quý 5.000 kWh
          co2Kg: 4340, // 124% định mức Quý 3.500 kg
        },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-EVN-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Nhà máy sữa Việt Nam (Bình Dương)',
        workshopName: 'Trạm Biến áp 22kV & PX Năng lượng - Chế biến',
        deviceName: 'Hệ thống Hòa lưới Solar 5.4 MWp & Công tơ Tổng EVN',
        metricType: 'co2',
        level: 'danger',
        message: 'Mưa bão làm suy giảm 85% điện mặt trời (còn 3.2% cơ cấu), buộc đóng bù điện lưới EVN giờ cao điểm (0.72 kg CO₂/kWh): Phát thải CO₂ Quý IV Nhà máy vọt lên 124% định mức.',
        value: '4.340 kg CO₂e (124%)',
        threshold: '3.500 kg CO₂e',
        status: 'new',
        scopeLevel: 'factory',
        targetPeriod: 'q4_2026',
        timeHorizon: 'Đánh giá tích lũy theo QUÝ (Cấp Nhà máy)',
        excessDuration: 'Sụt áp Solar do mưa bão • Phát thải Scope 2 vượt ngưỡng Quý IV',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: '[CẤP NHÀ MÁY] MƯA BÃO SỤT ÁP SOLAR — BÙ LƯỚI EVN',
        message: 'Tỷ trọng Solar giảm còn 3.2%, Lưới EVN tăng lên 80.5%. Phát thải CO₂ và Điện các phân xưởng & Quý IV đồng loạt báo đỏ!',
        type: 'danger',
      });
    } else if (scenario === 'solar_peak') {
      // [CẤP 1 - BAN GIÁM ĐỐC TẬP ĐOÀN]
      // Lý thuyết kỹ thuật: Chiến dịch tăng tốc đơn hàng xuất khẩu cuối năm trên toàn tổ hợp 3 Nhà máy
      // (Bình Dương, Mega Dairy, Thống Nhất) chạy tối đa 3 ca/ngày, khiến cả 3 nhà máy đều vượt định mức
      // và đẩy tổng tiêu thụ Bán niên 2 (h2_2026) & Cả năm (year_2026) vượt trần hạn ngạch Tập đoàn.
      setRoleState('bod');
      setTimePeriod('year_2026');
      setViewLevel('enterprise');
      setEvnTariffPeriod('peak');

      setFactories((prev) =>
        recalculateFactoriesHierarchy(
          prev.map((f, fIdx) => ({
            ...f,
            workshops: f.workshops.map((w, wIdx) => ({
              ...w,
              devices: w.devices.map((d, dIdx) => {
                const mult = 1.22 + ((fIdx + wIdx + dIdx) % 3) * 0.06; // 122% - 134%
                return {
                  ...d,
                  readings: {
                    ...d.readings,
                    power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * mult) } : undefined,
                    co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * mult) } : undefined,
                    water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * (mult + 0.05)) } : undefined,
                  },
                };
              }),
            })),
          }))
        )
      );

      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: {
          powerKWh: 58400, // 116.8% của định mức 6T 50.000 kWh -> Tổng năm = 110.880 / 100.000 (110.9%)
          co2Kg: 42200, // 120.6% của định mức 6T 35.000 kg -> Tổng năm = 72.300 / 70.000 (103.3%)
          waterM3: 4720, // 118% của định mức 6T 4.000 m3 -> Tổng năm = 8.170 / 8.000 (102.1%)
        },
        q4_2026: {
          powerKWh: 6320,
          co2Kg: 4410,
          waterM3: 465,
        },
        m10_2026: {
          powerKWh: 615,
          co2Kg: 455,
          waterM3: 52,
        },
      }));

      const newAlert: ESGAlert = {
        id: `ALT-CORP-SURGE-${Date.now().toString().slice(-4)}`,
        timestamp: nowFull,
        factoryName: 'Tập đoàn Vinamilk (Toàn bộ 3 Nhà máy)',
        workshopName: 'Bình Dương • Mega Dairy • Thống Nhất',
        deviceName: 'Toàn bộ Dây chuyền Chế biến & Đóng gói Xuất khẩu',
        metricType: 'power',
        level: 'danger',
        message: 'Chiến dịch tăng ca đơn hàng xuất khẩu cuối năm tại cả 3 Nhà máy làm tổng tiêu thụ Điện (110.880 kWh), CO₂ (72.300 kg) và Nước (8.170 m³) vượt trần hạn ngạch năm 2026 toàn Tập đoàn.',
        value: '110.880 kWh (110.9%)',
        threshold: '100.000 kWh / năm',
        status: 'new',
        scopeLevel: 'enterprise',
        targetPeriod: 'year_2026',
        timeHorizon: 'Đánh giá tích lũy theo 6 THÁNG / NĂM (Ban Giám đốc)',
        excessDuration: 'Cả 3/3 Nhà máy vượt định mức • Cần trích lập dự phòng tín chỉ Carbon TK 642',
      };
      setAlerts((prev) => [newAlert, ...prev]);

      if (isSoundEnabled) playIndustrialAlertSound();

      showToast({
        title: '[CẤP TẬP ĐOÀN] TĂNG TỐC XUẤT KHẨU — VƯỢT HẠN NGẠCH 3 NHÀ MÁY',
        message: 'Đã chuyển sang góc nhìn Ban Giám đốc: Cả 3 Nhà máy, 3 Thẻ KPI (Điện, CO₂, Nước), Biểu đồ xu hướng và Bảng xếp hạng đồng loạt báo đỏ!',
        type: 'danger',
      });
    } else if (scenario === 'eco_green') {
      // [CẤP 1 - BAN GIÁM ĐỐC TẬP ĐOÀN & TOÀN HỆ THỐNG]
      // Lý thuyết kỹ thuật: Kích hoạt Điều độ Xanh RE100 Toàn diện: Huy động 100% Solar Rooftop 5.4 MWp,
      // tối ưu hóa lò hơi Biomass trấu ép, thu hồi nhiệt UHT 90% và dịch chuyển phụ tải kho lạnh AS/RS sang giờ thấp điểm đêm.
      setFactories((prev) =>
        recalculateFactoriesHierarchy(
          prev.map((f) => ({
            ...f,
            workshops: f.workshops.map((w) => ({
              ...w,
              devices: w.devices.map((d) => ({
                ...d,
                readings: {
                  power: d.readings.power ? { ...d.readings.power, value: Math.round(d.readings.power.max * 0.62) } : undefined,
                  co2: d.readings.co2 ? { ...d.readings.co2, value: Math.round(d.readings.co2.max * 0.56) } : undefined,
                  water: d.readings.water ? { ...d.readings.water, value: Math.round(d.readings.water.max * 0.6) } : undefined,
                },
                status: 'normal' as const,
              })),
            })),
          }))
        )
      );

      // Đưa các kỳ ĐANG MỞ (Live) về vùng xanh tối ưu (60% - 68%), giữ nguyên các kỳ đã đóng sổ!
      setPeriodsData((prev) => ({
        ...prev,
        h2_2026: { powerKWh: 29800, co2Kg: 18900, waterM3: 2180 },
        q4_2026: { powerKWh: 3120, co2Kg: 1980, waterM3: 225 },
        m10_2026: { powerKWh: 315, co2Kg: 195, waterM3: 22 },
        today: { powerKWh: 122, co2Kg: 76, waterM3: 9.2 },
      }));

      setEvnTariffPeriod('offpeak');
      setWeatherCondition('sunny');

      showToast({
        title: '[TOÀN HỆ THỐNG] KÍCH HOẠT ĐIỀU ĐỘ XANH RE100 TOÀN DIỆN',
        message: 'Tỷ trọng Năng lượng Xanh đạt 42.5% (vượt mục tiêu 40%). Toàn bộ thiết bị, phân xưởng và 3 nhà máy trở về vùng Xanh tối ưu!',
        type: 'success',
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
