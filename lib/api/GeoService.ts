import APIError from "@/lib/api/APIError";
import BaseAPIService from "@/lib/api/BaseAPIService";

class GeoService extends BaseAPIService {
  async getCurrentGeo() {
    try {
      return await this.request("/api/geo/current", "GET");
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to fetch current geo" });
    }
  }

  async searchGeo(ip: string) {
    try {
      return await this.request("/api/geo/search", "POST", { ip });
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to search geo" });
    }
  }

  async getHistory() {
    try {
      return await this.request("/api/geo/history", "GET");
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to fetch history" });
    }
  }

  async getHistoryById(historyId: number) {
    try {
      return await this.request(`/api/geo/history/${historyId}`, "GET");
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to fetch history record" });
    }
  }

  async deleteHistory(historyIds: number[]) {
    try {
      return await this.request("/api/geo/history", "DELETE", {
        history_ids: historyIds,
      });
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError({ message: error.message, errors: error.errors });
      }

      throw new APIError({ message: "Failed to delete history" });
    }
  }
}

const geoService = new GeoService();

export default geoService;
