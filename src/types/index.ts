export interface NavItemType {
  id: string;
  title: string;
  iconName: string;
  badge?: string;
  isDraft?: boolean;
}

export interface NavGroupType {
  title: string;
  items: NavItemType[];
}

export interface AmisAppType {
  id: string;
  name: string;
  icon: string;
  colorGradient: string;
  description?: string;
}

export interface StatItemType {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  icon: string;
  iconBg: string;
  iconColor: string;
}
