export type MembershipCategory = 'Individual' | 'Couple' | 'Group';

export interface DbMembershipPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string | null;
  category: MembershipCategory;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewMembershipPlanInput {
  name: string;
  duration: string;
  price: number;
  description?: string;
  category: MembershipCategory;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateMembershipPlanInput {
  name?: string;
  duration?: string;
  price?: number;
  description?: string;
  category?: MembershipCategory;
  isActive?: boolean;
  displayOrder?: number;
}

