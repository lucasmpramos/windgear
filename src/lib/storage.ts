import { supabase } from './supabase';

export async function uploadProductImages(userId: string, files: File[]) {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
}

export async function deleteProductImages(urls: string[]) {
  if (!urls.length) return;

  // Extract file paths from URLs
  const filePaths = urls.map(url => {
    const matches = url.match(/product-images\/(.+)$/);
    return matches ? matches[1] : '';
  }).filter(Boolean);

  if (filePaths.length === 0) return;

  const { error } = await supabase.storage
    .from('product-images')
    .remove(filePaths);

  if (error) throw error;
}

export async function updateProductImages(userId: string, currentUrls: string[], newFiles: File[], removedUrls: string[]) {
  // Delete removed images
  if (removedUrls.length > 0) {
    await deleteProductImages(removedUrls);
  }

  // Upload new images
  const newUrls = newFiles.length > 0 ? await uploadProductImages(userId, newFiles) : [];

  // Combine remaining current URLs with new ones
  const remainingUrls = currentUrls.filter(url => !removedUrls.includes(url));
  return [...remainingUrls, ...newUrls];
}