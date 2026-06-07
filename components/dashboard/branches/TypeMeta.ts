import { NodeType } from "@/types/branch";

export const TYPE_META: Record<NodeType, { bg: string; text: string; border: string; glow: string; icon: string }> = {
    [NodeType.RegionalMainHub]: {
        bg: "rgba(251,191,36,0.08)",
        text: "#fbbf24",
        border: "rgba(251,191,36,0.18)",
        glow: "rgba(251,191,36,0.15)",
        icon: "⬡",
    },
    [NodeType.LocalBranch]: {
        bg: "rgba(34,211,238,0.07)",
        text: "#22d3ee",
        border: "rgba(34,211,238,0.18)",
        glow: "rgba(34,211,238,0.12)",
        icon: "◈",
    },
};