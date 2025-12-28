
export enum AccessLevel {
  ADMIN = 'Админ',
  MANAGER = 'Менеджер',
  EXECUTOR = 'Исполнитель'
}

export enum TaskStatus {
  NEW = 'Новая',
  IN_PROGRESS = 'В работе',
  ON_REVIEW = 'На проверке',
  DONE = 'Выполнена',
  CANCELLED = 'Отменена'
}

export interface Employee {
  id: number;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
  accessLevel: AccessLevel;
  skills: string[];
  loadPercentage: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  deadline: string;
  creatorId: number;
  assigneeId: number;
  tags: string[];
  weightHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskChangeLog {
  timestamp: string;
  user: string;
  field: string;
  oldValue: any;
  newValue: any;
}
