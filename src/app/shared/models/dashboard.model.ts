export interface DashboardStats {
  todayAppointments: number;
  totalCustomers: number;
  upcomingAppointments: number;
  monthlyRevenue: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}