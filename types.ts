
export enum AccessLevel {
  ADMIN = 'Админ',
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
  displayId: number; // Порядковый номер начиная с 1
  title: string;
  organizationName: string;
  solutionContext: string;
  description: string;
  status: TaskStatus;
  priority: 'Обычная' | 'Срочная' | 'Ключевая';
  deadline: string;
  creatorId: number;
  assigneeId: number;
  assigneeName: string;
  tags: string[];
  weightHours: number;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
}
