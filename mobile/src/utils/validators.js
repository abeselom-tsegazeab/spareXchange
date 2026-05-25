// Form validation helpers.

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());

// Backend regex (auth.controller.js):
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
export const passwordStrength = (pw) => {
	const v = pw || '';
	return {
		length: v.length >= 8,
		lower: /[a-z]/.test(v),
		upper: /[A-Z]/.test(v),
		number: /\d/.test(v),
		special: /[@$!%*?&]/.test(v),
	};
};

export const isStrongPassword = (pw) => {
	const s = passwordStrength(pw);
	return s.length && s.lower && s.upper && s.number && s.special;
};

export const isNonEmpty = (s) => !!s && String(s).trim().length > 0;

export default { isEmail, passwordStrength, isStrongPassword, isNonEmpty };
