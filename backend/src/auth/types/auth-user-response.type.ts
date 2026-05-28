export type AuthUserResponse = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};
