"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageIllustration from '@/components/page-illustration';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username) {
      setError('Username is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user?.id);
      
      if (updateError) throw updateError;
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username }
      });
      
      if (metadataError) throw metadataError;
      
      // Refresh user data in context
      await refreshUser();
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'An error occurred while updating your password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
                Account Settings
              </h1>
              <p className="text-lg text-indigo-200/65">
                Manage your Spark account settings and preferences.
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              {/* Profile Settings */}
              <div className="mb-12 rounded-2xl bg-gray-900/50 p-6">
                <h2 className="mb-6 text-xl font-semibold text-gray-200">Profile Settings</h2>
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="username">
                      Username
                    </label>
                    <input 
                      id="username" 
                      type="text" 
                      className="form-input w-full text-gray-300 bg-gray-800/60 border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-md" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="email">
                      Email
                    </label>
                    <input 
                      id="email" 
                      type="email" 
                      className="form-input w-full text-gray-300 bg-gray-800/60 border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-md cursor-not-allowed opacity-70" 
                      value={email}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
              
              {/* Password Settings */}
              <div className="rounded-2xl bg-gray-900/50 p-6">
                <h2 className="mb-6 text-xl font-semibold text-gray-200">Change Password</h2>
                
                <form onSubmit={handlePasswordUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="current-password">
                      Current Password
                    </label>
                    <input 
                      id="current-password" 
                      type="password" 
                      className="form-input w-full text-gray-300 bg-gray-800/60 border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-md" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="new-password">
                      New Password
                    </label>
                    <input 
                      id="new-password" 
                      type="password" 
                      className="form-input w-full text-gray-300 bg-gray-800/60 border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-md" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="confirm-password">
                      Confirm New Password
                    </label>
                    <input 
                      id="confirm-password" 
                      type="password" 
                      className="form-input w-full text-gray-300 bg-gray-800/60 border border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-md" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
              
              {/* Error and Success Messages */}
              {error && (
                <div className="mt-6 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mt-6 rounded-md bg-green-500/20 p-3 text-sm text-green-200">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 