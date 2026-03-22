import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string | null } | null;
}

export default function Comments({ marketId }: { marketId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('market_id', marketId)
      .order('created_at', { ascending: false })
      .limit(50);
    setComments((data as Comment[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`comments-${marketId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `market_id=eq.${marketId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [marketId]);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from('comments').insert({
      market_id: marketId,
      user_id: user.id,
      content: text.trim(),
    });
    if (error) {
      toast.error('Failed to post comment');
    } else {
      setText('');
    }
    setPosting(false);
  };

  const displayName = (c: Comment) => {
    if (c.profiles?.username) return c.profiles.username;
    return c.user_id.slice(0, 8) + '…';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Discussion</h3>
        <span className="text-[11px] text-muted-foreground">({comments.length})</span>
      </div>

      {/* Post box */}
      {user ? (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePost()}
            placeholder="Share your view…"
            className="flex-1 h-9 px-3 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <Button size="sm" onClick={handlePost} disabled={posting || !text.trim()} className="h-9 px-3">
            {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Sign in to join the discussion.</p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No comments yet. Be the first to share your view.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 mt-0.5">
                {displayName(c)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] font-semibold">{displayName(c)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-[13px] text-foreground/90 leading-relaxed mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
