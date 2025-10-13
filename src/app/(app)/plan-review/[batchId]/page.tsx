import { PlanReviewClient } from "./PlanReviewClient";

export default async function PlanReviewPage({ params }: { params: { batchId: string } }) {
  const { batchId } = params;

  return <PlanReviewClient batchId={batchId} />;
}
