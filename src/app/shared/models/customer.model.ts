export interface Customer {
  id: string;
  shortId: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}