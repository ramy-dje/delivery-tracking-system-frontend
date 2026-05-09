import { CircleAlert, X } from 'lucide-react'
import React, { SetStateAction } from 'react'

function ErrorBaner({ error, setError }: { error: string | null, setError: (value: SetStateAction<string | null>) => void }) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]"
            style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)",
            }}
        >
            <CircleAlert size={15} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-400">
                <X size={15} />
            </button>
        </div>
    )
}

export default ErrorBaner