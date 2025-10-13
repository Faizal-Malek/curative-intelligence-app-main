// src/features/content-generation/hooks/useContentGenerationStatus.ts
"use client";

import { useState, useEffect, useRef } from 'react';

// Define the possible statuses our job can have, plus an initial state.
type JobStatus = 'IDLE' | 'PENDING' | 'COMPLETE' | 'FAILED';

// Define the structure of the Post data we expect from the API
interface GeneratedPost {
  id: string;
  content: {
    post_idea: string;
    caption: string;
    image_suggestion: string;
    video_suggestion: string;
  };
  status: string;
}

// Define the structure of the data returned by our hook
interface UseContentGenerationStatusReturn {
  status: JobStatus;
  posts: GeneratedPost[];
  error: string | null;
  isLoading: boolean; // Added for developer convenience
}

/**
 * A custom React hook to poll the content generation status API.
 * @param batchId The ID of the generation job to check.
 * @returns An object with the current status, loading state, the resulting posts, and any error.
 */
export function useContentGenerationStatus(batchId: string | null): UseContentGenerationStatusReturn {
  const [status, setStatus] = useState<JobStatus>('IDLE');
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // isLoading is true whenever the status is PENDING
  const isLoading = status === 'PENDING';

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!batchId) {
      setStatus('IDLE');
      return;
    }

    // Reset state when a new batchId is provided
    setStatus('PENDING');
    setPosts([]);
    setError(null);

    const poll = async () => {
      try {
        const response = await fetch(`/api/content/generation-status/${batchId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch job status');
        }
        const data = await response.json();

        if (data.status === 'COMPLETE' || data.status === 'FAILED') {
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
          }
          setStatus(data.status);

          if (data.status === 'COMPLETE') {
            setPosts(data.posts);
          } else {
            setError('Content generation failed. Please try again.');
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while checking status.');
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        setStatus('FAILED');
      }
    };

    // Start polling immediately and then every 40 seconds.
    console.log(`[POLLING] Starting poll for batch ${batchId} - will poll every 40 seconds`);
    poll();
    intervalIdRef.current = setInterval(() => {
      console.log(`[POLLING] 40-second interval triggered for batch ${batchId}`);
      poll();
    }, 40000);

    // Cleanup function to stop polling when the component unmounts.
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [batchId]);

  return { status, posts, error, isLoading };
}
