import { Timestamp } from "firebase/firestore";

export type ContentStatus = "draft" | "published";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: TipTapContent | null;
  coverImage: string;
  status: ContentStatus;
  difficulty: Difficulty;
  tags: string[];
  estimatedHours: number;
  biPoints: number; // total bi points awarded for completing whole course
  moduleOrder: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  lessonOrder: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: TipTapContent;
  order: number;
  estimatedMinutes: number;
  biPoints: number; // points awarded for completing this lesson
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: TipTapContent;
  coverImage: string;
  status: ContentStatus;
  tags: string[];
  difficulty: Difficulty;
  estimatedMinutes: number;
  biPoints: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: TipTapContent;
  coverImage: string;
  status: ContentStatus;
  tags: string[];
  category: string;
  biPoints: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

// TipTap JSON document structure
export interface TipTapContent {
  type: "doc";
  content: Record<string, unknown>[];
}

// Stored user profile (Firestore: users/{uid})
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  photoURL: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  role: "admin" | "user";
  // Gamification
  biPoints: number;
  streak: number; // consecutive active days
  lastActiveDate: Timestamp | null;
  level: number; // computed from biPoints
}

// Future: user progress tracking
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Timestamp | null;
  lastAccessedAt: Timestamp;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
  completedAt: Timestamp | null;
  progress: number;
}
