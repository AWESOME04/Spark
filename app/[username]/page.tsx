"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { supabase } from '@/lib/supabase';
import { SocialLink, SOCIAL_PLATFORMS } from '@/types/auth';
import PageIllustration from '@/components/page-illustration';

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [resolvedParams.username]);

  const loadProfile = async () => {
    try {
      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', resolvedParams.username)
        .single();

      if (profileError) throw profileError;
      if (!profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Get social links
      const { data: linksData, error: linksError } = await supabase
        .from('social_links')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('position');

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Increment view count
      await supabase
        .from('profile_analytics')
        .update({ 
          views: profileData.views + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('profile_id', profileData.id);

    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-semibold text-gray-200">{error}</h1>
      </div>
    );
  }

  return (
    <>
      <PageIllustration />

      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="mx-auto max-w-3xl">
              {/* Profile Card */}
              <div className="mb-12 rounded-2xl bg-gray-900/50 p-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start">
                  {/* Profile Avatar */}
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-t from-indigo-600 to-indigo-500 text-3xl font-medium text-white sm:mb-0 sm:mr-6">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="text-center sm:text-left">
                    <h2 className="mb-1 text-2xl font-semibold text-gray-200">
                      {profile.username}
                    </h2>
                    {profile.bio && (
                      <p className="text-indigo-200/65">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="rounded-2xl bg-gray-900/50 p-6">
                <h2 className="mb-6 text-xl font-semibold text-gray-200">Connect with {profile.username}</h2>
                <div className="space-y-4">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg bg-gray-800/40 p-4 transition-colors hover:bg-gray-800/60"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500/10">
                          <span className="text-indigo-500">
                            {SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.name[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-200">{link.title}</h3>
                          <p className="text-sm text-indigo-200/65">{link.url}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 