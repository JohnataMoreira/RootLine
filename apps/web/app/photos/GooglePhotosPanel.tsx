'use client'

import { useState } from 'react'
import { importFromGooglePhotos } from './google-import'

type GoogleStatus = 'idle' | 'importing' | 'done' | 'error'

export function GooglePhotosPanel({
    isConnected,
    lastRun
}: {
    isConnected: boolean,
    lastRun?: {
        status: string,
        imported_count: number,
        skipped_count: number,
        finished_at: string | null,
        error_message?: string
    } | null
}) {
    // HOTFIX FOR BETA: Hide Google Photos integration until OAuth verification is complete
    return null
}
