import { notFound } from "next/navigation";
import { PlanReviewClient } from "./PlanReviewClient";

export default async function PlanReviewPage({
  params,
}: {
  params: Promise<{ batchId: string | string[] | undefined }>;
}) {
  const { batchId } = await params;
  const normalizedBatchId = Array.isArray(batchId) ? batchId[0] : batchId;

  if (!normalizedBatchId) {
    notFound();
  }

  return <PlanReviewClient batchId={normalizedBatchId} />;
}
