import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';

function FeedbackButtons({ translationId }) {
    const [status, setStatus] = useState(null); // 'liked', 'disliked', 'submitting'
    const [hasVoted, setHasVoted] = useState(false);

    const handleFeedback = async (type) => {
        if (hasVoted || !translationId) return;

        // Optimistic UI
        setStatus(type);
        setHasVoted(true);

        try {
            await axios.post('/api/feedback', {
                translationId,
                rating: type === 'liked' ? 1 : -1
            });
        } catch (err) {
            console.error('Failed to submit feedback', err);
            // We don't revert UI to avoid jarring user experience for minor failure
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleFeedback('liked')}
                disabled={hasVoted}
                className={clsx(
                    "p-1.5 rounded transition-colors duration-200",
                    status === 'liked'
                        ? "text-green-400 bg-green-900/20"
                        : "text-slate-500 hover:text-green-400 hover:bg-slate-800",
                    hasVoted && status !== 'liked' && "opacity-30 cursor-not-allowed"
                )}
                title="Good result"
            >
                <ThumbsUp size={14} className={clsx(status === 'liked' && "fill-current")} />
            </button>

            <button
                onClick={() => handleFeedback('disliked')}
                disabled={hasVoted}
                className={clsx(
                    "p-1.5 rounded transition-colors duration-200",
                    status === 'disliked'
                        ? "text-red-400 bg-red-900/20"
                        : "text-slate-500 hover:text-red-400 hover:bg-slate-800",
                    hasVoted && status !== 'disliked' && "opacity-30 cursor-not-allowed"
                )}
                title="Bad result"
            >
                <ThumbsDown size={14} className={clsx(status === 'disliked' && "fill-current")} />
            </button>
        </div>
    );
}

export default FeedbackButtons;
