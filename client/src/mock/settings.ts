export type BasicSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
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
