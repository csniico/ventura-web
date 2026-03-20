import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLog, AuditAction, AuditEntityType } from '../../../../core/models/audit.model';

interface DetailSection {
  label: string;
  icon: string;
  fields: { key: string; value: string; type: 'text' | 'badge' | 'email' | 'currency' | 'list' | 'status-change' }[];
}

@Component({
  selector: 'app-audit-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-detail-modal.component.html',
})
export class AuditDetailModalComponent {
  @Input() isOpen = false;
  @Input() log: AuditLog | null = null;

  @Output() close = new EventEmitter<void>();

  protected get actionSummary(): string {
    if (!this.log) return '';
    const entity = this.formatEntityName(this.log.entity);
    const name = this.extractDisplayName();

    switch (this.log.action) {
      case AuditAction.CREATE:
        return name ? `Created ${entity} "${name}"` : `Created a ${entity}`;
      case AuditAction.UPDATE:
        return name ? `Updated ${entity} "${name}"` : `Updated a ${entity}`;
      case AuditAction.DELETE:
        return name ? `Deleted ${entity} "${name}"` : `Deleted a ${entity}`;
      case AuditAction.LOGIN:
        return 'Signed in to account';
      case AuditAction.LOGOUT:
        return 'Signed out of account';
      case AuditAction.SEND:
        return name ? `Sent ${entity} to "${name}"` : `Sent a ${entity}`;
      case AuditAction.CANCEL:
        return name ? `Cancelled ${entity} "${name}"` : `Cancelled a ${entity}`;
      case AuditAction.APPROVE:
        return name ? `Approved ${entity} "${name}"` : `Approved a ${entity}`;
      case AuditAction.REJECT:
        return name ? `Rejected ${entity} "${name}"` : `Rejected a ${entity}`;
      case AuditAction.IMPORT:
        return `Imported ${entity} data`;
      case AuditAction.EXPORT:
        return `Exported ${entity} data`;
      default:
        return `${this.log.action} on ${entity}`;
    }
  }

  protected get actionIconBg(): string {
    if (!this.log) return 'bg-gray-100';
    switch (this.log.action) {
      case AuditAction.CREATE: return 'bg-green-100';
      case AuditAction.UPDATE: return 'bg-blue-100';
      case AuditAction.DELETE: return 'bg-red-100';
      case AuditAction.LOGIN: return 'bg-purple-100';
      case AuditAction.LOGOUT: return 'bg-gray-100';
      case AuditAction.SEND: return 'bg-cyan-100';
      case AuditAction.CANCEL: return 'bg-orange-100';
      case AuditAction.APPROVE: return 'bg-emerald-100';
      default: return 'bg-gray-100';
    }
  }

