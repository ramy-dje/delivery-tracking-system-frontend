"use client";
import { LucideIcon, ChevronDown } from "lucide-react";

type SelectOption = {
    label: string;
    value: string;
};

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    icon?: LucideIcon;
    error?: string;
    disabled?: boolean;
}

export default function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    icon: Icon,
    error,
    disabled = false,
}: SelectFieldProps) {
    return (
        <div className="space-y-2">
            {label &&
                <label className="block text-sm font-medium text-slate-400">
                    {label}
                </label>}

            <div
                className={`
                    relative flex items-center rounded-lg border transition-all
                    ${error
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-white/10 bg-white/3"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                {/* LEFT ICON */}
                {Icon && (
                    <Icon className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                )}

                {/* SELECT */}
                <select
                    disabled={disabled}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                        w-full appearance-none bg-transparent text-white
                        px-4 py-2 text-sm rounded-lg focus:outline-none
                        disabled:cursor-not-allowed
                        ${Icon ? "pl-12" : ""}
                    `}
                >
                    {!value && (
                        <option
                            value=""
                            disabled
                            style={{ background: "#0d1117" }}
                        >
                            {placeholder}
                        </option>
                    )}

                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            style={{ background: "#0d1117" }}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* RIGHT CHEVRON */}
                <ChevronDown className="absolute right-4 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            {/* ERROR */}
            {error && (
                <p className="text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}