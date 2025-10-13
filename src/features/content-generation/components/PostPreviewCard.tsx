// src/features/content-generation/components/PostPreviewCard.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define the shape of the Post object to match our data
interface Post {
  id: string;
  content: {
    post_idea: string;
    caption: string;
    image_suggestion: string;
    video_suggestion: string;
  };
  status: string;
  moderationWarning?: boolean;
}

interface PostPreviewCardProps {
  post: Post;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export const PostPreviewCard: React.FC<PostPreviewCardProps> = ({ post, setPosts }) => {
  const [isLoading, setIsLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: 'APPROVED' | 'REJECTED') => {
    // Set loading state specific to the button being clicked
    setIsLoading(newStatus === 'APPROVED' ? 'approve' : 'reject');
    setError(null);
    try {
      const response = await fetch('/api/content/post-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update post status.');
      }

      const updatedPost = await response.json();

      // Update the local state in the parent component for immediate UI feedback using backend response
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id ? { ...p, status: updatedPost.status } : p
        )
      );

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>{post.content.post_idea || 'Untitled Post'}</CardTitle>
        {/* Using our brand colors for the warning banner */}
        {post.moderationWarning && (
            <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 rounded-lg text-sm">
                <strong>Moderation Warning:</strong> This content may require review to ensure it aligns with your brand's voice.
            </div>
        )}
        {/* Display current post status */}
        <div className="mt-2 text-sm font-medium text-brand-dark-umber">
          Status: <span className={cn(
            post.status === 'APPROVED' ? 'text-green-600' :
            post.status === 'REJECTED' ? 'text-red-600' :
            'text-gray-600'
          )}>{post.status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-brand-dark-umber mb-2">Caption</h4>
          {/* Using our brand cream for the background gives a softer, on-brand look */}
          <div className="bg-brand-cream/50 rounded-md p-4 whitespace-pre-wrap text-brand-text-secondary">
            {post.content.caption}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-brand-dark-umber mb-2">Image Suggestion</h4>
          <p className="text-brand-text-secondary">{post.content.image_suggestion}</p>
        </div>
        <div>
          <h4 className="font-semibold text-brand-dark-umber mb-2">Video Suggestion</h4>
          <p className="text-brand-text-secondary">{post.content.video_suggestion}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-brand-cream">
            <Button 
              variant="secondary" 
              onClick={() => handleStatusUpdate('REJECTED')} 
              disabled={isLoading !== null || post.status !== 'DRAFT'}
            >
              {isLoading === 'reject' ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleStatusUpdate('APPROVED')} 
              disabled={isLoading !== null || post.status !== 'DRAFT'}
            >
              {isLoading === 'approve' ? 'Approving...' : 'Approve'}
            </Button>
        </div>

        {/* Display any API errors */}
        {error && <p className="text-red-500 text-sm text-right">{error}</p>}

      </CardContent>
    </Card>
  );
};