  protected get actionIconColor(): string {
    if (!this.log) return 'text-gray-600';
    switch (this.log.action) {
      case AuditAction.CREATE: return 'text-green-600';
      case AuditAction.UPDATE: return 'text-blue-600';
      case AuditAction.DELETE: return 'text-red-600';
      case AuditAction.LOGIN: return 'text-purple-600';
      case AuditAction.LOGOUT: return 'text-gray-600';
      case AuditAction.SEND: return 'text-cyan-600';
      case AuditAction.CANCEL: return 'text-orange-600';
      case AuditAction.APPROVE: return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  }

  protected get actionBadgeClasses(): string {
    if (!this.log) return 'bg-gray-50 text-gray-700';
    switch (this.log.action) {
      case AuditAction.CREATE: return 'bg-green-50 text-green-700';
      case AuditAction.UPDATE: return 'bg-blue-50 text-blue-700';
      case AuditAction.DELETE: return 'bg-red-50 text-red-700';
      case AuditAction.LOGIN:
      case AuditAction.LOGOUT: return 'bg-purple-50 text-purple-700';
      case AuditAction.SEND: return 'bg-cyan-50 text-cyan-700';
      case AuditAction.CANCEL: return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  protected get detailSections(): DetailSection[] {
    if (!this.log) return [];
    const raw = this.log.metadata || {};
    // Filter out timestamp — already shown in the header
    const { timestamp, ...m } = raw as Record<string, unknown> & { timestamp?: unknown };
    const sections: DetailSection[] = [];

    // Actor / Identity section — always show for traceability
    const actorFields = this.buildActorFields(m as Record<string, unknown>);
    if (actorFields.length > 0) {
      sections.push({ label: 'Who', icon: 'user', fields: actorFields });
    }

    // What happened section
    const changeFields = this.buildChangeFields(m as Record<string, unknown>);
    if (changeFields.length > 0) {
      sections.push({ label: 'What Changed', icon: 'pencil', fields: changeFields });
    }

    // Financial section
    const financialFields = this.buildFinancialFields(m as Record<string, unknown>);
    if (financialFields.length > 0) {
      sections.push({ label: 'Financial', icon: 'currency', fields: financialFields });
    }

    // Context section
    const contextFields = this.buildContextFields(m as Record<string, unknown>);
    if (contextFields.length > 0) {
      sections.push({ label: 'Context', icon: 'info', fields: contextFields });
    }

    return sections;
  }

  private buildActorFields(m: Record<string, unknown>): DetailSection['fields'] {
    const fields: DetailSection['fields'] = [];

    if (m['firstName'] || m['lastName']) {
      const name = [m['firstName'], m['lastName']].filter(Boolean).join(' ');
      fields.push({ key: 'Name', value: name, type: 'text' });
    } else if (m['name'] && String(m['name']).trim()) {
      fields.push({ key: 'Name', value: String(m['name']), type: 'text' });
    }

    if (m['email'] && String(m['email']).trim()) {
      fields.push({ key: 'Email', value: String(m['email']), type: 'email' });
    } else if (this.log?.userId) {
      // Fall back to showing the actor by userId when email is empty
      fields.push({ key: 'Performed By', value: this.truncateId(this.log.userId), type: 'text' });
    }

    if (m['phone'] && String(m['phone']).trim()) {
      fields.push({ key: 'Phone', value: String(m['phone']), type: 'text' });
    }
    if (m['recipientEmail'] && String(m['recipientEmail']).trim()) {
      fields.push({ key: 'Sent To', value: String(m['recipientEmail']), type: 'email' });
    }
    if (m['ipAddress'] && String(m['ipAddress']).trim()) {
      fields.push({ key: 'IP Address', value: String(m['ipAddress']), type: 'text' });
    }
    if (m['userAgent'] && String(m['userAgent']).trim()) {
      fields.push({ key: 'Browser', value: this.parseUserAgent(String(m['userAgent'])), type: 'text' });
    }

    return fields;
  }

  private buildChangeFields(m: Record<string, unknown>): DetailSection['fields'] {
    const fields: DetailSection['fields'] = [];

    if (m['oldStatus'] && m['newStatus']) {
      fields.push({
        key: 'Status',
        value: `${this.formatStatus(String(m['oldStatus']))} → ${this.formatStatus(String(m['newStatus']))}`,
        type: 'status-change',
      });
    }
    if (m['status'] && !m['oldStatus']) {
      fields.push({ key: 'Status', value: this.formatStatus(String(m['status'])), type: 'badge' });
    }
    if (m['oldRole'] && m['newRole']) {
      fields.push({
        key: 'Role',
        value: `${String(m['oldRole'])} → ${String(m['newRole'])}`,
        type: 'status-change',
      });
    }
    if (m['action'] && typeof m['action'] === 'string') {
      fields.push({ key: 'Type', value: this.formatStatus(String(m['action'])), type: 'badge' });
    }
    if (m['success'] !== undefined) {
      fields.push({ key: 'Result', value: m['success'] ? 'Successful' : 'Failed', type: 'badge' });
    }
    if (Array.isArray(m['updatedFields']) && m['updatedFields'].length > 0) {
      fields.push({
        key: 'Fields Modified',
        value: (m['updatedFields'] as string[]).map((f) => this.formatFieldName(f)).join(', '),
        type: 'list',
      });
    }

    return fields;
  }

  private buildFinancialFields(m: Record<string, unknown>): DetailSection['fields'] {
    const fields: DetailSection['fields'] = [];

    if (m['totalAmount'] !== undefined) {
      fields.push({ key: 'Total Amount', value: String(m['totalAmount']), type: 'currency' });
    }
    if (m['amountPaid'] !== undefined) {
      fields.push({ key: 'Amount Paid', value: String(m['amountPaid']), type: 'currency' });
    }
    if (m['paymentMethod']) {
      fields.push({ key: 'Payment Method', value: this.formatStatus(String(m['paymentMethod'])), type: 'badge' });
    }

    return fields;
  }

  private buildContextFields(m: Record<string, unknown>): DetailSection['fields'] {
    const fields: DetailSection['fields'] = [];

    if (m['businessId']) {
      fields.push({ key: 'Business', value: this.truncateId(String(m['businessId'])), type: 'text' });
    }
    if (m['customerId']) {
      fields.push({ key: 'Customer', value: this.truncateId(String(m['customerId'])), type: 'text' });
    }
    if (m['orderId']) {
      fields.push({ key: 'Order', value: this.truncateId(String(m['orderId'])), type: 'text' });
    }
    if (m['reason']) {
      fields.push({ key: 'Reason', value: String(m['reason']), type: 'text' });
    }

    return fields;
  }

  private extractDisplayName(): string {
    if (!this.log?.metadata) return '';
    const m = this.log.metadata;

    if (m['name'] && String(m['name']).trim()) return String(m['name']);
    if (m['firstName']) {
      return [m['firstName'], m['lastName']].filter(Boolean).join(' ');
    }
    if (m['email'] && String(m['email']).trim()) return String(m['email']);
    return '';
  }

  private formatEntityName(entity: AuditEntityType): string {
    const map: Partial<Record<AuditEntityType, string>> = {
      [AuditEntityType.USER]: 'User',
      [AuditEntityType.BUSINESS]: 'Business',
      [AuditEntityType.APPOINTMENT]: 'Appointment',
      [AuditEntityType.CUSTOMER]: 'Customer',
      [AuditEntityType.ORDER]: 'Order',
      [AuditEntityType.ORDER_ITEM]: 'Order Item',
      [AuditEntityType.INVOICE]: 'Invoice',
      [AuditEntityType.PRODUCT]: 'Product',
      [AuditEntityType.SERVICE]: 'Service',
      [AuditEntityType.MAIL]: 'Email',
      [AuditEntityType.RESOURCE]: 'Resource',
      [AuditEntityType.STORAGE]: 'File',
      [AuditEntityType.AUTH]: 'Account',
    };
    return map[entity] || entity;
  }

  private formatStatus(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  }

  private truncateId(id: string): string {
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  }

  private parseUserAgent(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return ua.length > 40 ? ua.slice(0, 40) + '...' : ua;
  }
}
