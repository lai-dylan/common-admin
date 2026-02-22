export type BasicSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  itemsPerPage: number;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  enableRegistration: boolean;
  defaultTheme: "light" | "dark" | "system";
  defaultLanguage: "zh-CN" | "en-US";
  defaultRole: "admin" | "editor" | "viewer";
};

export type SecuritySettings = {
  passwordPolicy: "simple" | "normal" | "strong";
  loginLimit: number;
  lockOnFail: boolean;
};

export type NotificationSettings = {
  emailNotification: boolean;
  smsNotification: boolean;
  newUserNotify: boolean;
  contentNotify: boolean;
};

export const mockBasicSettings: BasicSettings = {
  siteName: "通用后台管理系统",
  siteDescription: "一个功能强大的后台管理系统",
  contactEmail: "admin@example.com",
  itemsPerPage: 20,
  sessionTimeoutMinutes: 60,
  maintenanceMode: false,
  enableRegistration: true,
  defaultTheme: "system",
  defaultLanguage: "zh-CN",
  defaultRole: "editor",
};

export const mockSecuritySettings: SecuritySettings = {
  passwordPolicy: "normal",
  loginLimit: 5,
  lockOnFail: true,
};

export const mockNotificationSettings: NotificationSettings = {
  emailNotification: true,
  smsNotification: false,
  newUserNotify: true,
  contentNotify: true,
};
