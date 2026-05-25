// Admin permission helpers (mirrors backend authorize middleware).

export const hasPermission = (user, permission) => {
	if (!user) return false;
	if (user.userType === 'admin') return true;
	return Array.isArray(user.permissions) && user.permissions.includes(permission);
};

export const canViewStats = (user) => hasPermission(user, 'view_stats');
export const canViewReports = (user) => hasPermission(user, 'view_reports');
export const canModerate = (user) => hasPermission(user, 'moderate_content');
export const canRunJobs = (user) => hasPermission(user, 'run_jobs');

export const isOperationsUser = (user) =>
	canViewStats(user) || canViewReports(user) || canModerate(user) || canRunJobs(user);
