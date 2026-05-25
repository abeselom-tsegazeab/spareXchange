// Notification preference groups for the settings UI.

export const DEFAULT_PREFERENCES = {
	emailNotifications: true,
	pushNotifications: true,
	smsNotifications: false,
	listingAlerts: true,
	exchangeUpdates: true,
	messageNotifications: true,
	systemAnnouncements: true,
	marketingEmails: false,
};

export const PREFERENCE_GROUPS = [
	{
		title: 'Channels',
		items: [
			{ key: 'emailNotifications', label: 'Email', description: 'Receive alerts by email' },
			{ key: 'pushNotifications', label: 'Push', description: 'Alerts on this device' },
			{ key: 'smsNotifications', label: 'SMS', description: 'Text message alerts' },
		],
	},
	{
		title: 'Activity',
		items: [
			{ key: 'listingAlerts', label: 'Listing alerts', description: 'Saved search matches and listings' },
			{ key: 'exchangeUpdates', label: 'Exchange updates', description: 'Proposals, handshakes, completion' },
			{ key: 'messageNotifications', label: 'Messages', description: 'New chat messages' },
		],
	},
	{
		title: 'Other',
		items: [
			{ key: 'systemAnnouncements', label: 'System announcements', description: 'Platform news and safety tips' },
			{ key: 'marketingEmails', label: 'Marketing', description: 'Promotions and feature updates' },
		],
	},
];
