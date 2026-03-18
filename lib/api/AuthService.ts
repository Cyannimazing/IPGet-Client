import APIError from "@/lib/api/APIError";
import BaseAPIService from "@/lib/api/BaseAPIService";

class AuthService extends BaseAPIService {
  async login(email: string, password: string) {
    try {
      return await this.request("/api/login", "POST", { email, password });
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to login" });
    }
  }

  async me() {
    try {
      return await this.request("/api/me", "GET");
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to load user profile" });
    }
  }

  async logout() {
    try {
      return await this.request("/api/logout", "POST");
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to logout" });
    }
  }
}

const authService = new AuthService();

export default authService;
