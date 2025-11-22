import type { LucideIcon } from 'lucide-react';
import { ShoppingCart, Car, Ticket, Utensils, HeartPulse, ShoppingBag, Lightbulb, CircleDollarSign } from 'lucide-react';

type Category = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const TRANSACTION_CATEGORIES: Category[] = [
  { value: "groceries", label: "Groceries", icon: ShoppingCart },
  { value: "transport", label: "Transport", icon: Car },
  { value: "entertainment", label: "Entertainment", icon: Ticket },
  { value: "food", label: "Food & Dining", icon: Utensils },
  { value: "health", label: "Health", icon: HeartPulse },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "utilities", label: "Utilities", icon: Lightbulb },
  { value: "other", label: "Other", icon: CircleDollarSign },
];
