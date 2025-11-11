"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, Upload } from "lucide-react";

export default function VaultPage() {
  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#B89B7B]">
            Content Vault
          </p>
          <h1 className="text-2xl font-semibold text-[#2F2626] sm:text-3xl">
            Ideas and assets in one place
          </h1>
          <p className="text-sm text-[#6B5E5E]">
            Organize inspiration, drafts, and ready-to-post pieces for every
            channel.
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Upload Asset
        </Button>
      </header>

      <Card
        padding="lg"
        className="border-dashed border-[#EADCCE] bg-white/80 text-[#2F2626]"
      >
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3E6D6] text-[#C2671B]">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Bring your ideas together</h2>
            <p className="text-sm text-[#6B5E5E] max-w-md">
              Save drafts, inspiration, and finalized assets. Tag them for fast
              retrieval, and share with your team when you are ready.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto">Add First Idea</Button>
            <Button variant="secondary" className="w-full sm:w-auto">
              Browse Templates
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
