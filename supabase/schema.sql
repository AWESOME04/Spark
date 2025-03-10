-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for social links
CREATE TABLE social_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  icon TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for profile themes
CREATE TABLE profile_themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  background_color TEXT,
  text_color TEXT,
  button_color TEXT,
  button_text_color TEXT,
  background_image_url TEXT,
  font_family TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for profile analytics
CREATE TABLE profile_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for link clicks
CREATE TABLE link_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  social_link_id UUID REFERENCES social_links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT
);

-- Create a table for custom domains
CREATE TABLE custom_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON social_links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_themes_updated_at
BEFORE UPDATE ON profile_themes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_domains_updated_at
BEFORE UPDATE ON custom_domains
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Create policies for social_links table
CREATE POLICY "Users can view their own social links"
ON social_links FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own social links"
ON social_links FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own social links"
ON social_links FOR UPDATE
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own social links"
ON social_links FOR DELETE
USING (profile_id = auth.uid());

-- Create policies for profile_themes table
CREATE POLICY "Users can view their own themes"
ON profile_themes FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own themes"
ON profile_themes FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own themes"
ON profile_themes FOR UPDATE
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own themes"
ON profile_themes FOR DELETE
USING (profile_id = auth.uid());

-- Create policies for profile_analytics table
CREATE POLICY "Users can view their own analytics"
ON profile_analytics FOR SELECT
USING (profile_id = auth.uid());

-- Create policies for link_clicks table
CREATE POLICY "Users can view clicks on their own links"
ON link_clicks FOR SELECT
USING (social_link_id IN (
  SELECT id FROM social_links WHERE profile_id = auth.uid()
));

-- Create policies for custom_domains table
CREATE POLICY "Users can view their own domains"
ON custom_domains FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own domains"
ON custom_domains FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own domains"
ON custom_domains FOR UPDATE
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own domains"
ON custom_domains FOR DELETE
USING (profile_id = auth.uid());

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email
  );
  
  -- Create default theme
  INSERT INTO public.profile_themes (profile_id, background_color, text_color, button_color, button_text_color)
  VALUES (NEW.id, '#1e1e1e', '#ffffff', '#6366f1', '#ffffff');
  
  -- Create analytics record
  INSERT INTO public.profile_analytics (profile_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 