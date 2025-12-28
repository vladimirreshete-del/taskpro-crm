
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

export interface TaskComment {
  id: number;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface Employee {
  id: number;
  telegramId?: number;
  telegramUrl?: string;
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
  organizationName: string;
  solutionContext: string;
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
  comments: TaskComment[];
}
