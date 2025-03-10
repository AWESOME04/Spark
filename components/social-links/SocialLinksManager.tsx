"use client";

import { useState, useEffect } from 'react';
import { SocialLink, SOCIAL_PLATFORMS } from '@/types/auth';
import { getSocialLinks, addSocialLink, updateSocialLink, deleteSocialLink } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SocialLinksManagerProps {
  onLinksChange?: () => void;
}

export default function SocialLinksManager({ onLinksChange }: SocialLinksManagerProps) {
  const { user } = useAuth();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [newLink, setNewLink] = useState({
    platform: '',
    url: '',
    title: ''
  });

  useEffect(() => {
    loadLinks();
  }, [user]);

  const loadLinks = async () => {
    if (!user?.id) return;
    
    try {
      const links = await getSocialLinks(user.id);
      setLinks(links);
      onLinksChange?.();
    } catch (err) {
      console.error('Error loading social links:', err);
      setError('Failed to load social links');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      const link = await addSocialLink(user.id, {
        ...newLink,
        position: links.length,
      });
      setLinks([...links, link]);
      setNewLink({ platform: '', url: '', title: '' });
      onLinksChange?.();
    } catch (err) {
      console.error('Error adding social link:', err);
      setError('Failed to add social link');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    try {
      setLoading(true);
      const updated = await updateSocialLink(editingLink.id, editingLink);
      setLinks(links.map(link => link.id === updated.id ? updated : link));
      setEditingLink(null);
      onLinksChange?.();
    } catch (err) {
      console.error('Error updating social link:', err);
      setError('Failed to update social link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      setLoading(true);
      await deleteSocialLink(linkId);
      setLinks(links.filter(link => link.id !== linkId));
      onLinksChange?.();
    } catch (err) {
      console.error('Error deleting social link:', err);
      setError('Failed to delete social link');
    } finally {
      setLoading(false);
    }
  };

  if (loading && links.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gray-900/50 p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-200">Social Links</h2>

        {/* Add new link form */}
        <form onSubmit={handleAddLink} className="mb-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-indigo-200/65">
                Platform
              </label>
              <select
                className="form-select w-full bg-gray-800/60 border-gray-700"
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                required
              >
                <option value="">Select Platform</option>
                {SOCIAL_PLATFORMS.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-indigo-200/65">
                Title
              </label>
              <input
                type="text"
                className="form-input w-full bg-gray-800/60 border-gray-700"
                placeholder="Display name"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-indigo-200/65">
                URL
              </label>
              <input
                type="url"
                className="form-input w-full bg-gray-800/60 border-gray-700"
                placeholder={SOCIAL_PLATFORMS.find(p => p.id === newLink.platform)?.placeholder || 'https://'}
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="btn bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
              disabled={loading}
            >
              Add Link
            </button>
          </div>
        </form>

        {/* Existing links */}
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-lg bg-gray-800/40 p-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500/10">
                  {/* Icon placeholder */}
                  <span className="text-indigo-500">
                    {SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-200">{link.title}</h3>
                  <p className="text-sm text-indigo-200/65">{link.url}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingLink(link)}
                  className="p-2 text-gray-400 hover:text-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-200">Edit Link</h3>
            <form onSubmit={handleUpdateLink} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65">
                  Platform
                </label>
                <select
                  className="form-select w-full bg-gray-800/60 border-gray-700"
                  value={editingLink.platform}
                  onChange={(e) => setEditingLink({ ...editingLink, platform: e.target.value })}
                  required
                >
                  {SOCIAL_PLATFORMS.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65">
                  Title
                </label>
                <input
                  type="text"
                  className="form-input w-full bg-gray-800/60 border-gray-700"
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65">
                  URL
                </label>
                <input
                  type="url"
                  className="form-input w-full bg-gray-800/60 border-gray-700"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="btn bg-gray-800 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 