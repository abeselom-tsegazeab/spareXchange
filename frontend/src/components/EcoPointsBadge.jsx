import { Leaf } from "lucide-react";

const EcoPointsBadge = ({ points, size = "md" }) => {
	const sizeClasses = {
		sm: "text-xs px-2 py-1",
		md: "text-sm px-3 py-1.5",
		lg: "text-base px-4 py-2"
	};

	const iconSize = {
		sm: 12,
		md: 16,
		lg: 20
	};

	return (
		<span className={`${sizeClasses[size]} bg-green-900 text-green-300 font-bold rounded-full flex items-center`}>
			<Leaf size={iconSize[size]} className="mr-1" />
			{points} EcoPts
		</span>
	);
};

export default EcoPointsBadge;