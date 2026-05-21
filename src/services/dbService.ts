import { supabase } from '../lib/supabase';
import { Project, ScanResult } from '../types';

/**
 * Service to handle all Supabase database operations
 * Separates DB logic from UI components for better maintainability
 */
export const dbService = {
  /**
   * Fetch all projects for the current user
   */
  async getProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: new Date(p.created_at).getTime()
    }));
  },

  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        color: project.color
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing project
   */
  async updateProject(project: Project) {
    const { error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        description: project.description,
        color: project.color
      })
      .eq('id', project.id);

    if (error) throw error;
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Fetch all scans for the current user
   */
  async getScans() {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      imageUrl: s.image_url,
      description: s.description,
      analysis: s.analysis,
      projectId: s.project_id
    }));
  },

  /**
   * Save or update a scan
   */
  async saveScan(scan: ScanResult) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('scans')
      .upsert({
        id: scan.id.length >= 30 ? scan.id : undefined, // Potential UUID check
        user_id: user.id,
        project_id: scan.projectId || null,
        timestamp: scan.timestamp,
        image_url: scan.imageUrl,
        description: scan.description,
        analysis: scan.analysis
      });

    if (error) throw error;
  }
};
