"use client";

import Barcode from "react-barcode";

interface BarcodeGeneratorProps {
    value: string;
    height?: number;
    width?: number;
    displayValue?: boolean;
    className?: string;
}

export default function BarcodeGenerator({
    value,
    height = 50,
    width = 1.5,
    displayValue = true,
    className = "",
}: BarcodeGeneratorProps) {
    if (!value) return null;

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <Barcode
                value={value}
                height={height}
                width={width}
                displayValue={displayValue}
                background="transparent"
                lineColor="#000"
            />
        </div>
    );
}