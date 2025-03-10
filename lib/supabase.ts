import { createClient } from '@supabase/supabase-js';
import { SignUpResponse, SocialLink } from '@/types/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error('Invalid Supabase URL:', url);
    return false;
  }
};

export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey
);


export async function signUp(email: string, password: string, username: string): Promise<SignUpResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              username, 
              email,
              created_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        const { error: themeError } = await supabase
          .from('profile_themes')
          .insert([
            {
              profile_id: authData.user.id,
              background_color: '#1e1e1e',
              text_color: '#ffffff',
              button_color: '#6366f1',
              button_text_color: '#ffffff',
            }
          ]);

        if (themeError) {
          console.error('Theme creation error:', themeError);
        }

        const { error: analyticsError } = await supabase
          .from('profile_analytics')
          .insert([
            {
              profile_id: authData.user.id,
            }
          ]);

        if (analyticsError) {
          console.error('Analytics creation error:', analyticsError);
        }

        return { 
          user: authData.user,
          session: null,
          emailConfirmationRequired: true
        };
      } catch (err) {
        console.error('Error in profile setup:', err);
        return { 
          user: authData.user,
          session: null,
          emailConfirmationRequired: true
        };
      }
    }
    
    return authData;
  } catch (error) {
    console.error('Signup process error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setUserInLocalStorage({
          ...data.user,
          profile: profileData
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    removeUserFromLocalStorage();
    localStorage.removeItem('supabase.auth.token');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    window.location.href = '/';
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw error;
  }
  
  if (!session) {
    return null;
  }
  
  const { data, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (userError) throw userError;
  
  return {
    ...session.user,
    username: data?.username || '',
    profile: data
  };
}

export function getUserFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('sparkUser');
  return user ? JSON.parse(user) : null;
}

export function setUserInLocalStorage(user: any) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('sparkUser', JSON.stringify(user));
}

export function removeUserFromLocalStorage() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('sparkUser');
}

export async function getSocialLinks(profileId: string): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profileId)
    .order('position');

  if (error) throw error;
  return data || [];
}

export async function addSocialLink(profileId: string, link: Partial<SocialLink>) {
  const { data, error } = await supabase
    .from('social_links')
    .insert([
      {
        profile_id: profileId,
        platform: link.platform,
        url: link.url,
        title: link.title,
        icon: link.icon,
        position: link.position || 0,
        is_active: true
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSocialLink(linkId: string, updates: Partial<SocialLink>) {
  const { data, error } = await supabase
    .from('social_links')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSocialLink(linkId: string) {
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', linkId);

  if (error) throw error;
}
