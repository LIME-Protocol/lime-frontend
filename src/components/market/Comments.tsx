import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useComments, usePostComment } from '@/hooks/use-comments';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/hooks/use-comments';

function CommentAvatar({ name }: { name: string }) {
  return (
    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 mt-0.5">
      {name[0].toUpperCase()}
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const displayName = comment.profiles?.username || comment.user_id.slice(0, 8) + '…';

  return (
    <div className="flex gap-3">
      <CommentAvatar name={displayName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold">{displayName}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-[13px] text-foreground/90 leading-relaxed mt-0.5">{comment.content}</p>
      </div>
    </div>
  );
}

function CommentInput({ marketId }: { marketId: string }) {
  const [text, setText] = useState('');
  const postComment = usePostComment(marketId);

  const handlePost = () => {
    if (!text.trim()) return;
    postComment.mutate(text.trim(), {
      onSuccess: () => setText(''),
      onError: () => toast.error('Failed to post comment'),
    });
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePost()}
        placeholder="Share your view…"
        className="flex-1 h-9 px-3 rounded-lg surface-inset text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      <Button size="sm" onClick={handlePost} disabled={postComment.isPending || !text.trim()} className="h-9 px-3">
        {postComment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

export default function Comments({ marketId }: { marketId: string }) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(marketId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Discussion</h3>
        <span className="text-[11px] text-muted-foreground">({comments.length})</span>
      </div>

      {user ? (
        <CommentInput marketId={marketId} />
      ) : (
        <p className="text-xs text-muted-foreground">Sign in to join the discussion.</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No comments yet. Be the first to share your view.</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
}
