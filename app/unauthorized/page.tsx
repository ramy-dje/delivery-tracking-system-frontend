export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-4">
            <div className="bg-[#0a0c12]/80 border border-white/5 rounded-2xl p-8 max-w-lg text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-4">You do not have permission to view this page.</p>
                <a href="/" className="text-amber-400">Go back home</a>
            </div>
        </div>
    );
}
