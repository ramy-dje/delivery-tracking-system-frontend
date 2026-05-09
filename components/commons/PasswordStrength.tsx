import { motion } from "framer-motion";

const PasswordStrength = ({ password }: { password: string }) => {
    const strength = (() => {
        let score = 0;
        if (password.length > 7) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    })();

    const colors = ["bg-slate-800", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    const labels = ["Weak", "Fair", "Good", "Strong"];

    return (
        <div className="space-y-2 mt-2">
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                    <motion.div
                        key={level}
                        className={`flex-1 rounded-full ${strength >= level ? colors[strength] : 'bg-slate-800'}`}
                        initial={false}
                        animate={{ opacity: strength >= level ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
            {password.length > 0 && (
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                    <span className="text-slate-500">Strength</span>
                    <span className={`${strength > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {labels[strength - 1] || "Too Short"}
                    </span>
                </div>
            )}
        </div>
    );
}


export default PasswordStrength;