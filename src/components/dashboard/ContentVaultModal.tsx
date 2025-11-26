"use client";

import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Lightbulb, Tag, Calendar, Search, Trash2, Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVaultIdeas } from '@/hooks/useVaultIdeas';

interface ContentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaAdded?: () => void;
}
export function ContentVaultModal({ isOpen, onClose, onIdeaAdded }: ContentVaultModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'add'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [newIdea, setNewIdea] = useState({ title: '', content: '', tags: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { ideas, loading, error, createIdea, deleteIdea, refresh } = useVaultIdeas({ enabled: isOpen });

  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  const handleAddIdea = async () => {
    if (!newIdea.title || !newIdea.content) return;
    try {
      await createIdea({
        title: newIdea.title,
        content: newIdea.content,
        tags: newIdea.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setNewIdea({ title: '', content: '', tags: '' });
      setActiveTab('browse');
      setFormError(null);
      onIdeaAdded?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save idea');
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea(id);
      setExpandedId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to delete idea');
    }
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [ideas, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'bg-[#D4F4DD] text-[#166534]';
      case 'SCHEDULED':
        return 'bg-[#DBEAFE] text-[#1E40AF]';
      case 'ARCHIVED':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-[#F3E6D6] text-[#8B6F47]';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2F2F]/40 backdrop-blur-md animate-fade-in">
      <div className="relative mx-4 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-[#D2B193]/30 bg-gradient-to-br from-[#6B5E5E]/95 via-[#5A4F4F]/95 to-[#4A3F3F]/95 shadow-[0_25px_100px_rgba(58,47,47,0.4)] backdrop-blur-xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-[#6B5E5E]/80 via-[#5A4F4F]/80 to-[#6B5E5E]/80 backdrop-blur-xl px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D2B193] to-[#B89B7B] shadow-lg transition-transform duration-300 hover:scale-105">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Content Vault</h2>
                <p className="text-xs text-white/70">{ideas.length} ideas stored</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white shadow-sm transition-all hover:bg-white/20 hover:shadow-md hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'browse'
                  ? 'bg-white/90 text-[#2F2626] shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                Browse Ideas ({ideas.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'add'
                  ? 'bg-white/90 text-[#2F2626] shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Idea
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'browse' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search ideas, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-10 py-3 text-sm text-white placeholder-white/50 transition-all focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 focus:bg-white/15"
                />
              </div>

              {loading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
                  Loading your personalized ideas…
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Ideas List */}
              {!loading && filteredIdeas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <Lightbulb className="h-8 w-8 text-white/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">No ideas found</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {searchQuery ? 'Try a different search term' : 'Start by adding your first idea'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setActiveTab('add')} className="mt-4">
                      Add Your First Idea
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="group rounded-2xl border border-white/20 bg-white/90 p-4 transition-all hover:border-[#D2B193] hover:shadow-lg hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-[#2F2626]">{idea.title}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(idea.status)}`}>
                              {idea.status}
                            </span>
                          </div>
                          
                          <p className={`text-sm text-[#6B5E5E] ${expandedId === idea.id ? '' : 'line-clamp-2'}`}>
                            {idea.content}
                          </p>

                          {idea.content.length > 100 && (
                            <button
                              onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
                              className="mt-2 text-xs font-medium text-[#D2B193] hover:text-[#B89B7B]"
                            >
                              {expandedId === idea.id ? 'Show less' : 'Read more'}
                            </button>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <Tag className="h-3 w-3 text-[#B89B7B]" />
                            <div className="flex flex-wrap gap-1.5">
                              {idea.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#F7F3ED] px-2 py-0.5 text-xs text-[#7A6F6F]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="ml-auto flex items-center gap-1 text-xs text-[#B89B7B]">
                              <Calendar className="h-3 w-3" />
                              {idea.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F3ED] text-[#7A6F6F] transition-colors hover:bg-[#D2B193] hover:text-white">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIdea(idea.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Product Launch Campaign"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 transition-all focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 focus:bg-white/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Describe your idea, draft content, or add notes..."
                  value={newIdea.content}
                  onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                  rows={8}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 transition-all focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 resize-none focus:bg-white/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., campaign, social media, instagram"
                  value={newIdea.tags}
                  onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 transition-all focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 focus:bg-white/15"
                />
                <p className="mt-1 text-xs text-white/60">Separate tags with commas for easy filtering</p>
              </div>

              {formError && (
                <p className="text-sm text-red-300">{formError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddIdea}
                  disabled={!newIdea.title || !newIdea.content}
                  className="flex-1"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Save to Vault
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setNewIdea({ title: '', content: '', tags: '' });
                    setActiveTab('browse');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
