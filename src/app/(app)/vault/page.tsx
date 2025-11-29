"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/Toast";
import { useVaultIdeas, type VaultIdeaStatus } from "@/hooks/useVaultIdeas";
import { useVaultTemplates, type VaultTemplate } from "@/hooks/useVaultTemplates";
import { Lightbulb, Upload, Plus, Search, Tag, Eye, Edit2, Trash2, FileText, Layout, CalendarClock, Send, CheckCircle2, XCircle } from "lucide-react";
import { SkeletonVaultCard } from "@/components/ui/Skeleton";
import { StorageProgressBar } from "@/components/dashboard/StorageProgressBar";

const STATUS_STYLES: Record<VaultIdeaStatus, string> = {
  DRAFT: "bg-[#F3E6D6] text-[#8B6F47]",
  READY: "bg-[#D4F4DD] text-[#166534]",
  SCHEDULED: "bg-[#DBEAFE] text-[#1E40AF]",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

const formatStatus = (status: VaultIdeaStatus) => status.toLowerCase();

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
];

const getDefaultScheduleInput = () => {
  const date = new Date();
  date.setHours(date.getHours() + 3, 0, 0, 0);
  return toLocalDateInputValue(date);
};

const toLocalDateInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const stringifyTemplateStructure = (structure?: Record<string, unknown>) => {
  if (!structure || typeof structure !== "object") return "";
  try {
    return JSON.stringify(structure, null, 2);
  } catch {
    return String(structure);
  }
};

type NewIdeaState = {
  title: string;
  content: string;
  tags: string;
  templateId: string | null;
};

