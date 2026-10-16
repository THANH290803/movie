export type UserRow = {
  id: number;
  name: string;
  email: string;
  plan: "Premium" | "Free";
  joined: string;
  status: "Hoạt động" | "Tạm khóa";
};
