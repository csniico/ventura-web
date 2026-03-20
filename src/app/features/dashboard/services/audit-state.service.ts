import { Injectable, computed, signal } from '@angular/core';
import {
  AuditLog,
  AuditAction,
  AuditEntityType,
} from '../../../core/models/audit.model';

export type AuditTab = 'all' | 'entity' | 'user' | 'action';

interface AuditFilters {
  searchQuery: string;
  entityType: AuditEntityType | null;
  action: AuditAction | null;
  sortOrder: 'asc' | 'desc';
  startDate: string | null;
  endDate: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuditStateService {
  // Audit logs state
  private readonly _logs = signal<AuditLog[]>([]);
  private readonly _logsLoading = signal(false);

  // UI state
  private readonly _activeTab = signal<AuditTab>('all');
  private readonly _filters = signal<AuditFilters>({
    searchQuery: '',
    entityType: null,
    action: null,
    sortOrder: 'desc',
    startDate: null,
    endDate: null,
  });

  // Detail view
  private readonly _selectedLog = signal<AuditLog | null>(null);
  private readonly _isDetailOpen = signal(false);

  // Pagination
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(20);

  // Public accessors
  readonly logs = this._logs.asReadonly();
  readonly logsLoading = this._logsLoading.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly selectedLog = this._selectedLog.asReadonly();
  readonly isDetailOpen = this._isDetailOpen.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  // Computed values
  readonly filteredLogs = computed(() => {
    const logs = this._logs();
    const { searchQuery, entityType, action, sortOrder, startDate, endDate } =
      this._filters();

    let filtered = logs;

    if (entityType) {
      filtered = filtered.filter((l) => l.entity === entityType);
    }

    if (action) {
      filtered = filtered.filter((l) => l.action === action);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.entity.toLowerCase().includes(query) ||
          l.action.toLowerCase().includes(query) ||
          l.entityId?.toLowerCase().includes(query)
      );
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(
        (l) => new Date(l.createdAt).getTime() >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      filtered = filtered.filter(
        (l) => new Date(l.createdAt).getTime() < end
      );
    }

    return this.sortLogs(filtered, sortOrder);
  });

  readonly paginatedLogs = computed(() => {
    const filtered = this.filteredLogs();
    const page = this._currentPage();
    const size = this._pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  readonly displayedTotalLogs = computed(() => this.filteredLogs().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredLogs().length / this._pageSize()))
  );

  readonly logCounts = computed(() => {
    const logs = this._logs();
    return {
      all: logs.length,
      create: logs.filter((l) => l.action === AuditAction.CREATE).length,
      update: logs.filter((l) => l.action === AuditAction.UPDATE).length,
      delete: logs.filter((l) => l.action === AuditAction.DELETE).length,
    };
  });

  readonly hasActiveFilters = computed(() => {
    const f = this._filters();
    return !!(f.entityType || f.action || f.startDate || f.endDate);
  });

  // Actions
  setLogs(logs: AuditLog[]): void {
    this._logs.set(logs);
  }

  setLogsLoading(loading: boolean): void {
    this._logsLoading.set(loading);
  }

  setActiveTab(tab: AuditTab): void {
    this._activeTab.set(tab);
    this._currentPage.set(1);
  }

  setSearchQuery(query: string): void {
    this._filters.update((f) => ({ ...f, searchQuery: query }));
    this._currentPage.set(1);
  }

  setEntityTypeFilter(entityType: AuditEntityType | null): void {
    this._filters.update((f) => ({ ...f, entityType }));
    this._currentPage.set(1);
  }

  setActionFilter(action: AuditAction | null): void {
    this._filters.update((f) => ({ ...f, action }));
    this._currentPage.set(1);
  }

  setSortOrder(sortOrder: 'asc' | 'desc'): void {
    this._filters.update((f) => ({ ...f, sortOrder }));
  }

  setDateRange(startDate: string | null, endDate: string | null): void {
    this._filters.update((f) => ({ ...f, startDate, endDate }));
    this._currentPage.set(1);
  }

  clearFilters(): void {
    this._filters.set({
      searchQuery: '',
      entityType: null,
      action: null,
      sortOrder: 'desc',
      startDate: null,
      endDate: null,
    });
    this._currentPage.set(1);
  }

  setCurrentPage(page: number): void {
    this._currentPage.set(page);
  }

  // Detail view actions
  openDetail(log: AuditLog): void {
    this._selectedLog.set(log);
    this._isDetailOpen.set(true);
  }

  closeDetail(): void {
    this._isDetailOpen.set(false);
    this._selectedLog.set(null);
  }

  // Reset state
  reset(): void {
    this._logs.set([]);
    this._activeTab.set('all');
    this._filters.set({
      searchQuery: '',
      entityType: null,
      action: null,
      sortOrder: 'desc',
      startDate: null,
      endDate: null,
    });
    this._currentPage.set(1);
    this._isDetailOpen.set(false);
    this._selectedLog.set(null);
  }

  // Helper
  private sortLogs(logs: AuditLog[], sortOrder: string): AuditLog[] {
    return [...logs].sort((a, b) => {
      const comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}
