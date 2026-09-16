import { supabase, isSupabaseConfigured } from './client';

export async function uploadAlertPhoto(file: File): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Fallback for offline / unconfigured mode
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `alerts/${fileName}`;

  const { data, error } = await supabase.storage
    .from('alert-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.warn('Storage upload error, falling back to base64 Data URL:', error.message);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from('alert-photos')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
