import { User, Session } from '@supabase/supabase-js';

export type SignUpResponse = {
  user: User | null;
  session: Session | null;
  emailConfirmationRequired?: boolean;
};

export type SocialLink = {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  title: string;
  icon?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialPlatform = {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  urlPattern: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    placeholder: 'https://linkedin.com/in/username',
    urlPattern: 'https://linkedin.com/in/*'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'twitter',
    placeholder: 'https://twitter.com/username',
    urlPattern: 'https://twitter.com/*'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    placeholder: 'https://instagram.com/username',
    urlPattern: 'https://instagram.com/*'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    placeholder: 'https://facebook.com/username',
    urlPattern: 'https://facebook.com/*'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    placeholder: 'https://github.com/username',
    urlPattern: 'https://github.com/*'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    placeholder: 'https://youtube.com/@username',
    urlPattern: 'https://youtube.com/*'
  },
  {
    id: 'website',
    name: 'Website',
    icon: 'globe',
    placeholder: 'https://yourwebsite.com',
    urlPattern: 'https://*'
  }
]; 