const INITIAL_NEW_IDEA: NewIdeaState = {
  title: "",
  content: "",
  tags: "",
  templateId: null,
};

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState<'ideas' | 'templates'>('ideas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIdea, setNewIdea] = useState<NewIdeaState>(INITIAL_NEW_IDEA);
  const [isSavingIdea, setIsSavingIdea] = useState(false);
  const [scheduleIdeaId, setScheduleIdeaId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    platform: PLATFORM_OPTIONS[0].value,
    scheduledAt: getDefaultScheduleInput(),
    caption: '',
    mediaUrl: '',
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetNewIdeaForm = () => setNewIdea({ ...INITIAL_NEW_IDEA });
  const closeAddIdeaModal = () => {
    setShowAddModal(false);
    resetNewIdeaForm();
  };

  const {
    ideas,
    loading: ideasLoading,
    error: ideasError,
    count: ideaCount,
    createIdea,
    updateIdea,
    deleteIdea,
    refresh: refreshIdeas,
  } = useVaultIdeas();

  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
  } = useVaultTemplates(true);

  const selectedIdea = useMemo(
    () => ideas.find((idea) => idea.id === scheduleIdeaId) || null,
    [ideas, scheduleIdeaId]
  );

  const filteredIdeas = useMemo(() => {
    if (!searchQuery) return ideas;
    const query = searchQuery.toLowerCase();
    return ideas.filter((idea) =>
      idea.title.toLowerCase().includes(query) ||
      idea.content.toLowerCase().includes(query) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [ideas, searchQuery]);

  const handleAddIdea = async () => {
    if (!newIdea.title || !newIdea.content) return;
    try {
      setIsSavingIdea(true);
      const formattedTags = newIdea.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const metadata = newIdea.templateId ? { templateId: newIdea.templateId } : undefined;
      await createIdea({
        title: newIdea.title,
        content: newIdea.content,
        tags: formattedTags,
        metadata,
      });
      closeAddIdeaModal();
      toast({ title: 'Idea saved', description: 'We added your idea to the vault.', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Unable to save idea',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSavingIdea(false);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea(id);
      toast({ title: 'Idea deleted', description: 'The idea was removed from your vault.', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Unable to delete idea',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error',
      });
    }

  };

  const handleApproveIdea = async (id: string) => {
    try {
      await updateIdea(id, { status: 'READY' });
      toast({ title: 'Idea approved', description: 'Status set to READY.', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Unable to approve idea',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleRejectIdea = async (id: string) => {
    try {
      await updateIdea(id, { status: 'ARCHIVED' });
      toast({ title: 'Idea rejected', description: 'Moved to archived.', variant: 'default' });
    } catch (err) {
      toast({
        title: 'Unable to reject idea',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleUseTemplate = (template: VaultTemplate) => {
    const structuredContent = stringifyTemplateStructure(template.structure);
    const composedContent = [template.description, structuredContent && `Template Structure:\n${structuredContent}`]
      .filter(Boolean)
      .join("\n\n");
    setNewIdea({
      title: template.title,
      content: composedContent || template.title,
      tags: template.category ? template.category.toLowerCase() : '',
      templateId: template.id,
    });
    setShowAddModal(true);
  };

  const handleOpenScheduleModal = (ideaId: string) => {
    const idea = ideas.find((item) => item.id === ideaId);
    setScheduleIdeaId(ideaId);
    setScheduleForm({
      platform: PLATFORM_OPTIONS[0].value,
      scheduledAt: getDefaultScheduleInput(),
      caption: idea?.content ?? '',
      mediaUrl: '',
    });
    setScheduleError(null);
  };

  const handleScheduleIdea = async () => {
    if (!scheduleIdeaId || !selectedIdea) return;
    if (!scheduleForm.scheduledAt || !scheduleForm.caption.trim()) {
      setScheduleError('Please add a caption and schedule time.');
      return;
    }

    try {
      setIsScheduling(true);
      const response = await fetch('/api/social-media/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: scheduleIdeaId,
          caption: scheduleForm.caption.trim(),
          platform: scheduleForm.platform,
          scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
          mediaUrl: scheduleForm.mediaUrl || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to schedule idea');
      }

      await refreshIdeas();
      toast({ title: 'Post scheduled', description: 'We queued this idea for publishing.', variant: 'success' });
      setScheduleIdeaId(null);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Unable to schedule idea');
    } finally {
      setIsScheduling(false);
    }
  };

  const scheduleModalOpen = Boolean(scheduleIdeaId && selectedIdea);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#B89B7B]">
            Content Vault
          </p>
          <h1 className="text-2xl font-semibold text-[#2F2626] sm:text-3xl">
            Ideas and assets in one place
          </h1>
          <p className="text-sm text-[#6B5E5E]">
            {ideasLoading ? 'Loading ideas…' : `${ideaCount} ideas saved`} • {templatesLoading ? 'Loading templates…' : `${templates.length} templates available`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Idea
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>
      </header>

      {/* Storage Progress Bar */}
      <StorageProgressBar />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E9DCC9]">
        <button
          onClick={() => setActiveTab('ideas')}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'ideas'
              ? 'text-[#2F2626]'
              : 'text-[#7A6F6F] hover:text-[#2F2626]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            My Ideas ({ideasLoading ? '—' : ideaCount})
          </div>
          {activeTab === 'ideas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D2B193] to-[#B89B7B]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'templates'
              ? 'text-[#2F2626]'
              : 'text-[#7A6F6F] hover:text-[#2F2626]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Templates ({templatesLoading ? '—' : templates.length})
          </div>
          {activeTab === 'templates' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D2B193] to-[#B89B7B]"></div>
          )}
        </button>
      </div>

      {/* Search Bar */}
      {activeTab === 'ideas' && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B89B7B]" />
          <input
            type="text"
            placeholder="Search ideas, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E9DCC9] bg-white px-12 py-3 text-sm text-[#2F2626] placeholder-[#B89B7B] transition-all focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'ideas' ? (
        ideasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <SkeletonVaultCard key={key} style={{ animationDelay: `${key * 100}ms` }} />
            ))}
          </div>
        ) : ideasError ? (
          <Card padding="lg" error={ideasError} />
        ) : filteredIdeas.length === 0 ? (
          <Card
            padding="lg"
            className="border-dashed border-[#EADCCE] bg-gradient-to-br from-white to-[#FBFAF8]"
          >
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D2B193] to-[#B89B7B] shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-[#2F2626]">
                  {searchQuery ? 'No ideas found' : 'Start your creative vault'}
                </h2>
                <p className="text-sm text-[#6B5E5E] max-w-md">
                  {searchQuery
                    ? 'Try a different search term or add a new idea'
                    : 'Save your content ideas, drafts, and inspiration all in one place'}
                </p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Idea
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea, index) => (
              <Card
                key={idea.id}
                padding="md"
                className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-3xl ${
                  index % 4 === 2
                    ? "bg-gradient-to-br from-[#3A2F2F] via-[#4A3F3F] to-[#3A2F2F] text-white border-transparent shadow-[0_24px_65px_rgba(0,0,0,0.3)]"
                    : "bg-gradient-to-br from-white to-[#FBFAF8] border-[#E9DCC9]"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-md ${
                        index % 4 === 2
                          ? "bg-white/10 backdrop-blur-sm border border-white/20"
                          : "bg-gradient-to-br from-[#D2B193] to-[#B89B7B]"
                      }`}>
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        index % 4 === 2
                          ? "bg-white/20 text-white border border-white/30"
                          : STATUS_STYLES[idea.status] || STATUS_STYLES.DRAFT
                      }`}>
                        {formatStatus(idea.status)}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleApproveIdea(idea.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Approve (Ready)"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenScheduleModal(idea.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E9DCC9]/70 text-[#8B6F47] hover:bg-[#D2B193] hover:text-white transition-colors"
                        aria-label="Schedule idea"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRejectIdea(idea.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        title="Reject (Archive)"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className={`font-semibold mb-2 ${
                    index % 4 === 2 ? "text-white" : "text-[#2F2626]"
                  }`}>{idea.title}</h3>
                  <p className={`text-sm line-clamp-3 mb-3 flex-grow ${
                    index % 4 === 2 ? "text-white/80" : "text-[#6B5E5E]"
                  }`}>
                    {idea.content}
                  </p>

                  <div className={`flex items-center justify-between text-xs pt-3 border-t ${
                    index % 4 === 2
                      ? "text-white/70 border-white/20"
                      : "text-[#7A6F6F] border-[#E9DCC9]"
                  }`}>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      <div className="flex gap-1 flex-wrap">
                        {idea.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-full ${
                            index % 4 === 2
                              ? "bg-white/10 text-white border border-white/20"
                              : "bg-[#F7F3ED] text-[#7A6F6F]"
                          }`}>
                            {tag}
                          </span>
                        ))}
                        {idea.tags.length > 2 && (
                          <span className={`px-2 py-0.5 rounded-full ${
                            index % 4 === 2
                              ? "bg-white/10 text-white border border-white/20"
                              : "bg-[#F7F3ED] text-[#7A6F6F]"
                          }`}>
                            +{idea.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <span>{formatDate(idea.createdAt)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : templatesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <SkeletonVaultCard key={key} style={{ animationDelay: `${key * 100}ms` }} />
          ))}
        </div>
      ) : templatesError ? (
        <Card padding="lg" error={templatesError} />
      ) : templates.length === 0 ? (
        <Card padding="lg" className="border-dashed border-[#EADCCE] bg-gradient-to-br from-white to-[#FBFAF8]">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D2B193] to-[#B89B7B] shadow-lg">
              <Layout className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#2F2626]">Templates are on the way</h2>
              <p className="text-sm text-[#6B5E5E] max-w-md">
                We will populate your workspace with reusable templates once the automation run completes.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              padding="md"
              className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-[#FBFAF8] border-[#E9DCC9]"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F7F3ED]/60 border-2 border-[#E9DCC9]/60 text-3xl font-semibold text-[#B89B7B] group-hover:bg-[#F7F3ED] group-hover:border-[#D2B193]/40 group-hover:scale-105 transition-all duration-300">
                  {template.title.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D2B193]/0 to-[#B89B7B]/5 group-hover:from-[#D2B193]/10 group-hover:to-[#B89B7B]/10 transition-all duration-300"></div>
                </div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#F7F3ED] text-[#7A6F6F] font-medium">
                    {template.category}
                  </span>
                  <h3 className="font-semibold text-[#2F2626] mt-2 mb-1">
                    {template.title}
                  </h3>
                  <p className="text-sm text-[#6B5E5E]">
                    {template.description || 'Reusable structure generated from your brand inputs.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2F2626]">Add New Idea</h2>
              <button
                onClick={closeAddIdeaModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B5E5E] hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Product Launch Campaign"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#2F2626] placeholder-gray-400 focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe your idea, draft content, or add notes..."
                  value={newIdea.content}
                  onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#2F2626] placeholder-gray-400 focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 resize-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., campaign, social media, instagram"
                  value={newIdea.tags}
                  onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#2F2626] placeholder-gray-400 focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddIdea}
                  disabled={!newIdea.title || !newIdea.content || isSavingIdea}
                  className="flex-1 bg-[#D2B193] hover:bg-[#C2A183] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isSavingIdea ? 'Saving...' : 'Save Idea'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={closeAddIdeaModal}
                  className="flex-1 border border-gray-300 bg-white text-[#2F2626] hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Idea Modal */}
      {scheduleModalOpen && selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#B89B7B]">Schedule</p>
                <h2 className="text-xl font-semibold text-[#2F2626]">{selectedIdea.title}</h2>
                <p className="text-sm text-[#6B5E5E] mt-1 line-clamp-2">{selectedIdea.content}</p>
              </div>
              <button
                onClick={() => setScheduleIdeaId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B5E5E] hover:bg-gray-100 transition-colors"
                aria-label="Close schedule modal"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2F2626]">Platform</label>
                  <select
                    value={scheduleForm.platform}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, platform: event.target.value }))}
                    className="w-full rounded-lg border border-[#E9DCC9] bg-white px-4 py-2.5 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2F2626]">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledAt}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                    className="w-full rounded-lg border border-[#E9DCC9] bg-white px-4 py-2.5 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">Caption</label>
                <textarea
                  rows={6}
                  value={scheduleForm.caption}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, caption: event.target.value }))}
                  className="w-full rounded-lg border border-[#E9DCC9] bg-white px-4 py-2.5 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Media URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://your-cdn.com/asset.jpg"
                  value={scheduleForm.mediaUrl}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, mediaUrl: event.target.value }))}
                  className="w-full rounded-lg border border-[#E9DCC9] bg-white px-4 py-2.5 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                />
                <p className="mt-1 text-xs text-[#8B6F47]">Attach hosted media to auto-fill creative when the post publishes.</p>
              </div>

              {scheduleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {scheduleError}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setScheduleIdeaId(null)}
                  disabled={isScheduling}
                  className="sm:min-w-[140px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleIdea}
                  disabled={isScheduling}
                  className="sm:min-w-[180px] bg-[#2F2626] hover:bg-[#463737]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isScheduling ? 'Scheduling...' : 'Schedule Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
