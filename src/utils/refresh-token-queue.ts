class RefreshTokenQueue {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  async addRefreshRequest(
    refreshPromise: () => Promise<string>
  ): Promise<string> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the current refresh to complete
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await refreshPromise();
      this.onRefreshed(newToken);
      return newToken;
    } catch (error) {
      // If refresh fails, reject all waiting requests
      this.refreshSubscribers.forEach(() => {
        // Handle error for each subscriber
      });
      this.refreshSubscribers = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }
}

export const refreshTokenQueue = new RefreshTokenQueue();
