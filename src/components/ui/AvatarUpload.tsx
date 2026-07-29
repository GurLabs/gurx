import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { requireSupabase } from '../../lib/supabase';
import { initialsOf } from '../../lib/format';
import { Spinner } from './Feedback';

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

interface AvatarUploadProps {
  userId: string;
  url: string | null;
  name?: string | null;
  onChange: (url: string | null) => Promise<void> | void;
}

/**
 * Uploads to the public `avatars` bucket under `<user_id>/…`, which is what the
 * storage policies in migration 002 allow. The old file is removed so a user
 * cannot accumulate orphans.
 */
export const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, url, name, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Yalnızca PNG, JPEG veya WebP yükleyebilirsiniz.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Dosya boyutu en fazla 2 MB olabilir.');
      return;
    }

    setBusy(true);
    try {
      const sb = requireSupabase();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await sb.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = sb.storage.from('avatars').getPublicUrl(path);
      await onChange(data.publicUrl);

      // Best effort cleanup of the previous file.
      const previous = url?.split('/avatars/')[1];
      if (previous) await sb.storage.from('avatars').remove([previous]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fotoğraf yüklenemedi.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    setError(null);
    setBusy(true);
    try {
      const sb = requireSupabase();
      const previous = url?.split('/avatars/')[1];
      await onChange(null);
      if (previous) await sb.storage.from('avatars').remove([previous]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fotoğraf kaldırılamadı.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white grid place-items-center text-xl font-bold overflow-hidden">
          {url ? (
            <img src={url} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
          ) : (
            initialsOf(name)
          )}
        </div>
        {busy && (
          <div className="absolute inset-0 rounded-2xl bg-slate-900/60 grid place-items-center">
            <Spinner className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={pick} disabled={busy} className="gx-btn-ghost !py-2 text-xs">
            <Camera className="w-4 h-4" />
            {url ? 'Değiştir' : 'Fotoğraf yükle'}
          </button>
          {url && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="gx-btn-ghost !py-2 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              Kaldır
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">PNG, JPEG veya WebP · en fazla 2 MB</p>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
};
