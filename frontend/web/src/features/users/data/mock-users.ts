import type { UserRow } from "@/features/users/types/user";

export const mockUsers: UserRow[] = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    email: "minhanh@gmail.com",
    plan: "Premium",
    joined: "12/10/2024",
    status: "Hoạt động",
  },
  {
    id: 2,
    name: "Trần Gia Huy",
    email: "giahuy@gmail.com",
    plan: "Free",
    joined: "10/10/2024",
    status: "Hoạt động",
  },
  {
    id: 3,
    name: "Lê Khánh Linh",
    email: "khanhlinh@gmail.com",
    plan: "Premium",
    joined: "08/10/2024",
    status: "Tạm khóa",
  },
];
