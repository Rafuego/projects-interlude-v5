import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sijkemeiieusrjgxsspg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpamtlbWVpaWV1c3JqZ3hzc3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MDgxNDEsImV4cCI6MjA4NDE4NDE0MX0.DEtCPpR7BhXEWHJKXeoqvJBDl1AaGHKgvA8G4d1p91M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to upload files to Supabase Storage
export async function uploadFile(
  projectId: string, 
  file: File, 
  folder: string = 'files'
): Promise<{ path: string; url: string } | null> {
  const fileExt = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${projectId}/${folder}/${Date.now()}-${safeName}`;
  
  const { data, error } = await supabase.storage
    .from('project-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName);
  
  return {
    path: fileName,
    url: urlData.publicUrl
  };
}

// Helper to delete a file from storage
export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from('project-files')
    .remove([path]);
  
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  return true;
}

// Project CRUD operations
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  return data;
}

export async function getProjectBySlug(slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  
  if (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
  return data;
}

export async function createProject(project: {
  name: string;
  client: string;
  type?: string;
  slug: string;
}) {
  const newProject = {
    name: project.name,
    client: project.client,
    type: project.type || 'brand',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    overview: '',
    figma_link: '',
    slug: project.slug,
    password: null,
    is_published: false,
    data: {
      research: { documents: [], notes: [] },
      logos: [],
      colors: [],
      typography: [],
      webpages: [],
      animations: [],
      collateral: [],
      devNotes: [],
      helpDocs: []
    }
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([newProject])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  return data;
}

export async function updateProject(id: string, updates: any) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    return null;
  }
  return data;
}

export async function deleteProjectFromDb(id: string) {
  // First, try to delete all files associated with this project
  try {
    const { data: folders } = await supabase.storage
      .from('project-files')
      .list(id);
    
    if (folders && folders.length > 0) {
      for (const folder of folders) {
        const { data: files } = await supabase.storage
          .from('project-files')
          .list(`${id}/${folder.name}`);
        
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${id}/${folder.name}/${f.name}`);
          await supabase.storage.from('project-files').remove(filePaths);
        }
      }
    }
  } catch (e) {
    console.error('Error cleaning up files:', e);
  }

  // Then delete the project record
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
}

export async function checkSlugAvailable(slug: string, excludeId?: string) {
  let query = supabase
    .from('projects')
    .select('id')
    .eq('slug', slug);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error checking slug:', error);
    return false;
  }
  
  return !data || data.length === 0;
}
