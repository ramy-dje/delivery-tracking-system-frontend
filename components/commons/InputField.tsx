import { LucideIcon } from "lucide-react";

interface InputFieldProps {
    label: string;
    type?: string;
    placeholder: string;
    icon?: LucideIcon;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    step?: string;
}

export default function InputField({ label, type = "text", placeholder, icon: Icon, value, onChange, error, step }: InputFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className={`relative flex items-center rounded-xl border ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'} focus-within:border-amber-500/50 transition`}>
                {Icon && <Icon className="absolute left-4 w-5 h-5 text-slate-400" />}
                <input
                    type={type}
                    step={step}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 focus:outline-none ${Icon ? 'pl-12' : ''}`}
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
    );
}