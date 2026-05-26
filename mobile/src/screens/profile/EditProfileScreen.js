import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useAuthStore } from '../../store/authStore';

export default function EditProfileScreen({ navigation }) {
	const user = useAuthStore((s) => s.user);

	const [name, setName] = useState(user?.name || '');
	const [phone, setPhone] = useState(user?.phone || '');
	const [location, setLocation] = useState(user?.location || '');
	const [avatarUri, setAvatarUri] = useState(user?.profilePicture || null);
	const [avatarAsset, setAvatarAsset] = useState(null); // newly picked asset
	const [info, setInfo] = useState(null);
	const [error, setError] = useState(null);

	const submitting = useAuthStore((s) => s.isSubmitting);
	const updateProfile = useAuthStore((s) => s.updateProfile);

	const pickAvatar = async () => {
		try {
			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.7,
			});
			if (res.canceled) return;
			const asset = res.assets[0];
			setAvatarUri(asset.uri);
			setAvatarAsset(asset);
		} catch (e) {
			setError(e?.message || 'Could not open the image picker.');
		}
	};

	const onSave = async () => {
		setError(null);
		setInfo(null);
		const res = await updateProfile({
			name: name.trim(),
			phone: phone.trim(),
			location: location.trim(),
			profilePictureAsset: avatarAsset || undefined,
		});
		if (res.success) {
			setInfo('Profile saved.');
			setAvatarAsset(null);
		} else {
			setError(res.message || 'Could not save changes.');
		}
	};

	const initials = (name || 'U')
		.split(' ')
		.map((s) => s[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<ScreenContainer scroll keyboard>
			{error ? <Banner tone="danger" message={error} /> : null}
			{info ? <Banner tone="success" message={info} /> : null}

			<View style={styles.avatarRow}>
				<Pressable onPress={pickAvatar} style={styles.avatarWrap}>
					{avatarUri ? (
						<Image source={{ uri: resolveAssetUrl(avatarUri) }} style={styles.avatar} />
					) : (
						<View style={[styles.avatar, styles.avatarFallback]}>
							<Text style={styles.avatarText}>{initials}</Text>
						</View>
					)}
					<View style={styles.cameraBadge}>
						<Text style={{ color: '#fff', fontWeight: '800' }}>✎</Text>
					</View>
				</Pressable>
				<Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.sm }]}>
					Tap to change photo
				</Text>
			</View>

			<Input label="Display name" value={name} onChangeText={setName} placeholder="Your name" />
			<Input
				label="Phone"
				value={phone}
				onChangeText={setPhone}
				placeholder="+251 ..."
				keyboardType="phone-pad"
				autoCorrect={false}
			/>
			<Input
				label="Location"
				value={location}
				onChangeText={setLocation}
				placeholder="City, Country"
				autoCapitalize="words"
			/>

			<Button title="Save changes" onPress={onSave} loading={submitting} size="lg" />
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	avatarRow: { alignItems: 'center', marginBottom: spacing.xl },
	avatarWrap: { position: 'relative' },
	avatar: { width: 110, height: 110, borderRadius: 55 },
	avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
	avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
	cameraBadge: {
		position: 'absolute',
		right: -4,
		bottom: -4,
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: colors.primaryDark,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 3,
		borderColor: colors.bg,
	},
});
