'use client';

import { useState, useEffect } from 'react';
import { Check, X, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

// Social media platform interfaces
interface SocialMediaAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  username?: string;
  isConnected: boolean;
  lastSync?: Date;
  followerCount?: number;
  profileImage?: string;
}

interface SocialMediaPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  limitations?: string[];
  authUrl?: string;
}

const socialPlatforms: SocialMediaPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    description: 'Connect your Instagram Business account to import posts, stories, and engagement analytics.',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    limitations: [
      'Requires Instagram Business Account',
      'Basic Display API has limited metrics',
      'Stories insights require Instagram Graph API',
      'Real-time data requires webhook setup'
    ],
    authUrl: '/api/auth/instagram'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    description: 'Import your Facebook page insights, post engagement, and audience demographics.',
    color: 'bg-gradient-to-r from-blue-600 to-blue-700',
    limitations: [
      'Requires Facebook Page (not personal profile)',
      'App Review required for advanced permissions',
      'Limited to pages you manage',
      'Some metrics require Marketing API access'
    ],
    authUrl: '/api/auth/facebook'
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    icon: '🐦',
    description: 'Analyze your tweets, engagement rates, and follower growth over time.',
    color: 'bg-gradient-to-r from-sky-500 to-blue-600',
    limitations: [
      'Twitter API v2 Essential access (free tier)',
      'Limited to 2M tweets per month',
      'Advanced metrics require paid API access',
      'Real-time streaming has separate limits'
    ],
    authUrl: '/api/auth/twitter'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Track your professional content performance and network growth.',
    color: 'bg-gradient-to-r from-blue-700 to-blue-800',
    limitations: [
      'LinkedIn Marketing API access required',
      'Limited to Company Pages for full analytics',
      'Personal profile metrics are restricted',
      'Requires LinkedIn Partner Program for advanced features'
    ],
    authUrl: '/api/auth/linkedin'
  }
];

export default function SocialMediaConnections() {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/social-media/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        // Mock data for development
        setAccounts([
          {
            id: '1',
            platform: 'instagram',
            username: 'sample_user',
            isConnected: false,
            followerCount: 1250,
          },
          {
            id: '2',
            platform: 'facebook',
            username: 'Sample Page',
            isConnected: false,
            followerCount: 2800,
          },
          {
            id: '3',
            platform: 'twitter',
            username: '@sample_user',
            isConnected: false,
            followerCount: 890,
          },
          {
            id: '4',
            platform: 'linkedin',
            username: 'Sample Company',
            isConnected: false,
            followerCount: 450,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      // Set mock data on error
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      const platformData = socialPlatforms.find(p => p.id === platform);
      if (platformData?.authUrl) {
        // In a real implementation, this would redirect to OAuth flow
        window.open(platformData.authUrl, '_blank', 'width=600,height=600');
        
        // Simulate connection after a delay
        setTimeout(() => {
          setAccounts(prev => prev.map(account => 
            account.platform === platform 
              ? { ...account, isConnected: true, lastSync: new Date() }
              : account
          ));
          setConnecting(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      // TODO: Add actual API call to disconnect
      setAccounts(prev => prev.map(account => 
        account.platform === platform 
          ? { ...account, isConnected: false, lastSync: undefined }
          : account
      ));
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#6B5E5E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {socialPlatforms.map((platform) => {
        const account = accounts.find(acc => acc.platform === platform.id);
        const isConnecting = connecting === platform.id;
        
        return (
          <div key={platform.id} className="bg-white/50 rounded-xl p-6 border border-[#EFE8D8]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2D2424]">{platform.name}</h3>
                  <p className="text-[#6B5E5E] text-sm">{platform.description}</p>
                  {account?.isConnected && account.username && (
                    <p className="text-[#2D2424] text-sm font-medium mt-1">
                      Connected as: {account.username}
                      {account.followerCount && (
                        <span className="text-[#6B5E5E] ml-2">
                          ({account.followerCount.toLocaleString()} followers)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {account?.isConnected ? (
                  <>
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting}
                    className="px-6 py-2 bg-[#2D2424] text-white text-sm font-medium rounded-lg hover:bg-[#3D3434] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Limitations */}
            {platform.limitations && platform.limitations.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 mb-2">API Limitations & Requirements</h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      {platform.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-amber-600">•</span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Last sync info */}
            {account?.isConnected && account.lastSync && (
              <div className="mt-4 text-xs text-[#6B5E5E]">
                Last synced: {account.lastSync.toLocaleDateString()} at {account.lastSync.toLocaleTimeString()}
              </div>
            )}
          </div>
        );
      })}

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">Important Notes</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Social media analytics will be automatically imported once connected</li>
              <li>• Data syncing occurs every 6 hours to respect API rate limits</li>
              <li>• Historical data availability varies by platform (typically 30-90 days)</li>
              <li>• Some advanced metrics may require upgrading to paid API tiers</li>
              <li>• All data is stored securely and can be disconnected at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}