import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Tv, Radio, GraduationCap, Users, Film, Globe } from 'lucide-react';
import { multiRokuService } from '../services/multiRokuService';

export function RokuFeedsManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [feedUrls, setFeedUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load last generated timestamp
    const lastGen = localStorage.getItem('roku_feeds_last_generated');
    if (lastGen) {
      setLastGenerated(lastGen);
    }

    // Load feed URLs
    setFeedUrls(multiRokuService.getAllFeedUrls());
  }, []);

  const handleGenerateFeeds = async () => {
    setIsGenerating(true);
    try {
      await multiRokuService.saveFeeds();
      const now = new Date().toISOString();
      setLastGenerated(now);
      localStorage.setItem('roku_feeds_last_generated', now);
      alert('All Roku feeds generated successfully!');
    } catch (error) {
      console.error('Error generating feeds:', error);
      alert('Error generating Roku feeds. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const feedConfig = [
    {
      key: 'Master Feed (All Channels)',
      name: 'Master Feed',
      description: 'Combined feed with all channels and content',
      icon: <Globe className="h-6 w-6 text-red-500" />,
      color: 'border-red-500'
    },
    {
      key: 'FEChannel TV',
      name: 'FEChannel TV',
      description: 'Main streaming channel with all video content',
      icon: <Tv className="h-6 w-6 text-blue-500" />,
      color: 'border-blue-500'
    },
    {
      key: 'FE Radio Live',
      name: 'FE Radio Live',
      description: 'Audio content, interviews, and radio shows',
      icon: <Radio className="h-6 w-6 text-green-500" />,
      color: 'border-green-500'
    },
    {
      key: 'FE Documentary Channel',
      name: 'Documentary Channel',
      description: 'Curated documentaries and research content',
      icon: <Film className="h-6 w-6 text-purple-500" />,
      color: 'border-purple-500'
    },
    {
      key: 'FE Educational Channel',
      name: 'Educational Channel',
      description: 'Educational and instructional content',
      icon: <GraduationCap className="h-6 w-6 text-yellow-500" />,
      color: 'border-yellow-500'
    },
    {
      key: 'FE Community Channel',
      name: 'Community Channel',
      description: 'User-generated and community content',
      icon: <Users className="h-6 w-6 text-cyan-500" />,
      color: 'border-cyan-500'
    }
  ];

  return (
    <div className="bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Multi-Channel Roku Feeds</h2>
          <p className="text-gray-300 mb-6">
            Generate and manage multiple Roku channel feeds for the Flat Earth Media Network.
            Each feed provides specialized content for different audience interests.
          </p>
          
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div>
              <h3 className="text-white font-semibold">Feed Generation</h3>
              {lastGenerated && (
                <p className="text-gray-400 text-sm">
                  Last generated: {new Date(lastGenerated).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleGenerateFeeds}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate All Feeds'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedConfig.map((feed) => (
            <div key={feed.key} className={`bg-gray-800 rounded-lg p-6 border-2 ${feed.color}`}>
              <div className="flex items-center space-x-3 mb-4">
                {feed.icon}
                <h3 className="text-white font-semibold">{feed.name}</h3>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{feed.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Feed URL:</span>
                  <button 
                    onClick={() => {
                      const url = feedUrls[feed.key];
                      if (url) {
                        navigator.clipboard.writeText(url);
                        alert('Feed URL copied to clipboard!');
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                  >
                    <span>Copy URL</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded p-2">
                  <code className="text-xs text-gray-300 break-all">
                    {feedUrls[feed.key] || 'Generate feeds to get URL'}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Roku Channel Setup Instructions</h3>
          <div className="text-gray-300 space-y-2 text-sm">
            <p><strong>1.</strong> Generate the feeds using the button above</p>
            <p><strong>2.</strong> Copy the feed URL for your desired channel</p>
            <p><strong>3.</strong> In Roku Developer Dashboard, create a new channel</p>
            <p><strong>4.</strong> Set the feed URL as your channel's content source</p>
            <p><strong>5.</strong> Configure channel metadata and publish</p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
            <p className="text-blue-300 text-sm">
              <strong>Pro Tip:</strong> Use the Master Feed for a comprehensive channel, 
              or create separate channels for each specialized feed to target specific audiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}