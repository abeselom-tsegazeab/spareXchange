import { Sprout, Leaf, Trees, TreePine, Globe } from "lucide-react";
import { motion } from "framer-motion";

const TierBadge = ({ tier }) => {
	const tiers = {
		Seed: {
			icon: Sprout,
			color: "from-orange-700 to-amber-900",
			text: "text-orange-200",
			label: "Seed Tier",
		},
		Sprout: {
			icon: Leaf,
			color: "from-green-400 to-emerald-600",
			text: "text-green-100",
			label: "Sprout Tier",
		},
		Sapling: {
			icon: Trees,
			color: "from-emerald-500 to-teal-700",
			text: "text-emerald-100",
			label: "Sapling Tier",
		},
		Oak: {
			icon: TreePine,
			color: "from-green-600 to-forest-800",
			text: "text-green-50",
			label: "Oak Tier",
		},
		Gaia: {
			icon: Globe,
			color: "from-yellow-400 via-orange-500 to-red-600",
			text: "text-yellow-100",
			label: "Gaia Tier",
		},
	};

	const currentTier = tiers[tier] || tiers.Seed;
	const Icon = currentTier.icon;

	return (
		<motion.div
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			whileHover={{ scale: 1.05 }}
			className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${currentTier.color} shadow-lg border border-white border-opacity-20`}
		>
			<Icon className='size-4 text-white' />
			<span className={`text-xs font-bold uppercase tracking-wider ${currentTier.text}`}>
				{currentTier.label}
			</span>
		</motion.div>
	);
};

export default TierBadge;
