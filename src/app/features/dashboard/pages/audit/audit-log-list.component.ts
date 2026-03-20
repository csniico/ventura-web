import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLog, AuditAction, AuditEntityType } from '../../../../core/models/audit.model';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log-list.component.html',
})
export class AuditLogListComponent {
  @Input() logs: AuditLog[] = [];
  @Input() isLoading = false;
  @Input() totalLogs = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 20;

  @Output() logView = new EventEmitter<AuditLog>();
  @Output() pageChange = new EventEmitter<number>();

  protected Math = Math;

  protected getActionClasses(action: AuditAction): string {
    switch (action) {
      case AuditAction.CREATE:
        return 'bg-green-50 text-green-700';
      case AuditAction.UPDATE:
        return 'bg-blue-50 text-blue-700';
      case AuditAction.DELETE:
        return 'bg-red-50 text-red-700';
      case AuditAction.LOGIN:
      case AuditAction.LOGOUT:
        return 'bg-purple-50 text-purple-700';
      case AuditAction.SEND:
        return 'bg-cyan-50 text-cyan-700';
      case AuditAction.IMPORT:
      case AuditAction.EXPORT:
        return 'bg-amber-50 text-amber-700';
      case AuditAction.CANCEL:
      case AuditAction.REJECT:
        return 'bg-orange-50 text-orange-700';
      case AuditAction.APPROVE:
        return 'bg-emerald-50 text-emerald-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  protected getEntityClasses(entity: AuditEntityType): string {
    switch (entity) {
      case AuditEntityType.ORDER:
      case AuditEntityType.ORDER_ITEM:
        return 'bg-blue-50 text-blue-600';
      case AuditEntityType.INVOICE:
        return 'bg-indigo-50 text-indigo-600';
      case AuditEntityType.CUSTOMER:
        return 'bg-emerald-50 text-emerald-600';
      case AuditEntityType.PRODUCT:
      case AuditEntityType.SERVICE:
      case AuditEntityType.RESOURCE:
        return 'bg-amber-50 text-amber-600';
      case AuditEntityType.USER:
      case AuditEntityType.AUTH:
        return 'bg-purple-50 text-purple-600';
      case AuditEntityType.BUSINESS:
        return 'bg-cyan-50 text-cyan-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }

  protected formatEntity(entity: AuditEntityType): string {
    return entity.replace(/_/g, ' ');
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
