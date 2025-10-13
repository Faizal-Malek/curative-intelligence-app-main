"use client";

import { useContentGenerationStatus } from "@/features/content-generation/hooks/useContentGenerationStatus";
import { ContentReviewScreen } from "@/features/content-generation/components/ContentReviewScreen";
import React from "react";
import Loader from "@/components/ui/Loader";

export function PlanReviewClient({ batchId }: { batchId: string }) {
  // Fetch the content generation status and related data for the given batchId
  const { status, posts, error, isLoading } = useContentGenerationStatus(batchId);

  // Display a loading message while the content generation status is being fetched
  if (!batchId || isLoading) {
    return (
      <div className="relative min-h-[70vh] w-full overflow-hidden">
        <Loader label="Analyzing your brand" />
      </div>
    );
  }

  // Render the ContentReviewScreen component with the fetched data once loading is complete
  return (
    <ContentReviewScreen
      status={status}
      posts={posts}
      error={error}
      batchId={batchId}
      //isLoading ={isLoading}
    />
  );
}