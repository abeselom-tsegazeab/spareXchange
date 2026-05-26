import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Shield, Copy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const MFASetupPage = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [backupCodes, setBackupCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: setup, 2: verify

    const { setupMFA, verifyMFA, error } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        handleSetupMFA();
    }, []);

    const handleSetupMFA = async () => {
        try {
            const data = await setupMFA();
            setQrCodeUrl(data.qrCodeUrl);
            setSecret(data.secret);
            setBackupCodes(data.backupCodes);
        } catch (error) {
            console.error(error);
        }
    };

    const handleVerifyMFA = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            toast.error("Please enter the verification code");
            return;
        }

        setIsLoading(true);
        try {
            await verifyMFA(verificationCode);
            toast.success("MFA enabled successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
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
                    <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Set up Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Secure your account with an authenticator app
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
                    {step === 1 && qrCodeUrl && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <Shield className="mx-auto h-12 w-12 text-green-500" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                    Step 1: Scan QR Code
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Manual Entry Code
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={secret}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(secret)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Backup Codes (Save these!)
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, index) => (
                                        <div key={index} className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Store these codes securely. You can use them to access your account if you lose your device.
                                </p>
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                className="w-full"
                            >
                                I've scanned the code
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyMFA} className="space-y-6">
                            <div className="text-center">
                                <Shield className="mx-auto h-12 w-12 text-green-500" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                    Step 2: Verify Setup
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Enter the 6-digit code from your authenticator app
                                </p>
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
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || verificationCode.length !== 6}
                            >
                                {isLoading ? "Verifying..." : "Enable MFA"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="w-full"
                            >
                                Back
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </section>
    );
};

export default MFASetupPage;