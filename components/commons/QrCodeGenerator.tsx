"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    className?: string;
    level?: "L" | "M" | "Q" | "H";
}

export default function QRCodeGenerator({
    value,
    size = 120,
    className = "",
    level = "M",
}: QRCodeGeneratorProps) {
    if (!value) return null;

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <QRCodeCanvas
                value={value}
                size={size}
                level={level}
                includeMargin
            />
        </div>
    );
}