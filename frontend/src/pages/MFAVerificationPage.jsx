import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MFAVerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { mfaEmail, validateMFALogin, error, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleVerifyMFA = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            toast.error("Please enter the verification code");
            return;
        }

        setIsLoading(true);
        try {
            await validateMFALogin(mfaEmail, verificationCode);
            toast.success("Logged in successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        logout();
        navigate("/login");
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <button
                        onClick={handleBackToLogin}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </button>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
                    <form onSubmit={handleVerifyMFA} className="space-y-6">
                        <div className="text-center">
                            <Shield className="mx-auto h-12 w-12 text-green-500" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="verificationCode">Verification Code</Label>
                            <Input
                                id="verificationCode"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest"
                                maxLength={6}
                            />
                            {mfaEmail && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    Code sent to: {mfaEmail}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || verificationCode.length !== 6}
                        >
                            {isLoading ? "Verifying..." : "Verify & Login"}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
};

export default MFAVerificationPage;