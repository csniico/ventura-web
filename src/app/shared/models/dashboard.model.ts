// Dashboard models - matching backend IDashboardSummaryResponse

export interface TrendIndicator {
  percentage: number;
  direction: 'up' | 'down';
}

export interface TaxBreakdown {
  vat: { rate: number; amount: number };
  nhil: { rate: number; amount: number };
  getfund: { rate: number; amount: number };
}

export interface FinancialSummary {
  totalRevenue: { amount: number; trend: TrendIndicator };
  netRevenue: { amount: number; afterTaxes: boolean };
  totalTax: { amount: number; breakdown: TaxBreakdown };
  unpaidInvoices: { amount: number; count: number };
}

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalInvoices: number;
}

export interface PendingOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  createdAt: string;
}

export interface OutOfStockProduct {
  id: string;
  name: string;
  lastSoldDate: string | null;
  demandScore: number;
}

export interface OverdueInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface DashboardAlerts {
  pendingOrders: { count: number; items: PendingOrderItem[] };
  outOfStockProducts: { count: number; items: OutOfStockProduct[] };
  overdueInvoices: { count: number; items: OverdueInvoiceItem[] };
}

export interface TopSellingProduct {
  id: string;
  name: string;
  primaryImage: string | null;
  totalRevenue: number;
  totalQuantitySold: number;
  totalOrders: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface TopPerformers {
  topSellingProducts: TopSellingProduct[];
  topCustomers: TopCustomer[];
}

export type ActivityType =
  | 'order_completed'
  | 'order_cancelled'
  | 'invoice_paid'
  | 'invoice_created'
  | 'invoice_overdue'
  | 'invoice_cancelled'
  | 'product_out_of_stock'
  | 'product_low_stock'
  | 'new_customer'
  | 'new_order';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface CancelledOrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CancelledInvoiceMapping {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  orderId: string | null;
  orderNumber: string | null;
  products: CancelledOrderProduct[];
  cancelledAt: string;
  reason: string | null;
}

export interface Cancellations {
  cancelledOrders: {
    total: number;
    totalRevenueLost: number;
    byReason: Array<{ reason: string; count: number; amount: number }>;
  };
  cancelledInvoices: {
    total: number;
    totalRevenueLost: number;
    mappings: CancelledInvoiceMapping[];
  };
}

// ---------------------------------------------------------------------------
// Dashboard summary — matches GET /dashboard/summary on the new backend
// (mirrors the mobile app). The interfaces above are retained for any legacy
// consumers but are no longer part of the live summary.
// ---------------------------------------------------------------------------

/** Headline revenue figures + trend vs the previous 30 days. */
export interface DashboardRevenue {
  total: number;
  last30Days: number;
  previous30Days: number;
  /** Percentage change vs previous 30 days; null when not computable. */
  trendPercent: number | null;
}

export interface DashboardTopProduct {
  resourceId: string;
  name: string;
  unitsSold: number;
}

/** Inventory health: low-stock count + best sellers. */
export interface DashboardInventory {
  lowStockCount: number;
  topProducts: DashboardTopProduct[];
}

/** Compact invoice row for the recent-invoices list. */
export interface DashboardRecentInvoice {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
}

/** A single day's revenue point for the chart. */
export interface DashboardDailyRevenuePoint {
  date: string;
  amount: number;
}

export interface DashboardSummary {
  revenue: DashboardRevenue;
  inventory: DashboardInventory;
  recentInvoices: DashboardRecentInvoice[];
  dailyRevenue: DashboardDailyRevenuePoint[];
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}
