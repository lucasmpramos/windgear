import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
  throw new Error('Required environment variables are missing');
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function syncUsersMetadata() {
  try {
    console.log('Starting user metadata sync...');
    
    // Get all users from auth
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) throw usersError;
    console.log(`Found ${users.length} users to sync`);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesError;

    // Process each auth user
    for (const authUser of users) {
      try {
        // Find matching profile
        const profile = profiles.find(p => p.id === authUser.id);
        
        // Get OAuth provider data if available
        const identityData = authUser.identities?.[0]?.identity_data;
        const provider = authUser.app_metadata?.provider;

        // Determine the avatar URL with correct priority
        let avatarUrl = null;

        // For manually created users, prioritize profile and metadata
        if (!provider) {
          avatarUrl = profile?.avatar_url || authUser.user_metadata?.avatar_url;
        } 
        // For OAuth users, prioritize provider data
        else {
          avatarUrl = (provider === 'google' && identityData?.picture) ||
                     (provider === 'facebook' && identityData?.avatar_url) ||
                     profile?.avatar_url ||
                     authUser.user_metadata?.avatar_url;
        }

        // Get the best available full name with correct priority
        let fullName = null;

        // For manually created users, prioritize profile and metadata
        if (!provider) {
          fullName = profile?.full_name || authUser.user_metadata?.full_name;
        }
        // For OAuth users, prioritize provider data
        else {
          fullName = identityData?.full_name ||
                    identityData?.name ||
                    `${identityData?.given_name || ''} ${identityData?.family_name || ''}`.trim() ||
                    profile?.full_name ||
                    authUser.user_metadata?.full_name;
        }

        console.log(`Syncing user ${authUser.id}:`, {
          email: authUser.email,
          provider: provider || 'manual',
          fullName: fullName || 'Not set',
          avatarUrl: avatarUrl ? '✓' : '✗',
          isAdmin: profile?.is_admin ? 'Yes' : 'No'
        });

        // First update auth metadata
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          authUser.id,
          {
            email: authUser.email,
            user_metadata: {
              ...authUser.user_metadata,
              full_name: fullName,
              avatar_url: avatarUrl
            }
          }
        );

        if (authError) {
          console.error(`Failed to update auth metadata for ${authUser.id}:`, authError);
          continue;
        }

        // Then update or create profile
        const { error: upsertError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            bio: profile?.bio || null,
            location: profile?.location || null,
            whatsapp: profile?.whatsapp || null,
            is_admin: profile?.is_admin || false,
            last_sign_in_at: profile?.last_sign_in_at || null,
            created_at: profile?.created_at || authUser.created_at,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (upsertError) {
          console.error(`Failed to update profile for ${authUser.id}:`, upsertError);
          continue;
        }

        console.log(`✓ Successfully synced user ${authUser.id}`);

      } catch (error) {
        console.error(`Error processing user ${authUser.id}:`, error);
      }
    }

    // Check for orphaned profiles (profiles without auth users)
    const orphanedProfiles = profiles.filter(
      profile => !users.some(user => user.id === profile.id)
    );

    if (orphanedProfiles.length > 0) {
      console.log(`\nFound ${orphanedProfiles.length} orphaned profiles to clean up`);
      
      for (const profile of orphanedProfiles) {
        try {
          // Delete orphaned profile
          const { error: deleteError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', profile.id);

          if (deleteError) {
            console.error(`Failed to delete orphaned profile ${profile.id}:`, deleteError);
          } else {
            console.log(`✓ Deleted orphaned profile ${profile.id}`);
          }
        } catch (error) {
          console.error(`Error deleting orphaned profile ${profile.id}:`, error);
        }
      }
    }

    console.log('\nSync completed successfully! 🎉');
    process.exit(0);
    
  } catch (error) {
    console.error('Error syncing user metadata:', error);
    process.exit(1);
  }
}

// Run the sync
syncUsersMetadata();