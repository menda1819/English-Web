export const SESSION_COOKIE_NAME = "bright_garden_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: "teacher" | "student";
  grade?: number;
  avatar?: string;
  status: "active" | "inactive";
  accessAllGrades?: boolean;
  allowedGrades?: number[];
}
