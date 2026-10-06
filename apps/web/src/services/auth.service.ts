import * as React from "react"
import { api } from "./api"

export const authService = {
  login: (username: string, password: string) => api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  me: () => api.get("/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.put("/auth/change-password", { currentPassword, newPassword }),
}
