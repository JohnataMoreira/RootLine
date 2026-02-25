'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getPhotoComments, postPhotoComment, type PhotoComment } from '@/app/photos/comments/actions'
import { Loader2, Send, MessageSquare } from 'lucide-react'

export function CommentSection({ photoId }: { photoId: string }) {
    const [comments, setComments] = useState<PhotoComment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [isPosting, setIsPosting] = useState(false)
    const supabase = createClient()

    const fetchComments = useCallback(async () => {
        setIsLoading(true)
        const data = await getPhotoComments(photoId)
        setComments(data)
        setIsLoading(false)
    }, [photoId])

    useEffect(() => {
        fetchComments()

        // Realtime Subscription
        const channel = supabase
            .channel(`photo_comments:${photoId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'photo_comments',
                    filter: `photo_id=eq.${photoId}`
                },
                async (payload) => {
                    // When a new comment is inserted, we fetch the full object 
                    // (to get the profile information which is not in the payload)
                    const { data, error } = await supabase
                        .from('photo_comments')
                        .select(`
                            *,
                            profiles:profile_id (
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()

                    if (data) {
                        setComments(prev => {
                            // Avoid duplicates
                            if (prev.some(c => c.id === data.id)) return prev
                            return [...prev, data as unknown as PhotoComment]
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [photoId, fetchComments, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || isPosting) return

        setIsPosting(true)
        const result = await postPhotoComment(photoId, newComment)
        if (result.success) {
            setNewComment('')
        } else {
            alert(result.error)
        }
        setIsPosting(false)
    }

    return (
        <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col max-h-[400px]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-white/90">Comentários</h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-center text-white/40 text-xs py-4">
                        Nenhum comentário ainda. Seja o primeiro!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            {comment.profiles.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={comment.profiles.avatar_url}
                                    alt={comment.profiles.full_name || 'U'}
                                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {comment.profiles.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-white/80">
                                        {comment.profiles.full_name || 'Usuário'}
                                    </span>
                                    <span className="text-[9px] text-white/30">
                                        {new Date(comment.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-white/70 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/20 rounded-b-2xl">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        disabled={isPosting}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                    />
                    <button
                        type="submit"
                        disabled={isPosting || !newComment.trim()}
                        className="absolute right-1 text-primary hover:text-white transition-colors p-2 disabled:opacity-30"
                    >
                        {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </div>
    )
}
