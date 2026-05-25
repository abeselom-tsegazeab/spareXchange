import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api/users" 
  : "/api/users";

axios.defaults.withCredentials = true;

export const useCommunityStore = create((set, get) => ({
  // Activity Feed State
  activities: [],
  activityFeedMeta: { page: 1, totalPages: 1, totalActivities: 0 },
  communityHighlights: null,
  userPublicActivity: [],
  loadingActivities: false,
  activityError: null,

  // Public Profile State
  userProfile: null,
  userListings: [],
  userListingsMeta: { page: 1, totalPages: 1, totalListings: 0 },
  userReviews: null,
  userReviewsMeta: { page: 1, totalPages: 1, totalReviews: 0 },
  userStats: null,
  loadingProfile: false,
  profileError: null,

  // Achievements State
  userAchievements: null,
  achievementDefinitions: [],
  achievementLeaderboard: [],
  loadingAchievements: false,
  achievementError: null,

  // ─────────────────────────────────────────────
  // Activity Feed Actions
  // ─────────────────────────────────────────────

  getActivityFeed: async (filters = {}) => {
    set({ loadingActivities: true, activityError: null });
    try {
      const { page = 1, limit = 20, type } = filters;
      console.log('Fetching activity feed from API with params:', { page, limit, type });
      const response = await axios.get(`${API_URL}/feed`, {
        params: { page, limit, type }
      });
      
      console.log('Activity feed API response:', response.data);
      
      set({
        activities: response.data.activities,
        activityFeedMeta: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          totalActivities: response.data.totalActivities
        },
        loadingActivities: false
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      console.error('Error response:', error.response?.data);
      set({ 
        activityError: error.response?.data?.message || "Failed to fetch activity feed",
        loadingActivities: false 
      });
      throw error;
    }
  },

  getCommunityHighlights: async () => {
    set({ loadingActivities: true, activityError: null });
    try {
      const response = await axios.get(`${API_URL}/feed/community`);
      set({
        communityHighlights: response.data.highlights,
        loadingActivities: false
      });
      return response.data;
    } catch (error) {
      set({ 
        activityError: error.response?.data?.message || "Failed to fetch community highlights",
        loadingActivities: false 
      });
      throw error;
    }
  },

  getUserPublicActivity: async (userId, filters = {}) => {
    set({ loadingActivities: true, activityError: null });
    try {
      const { page = 1, limit = 10 } = filters;
      const response = await axios.get(`${API_URL}/feed/${userId}`, {
        params: { page, limit }
      });
      
      set({
        userPublicActivity: response.data.activities,
        loadingActivities: false
      });
      
      return response.data;
    } catch (error) {
      set({ 
        activityError: error.response?.data?.message || "Failed to fetch user activity",
        loadingActivities: false 
      });
      throw error;
    }
  },

  // ─────────────────────────────────────────────
  // Public Profile Actions
  // ─────────────────────────────────────────────

  getPublicProfile: async (userId) => {
    set({ loadingProfile: true, profileError: null });
    try {
      const response = await axios.get(`${API_URL}/profile/${userId}/public`);
      set({
        userProfile: response.data.profile,
        loadingProfile: false
      });
      return response.data;
    } catch (error) {
      set({ 
        profileError: error.response?.data?.message || "Failed to fetch profile",
        loadingProfile: false 
      });
      throw error;
    }
  },

  getUserListings: async (userId, filters = {}) => {
    set({ loadingProfile: true, profileError: null });
    try {
      const { page = 1, limit = 10, category, condition } = filters;
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/profile/${userId}/listings`, {
        params: { page, limit, category, condition },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      set({
        userListings: response.data.listings,
        userListingsMeta: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          totalListings: response.data.totalListings
        },
        loadingProfile: false
      });
      
      return response.data;
    } catch (error) {
      set({ 
        profileError: error.response?.data?.message || "Failed to fetch user listings",
        loadingProfile: false 
      });
      throw error;
    }
  },

  getUserReviews: async (userId, filters = {}) => {
    set({ loadingProfile: true, profileError: null });
    try {
      const { page = 1, limit = 10 } = filters;
      const response = await axios.get(`${API_URL}/profile/${userId}/reviews`, {
        params: { page, limit }
      });
      
      set({
        userReviews: {
          reviews: response.data.reviews,
          averageRating: response.data.averageRating,
          ratingDistribution: response.data.ratingDistribution
        },
        userReviewsMeta: {
          page: response.data.page,
          totalPages: response.data.totalPages,
          totalReviews: response.data.totalReviews
        },
        loadingProfile: false
      });
      
      return response.data;
    } catch (error) {
      set({ 
        profileError: error.response?.data?.message || "Failed to fetch user reviews",
        loadingProfile: false 
      });
      throw error;
    }
  },

  getUserStats: async (userId) => {
    set({ loadingProfile: true, profileError: null });
    try {
      const response = await axios.get(`${API_URL}/profile/${userId}/stats`);
      set({
        userStats: response.data.stats,
        loadingProfile: false
      });
      return response.data;
    } catch (error) {
      set({ 
        profileError: error.response?.data?.message || "Failed to fetch user stats",
        loadingProfile: false 
      });
      throw error;
    }
  },

  clearProfileData: () => {
    set({
      userProfile: null,
      userListings: [],
      userReviews: null,
      userStats: null,
      profileError: null
    });
  },

  // ─────────────────────────────────────────────
  // Achievements Actions
  // ─────────────────────────────────────────────

  getAchievementDefinitions: async () => {
    set({ loadingAchievements: true, achievementError: null });
    try {
      const response = await axios.get(`${API_URL}/achievements/definitions`);
      set({
        achievementDefinitions: response.data.achievements,
        loadingAchievements: false
      });
      return response.data;
    } catch (error) {
      set({ 
        achievementError: error.response?.data?.message || "Failed to fetch achievements",
        loadingAchievements: false 
      });
      throw error;
    }
  },

  getUserAchievements: async () => {
    set({ loadingAchievements: true, achievementError: null });
    try {
      const response = await axios.get(`${API_URL}/achievements`);
      set({
        userAchievements: response.data,
        loadingAchievements: false
      });
      return response.data;
    } catch (error) {
      set({ 
        achievementError: error.response?.data?.message || "Failed to fetch user achievements",
        loadingAchievements: false 
      });
      throw error;
    }
  },

  checkAndUnlockAchievements: async () => {
    set({ loadingAchievements: true, achievementError: null });
    try {
      const response = await axios.post(`${API_URL}/achievements/check`, {});
      
      // Refresh achievements after checking
      await get().getUserAchievements();
      
      set({ loadingAchievements: false });
      return response.data;
    } catch (error) {
      set({ 
        achievementError: error.response?.data?.message || "Failed to check achievements",
        loadingAchievements: false 
      });
      throw error;
    }
  },

  getAchievementLeaderboard: async (limit = 10) => {
    set({ loadingAchievements: true, achievementError: null });
    try {
      const response = await axios.get(`${API_URL}/achievements/leaderboard`, {
        params: { limit }
      });
      set({
        achievementLeaderboard: response.data.leaderboard,
        loadingAchievements: false
      });
      return response.data;
    } catch (error) {
      set({ 
        achievementError: error.response?.data?.message || "Failed to fetch leaderboard",
        loadingAchievements: false 
      });
      throw error;
    }
  },

  // Helper to trigger achievement check after user actions
  triggerAchievementCheck: async () => {
    try {
      await get().checkAndUnlockAchievements();
    } catch (error) {
      console.error("Achievement check failed:", error);
    }
  }
}));
