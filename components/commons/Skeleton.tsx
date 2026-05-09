interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-white/5 ${className}`}
        />
    );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
    return (
        <div className="divide-y divide-white/4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="w-9 h-9 rounded-lg shrink-0" />

                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-2.5 w-24" />
                    </div>

                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-20 hidden md:block" />

                    <div className="flex gap-1.5 ml-auto">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}


export function SkeletonCard() {
    return (
        <div className="p-5 rounded-xl border border-white/5 space-y-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}


export function SkeletonForm() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />

            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />

            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    );
}