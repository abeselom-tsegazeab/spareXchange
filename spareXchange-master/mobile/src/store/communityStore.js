// Community engagement state — activity feed, public profiles, achievements.

import { create } from 'zustand';
import { feedApi, publicProfileApi, achievementsApi } from '../api/community.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useCommunityStore = create((set, get) => ({
	highlights: null,
	activities: [],
	activityPagination: null,
	publicProfile: null,
	publicListings: [],
	publicListingsPagination: null,
	publicStats: null,

	achievements: { unlocked: [], locked: [], stats: null, ecoPoints: 0 },
	definitions: [],
	achievementLeaderboard: [],

	loadingHighlights: false,
	loadingFeed: false,
	loadingProfile: false,
	loadingListings: false,
	loadingAchievements: false,
	loadingLeaderboard: false,
	checkingAchievements: false,
	error: null,
	lastUnlockMessage: null,

	fetchHighlights: async () => {
		set({ loadingHighlights: true, error: null });
		try {
			const { data } = await feedApi.community();
			set({ loadingHighlights: false, highlights: data?.highlights || null });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingHighlights: false, error: message });
			return { success: false, message };
		}
	},

	fetchMyFeed: async (params = {}) => {
		set({ loadingFeed: true, error: null });
		try {
			const { data } = await feedApi.mine(params);
			set({
				loadingFeed: false,
				activities: data?.activities || [],
				activityPagination: {
					page: data?.page,
					totalPages: data?.totalPages,
					totalActivities: data?.totalActivities,
				},
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingFeed: false, error: message });
			return { success: false, message };
		}
	},

	fetchUserFeed: async (userId, params = {}) => {
		set({ loadingFeed: true, error: null });
		try {
			const { data } = await feedApi.forUser(userId, params);
			set({
				loadingFeed: false,
				activities: data?.activities || [],
				activityPagination: {
					page: data?.page,
					totalActivities: data?.totalActivities,
				},
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingFeed: false, error: message });
			return { success: false, message };
		}
	},

	fetchPublicProfile: async (userId) => {
		set({ loadingProfile: true, error: null, publicProfile: null });
		try {
			const [{ data: profileData }, { data: statsData }] = await Promise.all([
				publicProfileApi.get(userId),
				publicProfileApi.stats(userId).catch(() => ({ data: null })),
			]);
			set({
				loadingProfile: false,
				publicProfile: profileData?.profile || null,
				publicStats: statsData?.stats || null,
			});
			return { success: true, profile: profileData?.profile };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingProfile: false, error: message });
			return { success: false, message };
		}
	},

	fetchPublicListings: async (userId, params = {}) => {
		set({ loadingListings: true, error: null });
		try {
			const { data } = await publicProfileApi.listings(userId, params);
			set({
				loadingListings: false,
				publicListings: data?.listings || [],
				publicListingsPagination: {
					page: data?.page,
					totalPages: data?.totalPages,
					totalListings: data?.totalListings,
				},
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingListings: false, error: message });
			return { success: false, message };
		}
	},

	fetchAchievements: async () => {
		set({ loadingAchievements: true, error: null });
		try {
			const { data } = await achievementsApi.mine();
			set({
				loadingAchievements: false,
				achievements: {
					unlocked: data?.unlocked || [],
					locked: data?.locked || [],
					stats: data?.stats || null,
					ecoPoints: data?.ecoPoints ?? 0,
				},
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingAchievements: false, error: message });
			return { success: false, message };
		}
	},

	fetchDefinitions: async () => {
		try {
			const { data } = await achievementsApi.definitions();
			set({ definitions: data?.achievements || [] });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	checkAchievements: async () => {
		set({ checkingAchievements: true, error: null, lastUnlockMessage: null });
		try {
			const { data } = await achievementsApi.check();
			const unlocked = data?.unlocked || [];
			set({
				checkingAchievements: false,
				lastUnlockMessage: data?.message || null,
				achievements: {
					unlocked: data?.allAchievements || [],
					locked: get().achievements.locked,
					stats: {
						totalUnlocked: data?.totalAchievements ?? unlocked.length,
						completionPercentage: get().achievements.stats?.completionPercentage,
					},
					ecoPoints: get().achievements.ecoPoints,
				},
			});
			await get().fetchAchievements();
			return { success: true, unlocked, message: data?.message };
		} catch (e) {
			const message = errToMsg(e);
			set({ checkingAchievements: false, error: message });
			return { success: false, message };
		}
	},

	fetchAchievementLeaderboard: async (params = {}) => {
		set({ loadingLeaderboard: true, error: null });
		try {
			const { data } = await achievementsApi.leaderboard(params);
			set({ loadingLeaderboard: false, achievementLeaderboard: data?.leaderboard || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingLeaderboard: false, error: message });
			return { success: false, message };
		}
	},

	clearPublicProfile: () =>
		set({
			publicProfile: null,
			publicListings: [],
			publicStats: null,
			publicListingsPagination: null,
		}),
}));

export default useCommunityStore;
