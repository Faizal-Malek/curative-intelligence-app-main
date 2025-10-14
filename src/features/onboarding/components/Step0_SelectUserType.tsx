"use client";

import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, ArrowRight } from 'lucide-react'

export function Step0_SelectUserType({ value, onSelect, onNext }: { 
  value: 'business' | 'influencer' | null; 
  onSelect: (v: 'business' | 'influencer') => void;
  onNext?: () => void;
}) {
  
  const handleSelect = (userType: 'business' | 'influencer') => {
    onSelect(userType);
    // Auto-advance after a short delay for better UX
    if (onNext) {
      setTimeout(() => {
        onNext();
      }, 500);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center max-w-5xl mx-auto px-4">
      <div className="space-y-4">
        <h1 className="text-4xl font-display text-[#3A2F2F] mb-2">Welcome to Curative</h1>
        <p className="text-xl text-[#7A6F6F] max-w-2xl">
          Let&apos;s get you set up for success. Choose your path to get a personalized experience
          tailored to your content creation goals.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Business Owner Option */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 group relative overflow-hidden ${
            value === 'business' 
              ? 'border-[#3A2F2F] bg-[#3A2F2F]/5 shadow-lg transform scale-105' 
              : 'border-[#EFE8D8] hover:border-[#D2B193] hover:transform hover:scale-105'
          }`}
          onClick={() => handleSelect('business')}
        >
          <CardContent className="p-8 text-center space-y-6 relative z-10">
            <div className={`inline-flex p-4 rounded-full transition-all duration-300 ${
              value === 'business' ? 'bg-[#3A2F2F] text-white' : 'bg-[#EFE8D8] text-[#3A2F2F] group-hover:bg-[#D2B193] group-hover:text-white'
            }`}>
              <Building2 size={28} />
            </div>
            <h3 className="text-2xl font-semibold text-[#3A2F2F]">Business Owner</h3>
            <p className="text-base text-[#7A6F6F] leading-relaxed">
              Perfect for businesses looking to establish their brand voice, create consistent content, 
              and reach their target audience effectively.
            </p>
            <ul className="text-sm text-left text-[#7A6F6F] space-y-2">
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Brand identity & voice development
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Target audience analysis
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Business goal alignment
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Professional content strategy
              </li>
            </ul>
            {value === 'business' && (
              <div className="absolute top-4 right-4 bg-[#3A2F2F] text-white rounded-full p-2">
                <ArrowRight size={16} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Creator/Influencer Option */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 group relative overflow-hidden ${
            value === 'influencer' 
              ? 'border-[#3A2F2F] bg-[#3A2F2F]/5 shadow-lg transform scale-105' 
              : 'border-[#EFE8D8] hover:border-[#D2B193] hover:transform hover:scale-105'
          }`}
          onClick={() => handleSelect('influencer')}
        >
          <CardContent className="p-8 text-center space-y-6 relative z-10">
            <div className={`inline-flex p-4 rounded-full transition-all duration-300 ${
              value === 'influencer' ? 'bg-[#3A2F2F] text-white' : 'bg-[#EFE8D8] text-[#3A2F2F] group-hover:bg-[#D2B193] group-hover:text-white'
            }`}>
              <Users size={28} />
            </div>
            <h3 className="text-2xl font-semibold text-[#3A2F2F]">Content Creator</h3>
            <p className="text-base text-[#7A6F6F] leading-relaxed">
              Ideal for influencers and content creators building their personal brand and 
              engaging with their community authentically.
            </p>
            <ul className="text-sm text-left text-[#7A6F6F] space-y-2">
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Personal brand development
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Niche & style definition
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Content consistency
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={14} className="text-[#D2B193] flex-shrink-0" />
                Audience engagement strategies
              </li>
            </ul>
            {value === 'influencer' && (
              <div className="absolute top-4 right-4 bg-[#3A2F2F] text-white rounded-full p-2">
                <ArrowRight size={16} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-[#7A6F6F] max-w-md">
          Don&apos;t worry - you can always change this later in your account settings. We&apos;ll customize 
          your experience based on your selection.
        </p>
        {value && (
          <p className="text-sm font-medium text-[#3A2F2F] bg-[#EFE8D8]/50 px-4 py-2 rounded-lg animate-fade-in">
            Great choice! Proceeding with the {value === 'business' ? 'business' : 'content creator'} flow...
          </p>
        )}
      </div>
    </div>
  )
}