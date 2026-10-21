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
} from '@/types/esg';
import { INITIAL_VINAMILK_DATA, INITIAL_ALERTS, ROLE_THRESHOLD_CONFIGS } from '@/data/vinamilk-mock';

interface ToastNotice {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
}

interface ESGSimulationContextType {
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
  triggerAnomaly: (metric: MetricType) => void;
  resetSimulation: () => void;
  resolveAlert: (alertId: string, payload?: AlertResolutionPayload) => void;

  // Unit Preferences & Time Filter
  unitPreferences: UnitPreferences;
  toggleUnit: (metric: MetricType) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;

  // Toast
  toast: ToastNotice | null;
  dismissToast: () => void;

  // Calculated Totals based on current scope
  scopedTotals: {
    powerKWh: number;
    co2Kg: number;
    waterM3: number;
    deviceCount: number;
    alertCount: number;
  };
}

const ESGSimulationContext = createContext<ESGSimulationContextType | undefined>(undefined);

export const ESGSimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('bod');
  const [factories, setFactories] = useState<FactoryItem[]>(INITIAL_VINAMILK_DATA);
  const [alerts, setAlerts] = useState<ESGAlert[]>(INITIAL_ALERTS);

  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('nm-vnm-bd');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('px-che-bien');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<RealtimeViewLevel>('enterprise');

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

  // Default timePeriod according to initial role 'bod' is 'year'
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('year');
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const currentRoleConfig = ROLE_THRESHOLD_CONFIGS[role];

  const showToast = useCallback((notice: Omit<ToastNotice, 'id'>) => {
    const id = Date.now().toString();
    setToast({ ...notice, id });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

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

  // Realtime Simulation Loop
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

              // Determine device status
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

            const wsStatus: 'normal' | 'warning' | 'danger' = hasDanger ? 'danger' : hasWarning ? 'warning' : 'normal';

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

          const factStatus: 'normal' | 'warning' | 'danger' = updatedWorkshops.some((w) => w.status === 'danger')
            ? 'danger'
            : updatedWorkshops.some((w) => w.status === 'warning')
            ? 'warning'
            : 'normal';

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

      setLastUpdated(new Date());
    }, streamInterval);

    return () => clearInterval(timer);
  }, [isLiveStreaming, streamInterval, fluctuationLevel]);

  // Inject Anomaly dynamically tailored to current Role and Hierarchical Threshold!
  const triggerAnomaly = (metric: MetricType) => {
    let affectedDevName = '';
    let affectedWorkshopName = '';
    let affectedFactoryName = '';
    let alertMsg = '';
    let valStr = '';
    let threshStr = '';
    let timeHorizonStr = '';
    let excessDurationStr = '';
    let scopeLvl: 'enterprise' | 'factory' | 'workshop' = 'workshop';

    const cfg = ROLE_THRESHOLD_CONFIGS[role];

    if (role === 'bod') {
      // Enterprise scale anomaly (> 50.000 kWh, 6 months / 1 year horizon)
      scopeLvl = 'enterprise';
      timeHorizonStr = 'Đánh giá tích lũy theo 6 THÁNG';
      excessDurationStr = 'Quá định mức liên tục 6 tháng đầu năm của toàn tập đoàn';
      affectedFactoryName = 'Tập đoàn Vinamilk (Toàn hệ thống)';
      affectedWorkshopName = 'Tổng hợp 3 Nhà máy';

      if (metric === 'power') {
        const overVal = Math.round(cfg.thresholds.powerDanger * 1.08); // e.g. 54.000 kWh
        valStr = `${overVal.toLocaleString('vi-VN')} kWh`;
        threshStr = `${cfg.thresholds.powerDanger.toLocaleString('vi-VN')} kWh`;
        alertMsg = `Hệ thống đo lường tự động phát hiện tổng điện năng tích lũy 6 tháng vượt định mức ${threshStr} (Đo lường: ${valStr})`;
      } else if (metric === 'co2') {
        const overVal = Math.round(cfg.thresholds.co2Danger * 1.09); // e.g. 38.150 kg
        valStr = `${overVal.toLocaleString('vi-VN')} kg CO₂e`;
        threshStr = `${cfg.thresholds.co2Danger.toLocaleString('vi-VN')} kg CO₂e`;
        alertMsg = `Cảm biến phân tích khí thải ghi nhận tổng lượng CO₂ tích lũy vượt hạn ngạch ${threshStr} (Đo lường: ${valStr})`;
      } else {
        const overVal = Math.round(cfg.thresholds.waterDanger * 1.12);
        valStr = `${overVal.toLocaleString('vi-VN')} m³`;
        threshStr = `${cfg.thresholds.waterDanger.toLocaleString('vi-VN')} m³`;
        alertMsg = `Trạm quan trắc tự động ghi nhận lưu lượng nước xả 6 tháng vượt định mức ${threshStr} (Đo lường: ${valStr})`;
      }
    } else if (role === 'factory_director') {
      // Factory scale anomaly (> 5.000 kWh, quarter horizon)
      scopeLvl = 'factory';
      timeHorizonStr = 'Đánh giá tích lũy theo QUÝ';
      excessDurationStr = 'Vượt định mức lũy kế Quý III/2026';
      const targetFact = factories.find((f) => f.id === selectedFactoryId) || factories[0];
      affectedFactoryName = targetFact.name;
      affectedWorkshopName = 'Toàn bộ các phân xưởng';

      if (metric === 'power') {
        const overVal = Math.round(cfg.thresholds.powerDanger * 1.08); // e.g. 5.400 kWh
        valStr = `${overVal.toLocaleString('vi-VN')} kWh`;
        threshStr = `${cfg.thresholds.powerDanger.toLocaleString('vi-VN')} kWh`;
        alertMsg = `Hệ thống giám sát nhà máy phát hiện lượng tiêu thụ điện Quý III vượt định mức ${threshStr} (Đo lường: ${valStr})`;
      } else if (metric === 'co2') {
        const overVal = Math.round(cfg.thresholds.co2Danger * 1.1);
        valStr = `${overVal.toLocaleString('vi-VN')} kg CO₂e`;
        threshStr = `${cfg.thresholds.co2Danger.toLocaleString('vi-VN')} kg CO₂e`;
        alertMsg = `Cảm biến khói lò hơi ghi nhận phát thải CO₂ tích lũy Quý III vượt hạn ngạch ${threshStr} (Đo lường: ${valStr})`;
      } else {
        const overVal = Math.round(cfg.thresholds.waterDanger * 1.15);
        valStr = `${overVal.toLocaleString('vi-VN')} m³`;
        threshStr = `${cfg.thresholds.waterDanger.toLocaleString('vi-VN')} m³`;
        alertMsg = `Đồng hồ quan trắc nước thải ghi nhận lưu lượng xả Quý III vượt công suất trạm MBR ${threshStr} (Đo lường: ${valStr})`;
      }
    } else {
      // Workshop scale anomaly (> 500 kWh, month horizon)
      scopeLvl = 'workshop';
      timeHorizonStr = 'Đánh giá tích lũy theo THÁNG';
      excessDurationStr = 'Quá định mức bình quân tháng 10 (30 ngày)';
      const targetFact = factories.find((f) => f.id === selectedFactoryId) || factories[0];
      const targetWs = targetFact.workshops.find((w) => w.id === selectedWorkshopId) || targetFact.workshops[0];
      const dev = targetWs.devices.find((d) => d.metrics.includes(metric)) || targetWs.devices[0];

      affectedFactoryName = targetFact.name;
      affectedWorkshopName = targetWs.name;
      affectedDevName = dev.name;

      if (metric === 'power') {
        const overVal = 545; // > 500 kWh
        valStr = `${overVal} kWh`;
        threshStr = `500 kWh`;
        alertMsg = `Hệ thống cảm biến IoT ghi nhận tiêu thụ điện tích lũy tháng vượt định mức ${threshStr} tại ${dev.name} (Đo lường: ${valStr})`;
      } else if (metric === 'co2') {
        const overVal = 385; // > 350 kg
        valStr = `${overVal} kg CO₂e`;
        threshStr = `350 kg CO₂e`;
        alertMsg = `Cảm biến khí thải ghi nhận phát thải tích lũy tháng vượt định mức ${threshStr} tại ${dev.name} (Đo lường: ${valStr})`;
      } else {
        const overVal = 46; // > 40 m3
        valStr = `${overVal} m³`;
        threshStr = `40 m³`;
        alertMsg = `Cảm biến lưu lượng ghi nhận nước xả tích lũy tháng vượt hạn ngạch ${threshStr} tại ${dev.name} (Đo lường: ${valStr})`;
      }
    }

    const newAlert: ESGAlert = {
      id: `ALT-LIVE-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      factoryName: affectedFactoryName,
      workshopName: affectedWorkshopName,
      deviceName: affectedDevName,
      metricType: metric,
      level: 'danger',
      message: alertMsg,
      value: valStr,
      threshold: threshStr,
      status: 'new',
      scopeLevel: scopeLvl,
      timeHorizon: timeHorizonStr,
      excessDuration: excessDurationStr,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    showToast({
      title: `CẢNH BÁO ${cfg.roleLabel.toUpperCase()}!`,
      message: `${timeHorizonStr}: ${alertMsg}`,
      type: 'danger',
    });
  };

  const resolveAlert = (alertId: string, payload?: AlertResolutionPayload) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const nowFull = `${timeStr} ${dateStr}`;

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          status: 'resolved' as const,
          rootCause: payload?.rootCause || 'Đã kiểm tra kỹ thuật tại hiện trường và điều chỉnh phụ tải.',
          resolution: payload?.resolution || 'Đã khắc phục hoàn tất và đưa thiết bị về chế độ tiết kiệm năng lượng.',
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
    showToast({
      title: 'Đã hoàn tất lập biên bản xử lý',
      message: `Hồ sơ sự cố ${alertId} đã được phê duyệt nguyên nhân và phương án khắc phục.`,
      type: 'success',
    });
  };

  const resetSimulation = () => {
    setFactories(INITIAL_VINAMILK_DATA);
    setAlerts(INITIAL_ALERTS);
    showToast({
      title: 'Thiết lập lại mô phỏng',
      message: 'Toàn bộ chỉ số năng lượng & phát thải đã được hoàn trả về thông số ban đầu.',
      type: 'info',
    });
  };

  // Filter alerts by role scope
  const getRoleFilteredAlerts = () => {
    if (role === 'bod') {
      // BOD sees enterprise and factory level alerts
      return alerts.filter((a) => a.scopeLevel === 'enterprise' || a.scopeLevel === 'factory');
    }
    if (role === 'factory_director') {
      // Factory director sees factory level alerts and workshop alerts for this factory
      return alerts.filter(
        (a) => a.scopeLevel === 'factory' || (a.scopeLevel === 'workshop' && a.factoryName.includes('Bình Dương'))
      );
    }
    // Workshop lead sees workshop level alerts
    return alerts.filter((a) => a.scopeLevel === 'workshop');
  };

  // Compute Scoped Totals based on Current Role
  const calculateScopedTotals = () => {
    let powerKWh = 0;
    let co2Kg = 0;
    let waterM3 = 0;
    let deviceCount = 0;

    if (role === 'bod') {
      factories.forEach((f) => {
        powerKWh += f.totals.powerKWh;
        co2Kg += f.totals.co2Kg;
        waterM3 += f.totals.waterM3;
        f.workshops.forEach((w) => {
          deviceCount += w.devices.length;
        });
      });
    } else if (role === 'factory_director') {
      const targetFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
      powerKWh = targetFactory.totals.powerKWh;
      co2Kg = targetFactory.totals.co2Kg;
      waterM3 = targetFactory.totals.waterM3;
      targetFactory.workshops.forEach((w) => {
        deviceCount += w.devices.length;
      });
    } else {
      const targetFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
      const targetWorkshop = targetFactory.workshops.find((w) => w.id === selectedWorkshopId) || targetFactory.workshops[0];
      powerKWh = targetWorkshop.totals.powerKWh;
      co2Kg = targetWorkshop.totals.co2Kg;
      waterM3 = targetWorkshop.totals.waterM3;
      deviceCount = targetWorkshop.devices.length;
    }

    const roleAlerts = getRoleFilteredAlerts();
    const activeAlerts = roleAlerts.filter((a) => a.status !== 'resolved');

    return {
      powerKWh,
      co2Kg,
      waterM3,
      deviceCount,
      alertCount: activeAlerts.length,
    };
  };

  return (
    <ESGSimulationContext.Provider
      value={{
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
