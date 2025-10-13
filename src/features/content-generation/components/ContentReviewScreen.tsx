// src/features/content-generation/components/ContentReviewScreen.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostPreviewCard } from './PostPreviewCard'; // We will create this next
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define the shape of the data we expect from the hook
interface Post {
  id: string;
  content: any;
  status: string;
  flagged?: boolean; // Standardized flag instead of moderationWarning
}

interface ContentReviewScreenProps {
  status: 'IDLE' | 'PENDING' | 'COMPLETE' | 'FAILED';
  posts: Post[];
  error: string | null;
  batchId: string; // Added batchId to props
}

export const ContentReviewScreen: React.FC<ContentReviewScreenProps> = ({ status, posts: initialPosts, error, batchId }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const router = useRouter();

  // When the initial posts are loaded from the hook, update our local state
  useEffect(() => {
    setPosts(initialPosts);
    // Automatically select the first post in the list by default
    if (initialPosts.length > 0 && !selectedPostId) {
      setSelectedPostId(initialPosts[0].id);
    }
  }, [initialPosts, selectedPostId]);

  const selectedPost = posts.find(p => p.id === selectedPostId);

  // --- UI for Loading State ---
  // Display a friendly message while content is being generated
  if (status === 'PENDING' || status === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh text-center p-8 bg-brand-alabaster">
        <h2 className="text-3xl font-display text-brand-dark-umber">Crafting your content plan...</h2>
        <p className="mt-2 text-brand-text-secondary">Our AI is working its magic. This may take up to a minute.</p>
        {/* We can add a more sophisticated loading animation here later */}
      </div>
    );
  }

  // --- UI for Error State ---
  // Show error message and option to return to dashboard if generation fails
  if (status === 'FAILED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh text-center p-8 bg-brand-alabaster">
        <h2 className="text-3xl font-display text-red-500">Generation Failed</h2>
        <p className="mt-2 text-brand-text-secondary">{error || "An unexpected error occurred."}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-6">
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // --- UI for Empty State ---
  // Inform user if no posts were generated and provide navigation back to dashboard
  if (posts.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-dvh text-center p-8 bg-brand-alabaster">
              <h2 className="text-3xl font-display text-brand-dark-umber">No posts were generated.</h2>
              <p className="mt-2 text-brand-text-secondary">Something went wrong. Please try again later.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-6">Back to Dashboard</Button>
          </div>
      )
  }

  // --- UI for Success State ---
  // Display list of generated posts and detailed preview of the selected post
  // Placeholder comments indicate where approve/reject API integration can be added
  return (
    <div className="flex min-h-dvh bg-brand-alabaster overflow-hidden">
      {/* Left Column: Post List */}
      <div className="w-1/3 border-r border-brand-cream overflow-y-auto p-4 space-y-2">
        <h2 className="text-xl font-display p-2 text-brand-dark-umber">Your Generated Plan</h2>
        {posts.map(post => (
          <div
            key={post.id}
            onClick={() => setSelectedPostId(post.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-colors border",
              selectedPostId === post.id 
                ? "bg-brand-cream border-brand-tan" 
                : "border-transparent hover:bg-brand-cream/50"
            )}
          >
            <p className="font-semibold truncate text-brand-dark-umber">{post.content?.post_idea || 'Untitled Post'}</p>
            <p className="text-sm text-brand-text-secondary capitalize">{post.status.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Right Column: Post Preview */}
      <div className="w-2/3 overflow-y-auto p-8">
        {selectedPost ? (
          <PostPreviewCard 
            post={selectedPost} 
            setPosts={setPosts} 
            // Placeholder: Add approve/reject handlers here with batchId and post.id
            // e.g. onApprove={() => approvePost(batchId, selectedPost.id)}
            // e.g. onReject={() => rejectPost(batchId, selectedPost.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-brand-text-secondary">Select a post to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};
