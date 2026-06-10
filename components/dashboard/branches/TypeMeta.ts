import { BranchType } from "@/types/branch";

export const TYPE_META: Record<
    BranchType,
    {
        bg: string;
        text: string;
        border: string;
        glow: string;
        icon: string;
    }
> = {
    local_branch: {
        bg: "rgba(251,191,36,0.08)",
        text: "#fbbf24",
        border: "rgba(251,191,36,0.18)",
        glow: "rgba(251,191,36,0.15)",
        icon: "⬡",
    },
    regional_main_hub: {
        bg: "rgba(34,211,238,0.07)",
        text: "#22d3ee",
        border: "rgba(34,211,238,0.18)",
        glow: "rgba(34,211,238,0.12)",
        icon: "◈",
    },
};