"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageIllustration from '@/components/page-illustration';
import SocialLinksManager from '@/components/social-links/SocialLinksManager';
import { getSocialLinks } from '@/lib/supabase';
import { SocialLink } from '@/types/auth';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showCopied, setShowCopied] = useState(false);
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (user) {
      setLoading(false);
      loadSocialLinks();
    } else {
      // Small delay to avoid flash of loading state if auth is just initializing
      const timer = setTimeout(() => {
        if (!user) {
          router.push('/signin');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const loadSocialLinks = async () => {
    if (!user?.id) return;
    try {
      const links = await getSocialLinks(user.id);
      setSocialLinks(links);
    } catch (err) {
      console.error('Error loading social links:', err);
    }
  };

  const copyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/${user?.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  return (
    <>
      <PageIllustration />

      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            {/* Page header */}
            <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
              <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Your Spark Profile
              </h1>
              <p className="text-lg text-indigo-200/65">
                Manage your profile and social media links.
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              {/* Profile Card */}
              <div className="mb-12 rounded-2xl bg-gray-900/50 p-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start">
                  {/* Profile Avatar */}
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-t from-indigo-600 to-indigo-500 text-3xl font-medium text-white sm:mb-0 sm:mr-6">
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="text-center sm:text-left">
                    <h2 className="mb-1 text-2xl font-semibold text-gray-200">{user?.username}</h2>
                    <p className="text-indigo-200/65">{user?.email}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button 
                        onClick={() => router.push('/settings')}
                        className="btn-sm bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
                      >
                        Edit Profile
                      </button>
                      {socialLinks.length > 0 && (
                        <button
                          onClick={copyProfileLink}
                          className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] text-gray-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%]"
                        >
                          {showCopied ? 'Copied!' : 'Copy Profile Link'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Links Manager */}
              <SocialLinksManager onLinksChange={loadSocialLinks} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 