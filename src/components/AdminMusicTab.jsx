import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Check, 
  Save, 
  Radio, 
  Volume2, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { 
  loadMusicSettings, 
  saveMusicSettings, 
  detectSourceType, 
  DEFAULT_MUSIC_SETTINGS,
  fetchMusicMetadata
} from '../utils/musicData';
import { 
  fetchSettingFromSupabase, 
  saveSettingToSupabase 
} from '../utils/supabaseClient';

export function AdminMusicTab() {
  const [settings, setSettings] = useState(loadMusicSettings);
  
  // Get currently active song or first song
  const initialTrack = settings.track || settings.playlist?.[0] || DEFAULT_MUSIC_SETTINGS.playlist[0];
  const [songUrl, setSongUrl] = useState(initialTrack.url || '');
  const [songTitle, setSongTitle] = useState(initialTrack.title || '');
  const [songArtist, setSongArtist] = useState(initialTrack.artist || '');
  const [detectedMeta, setDetectedMeta] = useState({
    title: initialTrack.title,
    artist: initialTrack.artist,
    source: initialTrack.source,
    thumbnail: initialTrack.thumbnail
  });
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const debounceTimeoutRef = useRef(null);

  // Auto-detect source for the current URL input
  const detectedSource = detectSourceType(songUrl);

  // Load from Supabase on Mount to get fresh cloud settings
  useEffect(() => {
    let isMounted = true;
    fetchSettingFromSupabase('music_settings')
      .then(cloudData => {
        if (cloudData && isMounted) {
          try {
            const parsed = typeof cloudData === 'string' ? JSON.parse(cloudData) : cloudData;
            setSettings(parsed);
            const tr = parsed.track || parsed.playlist?.[0];
            if (tr) {
              setSongUrl(tr.url || '');
              setSongTitle(tr.title || '');
              setSongArtist(tr.artist || '');
              setDetectedMeta({
                title: tr.title,
                artist: tr.artist,
                source: tr.source,
                thumbnail: tr.thumbnail
              });
            }
          } catch (e) {
            console.error('Error parsing cloud music data:', e);
          }
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Handle URL change (Auto-Fetch Title & Artist)
  const handleUrlChange = (url) => {
    setSongUrl(url);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const clean = url.trim();
    if (!clean || clean.length < 5) {
      setIsFetchingMeta(false);
      return;
    }

    setIsFetchingMeta(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const meta = await fetchMusicMetadata(clean);
        if (meta) {
          setDetectedMeta(meta);
          if (meta.title) setSongTitle(meta.title);
          if (meta.artist) setSongArtist(meta.artist);
        }
      } catch (err) {
        console.warn('Auto fetch metadata failed', err);
      } finally {
        setIsFetchingMeta(false);
      }
    }, 400);
  };

  // Toggle Global Enable
  const handleToggleEnabled = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  // Change Default Volume
  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSettings(prev => ({ ...prev, defaultVolume: val }));
  };

  // Load Preset Chill Track
  const handleLoadPreset = () => {
    const preset = DEFAULT_MUSIC_SETTINGS.playlist[0];
    setSongUrl(preset.url);
    setSongTitle(preset.title);
    setSongArtist(preset.artist);
    setDetectedMeta({
      title: preset.title,
      artist: preset.artist,
      source: preset.source,
      thumbnail: preset.thumbnail
    });
  };

  // Save Settings to Storage & Supabase Cloud
  const handleSaveAll = async () => {
    const cleanUrl = songUrl.trim();
    let finalMeta = detectedMeta;

    setIsSaving(true);
    try {
      if (cleanUrl && (!finalMeta || isFetchingMeta)) {
        finalMeta = await fetchMusicMetadata(cleanUrl);
      }

      const singleTrack = {
        id: `track-${Date.now()}`,
        title: songTitle.trim() || finalMeta?.title || (detectedSource === 'youtube' ? 'YouTube Music Track' : 'Audio Track'),
        artist: songArtist.trim() || finalMeta?.artist || 'FP TCG',
        source: finalMeta?.source || detectedSource,
        url: cleanUrl || initialTrack.url,
        thumbnail: finalMeta?.thumbnail || ''
      };

      const updatedSettings = {
        ...settings,
        enabled: settings.enabled ?? true,
        autoplay: true,
        activeTrackId: singleTrack.id,
        track: singleTrack,
        playlist: [singleTrack]
      };

      // 1. Save to local storage & trigger local event
      saveMusicSettings(updatedSettings);

      // 2. Save to Supabase Cloud Database!
      await saveSettingToSupabase('music_settings', JSON.stringify(updatedSettings));

      setSettings(updatedSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save music settings:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกเพลง: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-music-tab-container animate-fade-in">
      
      {/* Tab Header */}
      <div className="admin-section-header-row">
        <div>
          <h2 className="admin-section-main-title">
            <Music size={22} className="title-icon-neon" />
            <span>จัดการเพลงพื้นหลังหน้าเว็บ (Background Music)</span>
          </h2>
          <p className="admin-section-sub-desc">
            กำหนดเพลงที่จะให้ลูกค้าฟังขณะเข้าใช้งานเว็บไซต์ รองรับลิงก์จาก <strong>YouTube</strong>, <strong>Spotify</strong> และ <strong>ไฟล์เสียง MP3</strong> ซิงค์ลง Cloud ทันที
          </p>
        </div>
      </div>

      {/* Global Config Cards Grid */}
      <div className="admin-music-config-grid">
        
        {/* Config Card 1: Toggle Switch */}
        <div className="music-config-card">
          <div className="config-card-header">
            <span className="config-card-icon-wrap">
              <Radio size={18} />
            </span>
            <div>
              <h4 className="config-card-title">เปิดใช้งานตัวเล่นเพลง</h4>
              <p className="config-card-desc">แสดง Widget ตัวเล่นเพลงที่มุมขวาล่างของหน้าเว็บ</p>
            </div>
          </div>
          <div className="config-card-action">
            <button
              type="button"
              className={`toggle-switch-btn ${settings.enabled ? 'active' : ''}`}
              onClick={handleToggleEnabled}
            >
              <span className="toggle-slider" />
            </button>
            <span className="toggle-state-text">
              {settings.enabled ? 'เปิดเล่นเพลง' : 'ปิดเพลง'}
            </span>
          </div>
        </div>

        {/* Config Card 2: Volume Slider */}
        <div className="music-config-card">
          <div className="config-card-header">
            <span className="config-card-icon-wrap">
              <Volume2 size={18} />
            </span>
            <div>
              <h4 className="config-card-title">ระดับเสียงเริ่มต้น</h4>
              <p className="config-card-desc">ความดังเสียงของเพลงเมื่อผู้ใช้กดเปิดฟัง</p>
            </div>
          </div>
          <div className="config-card-action volume-slider-action">
            <input
              type="range"
              min="5"
              max="100"
              value={settings.defaultVolume || 50}
              onChange={handleVolumeChange}
              className="admin-volume-slider"
            />
            <span className="volume-display-badge">{settings.defaultVolume || 50}%</span>
          </div>
        </div>

      </div>

      {/* Background Music Song Configuration Card */}
      <div className="admin-music-add-card">
        <div className="add-card-header-bar">
          <h3 className="add-card-heading">
            <Music size={18} />
            <span>ตั้งค่าเพลงพื้นหลัง (ดึงชื่อเพลง & ศิลปินอัตโนมัติ)</span>
          </h3>
          <div className="supported-badges">
            <span className="badge-src yt">YouTube</span>
            <span className="badge-src sp">Spotify</span>
            <span className="badge-src mp3">MP3 / Audio</span>
          </div>
        </div>

        <div className="add-music-form-auto-layout">
          
          <div className="input-field-group">
            <label className="field-label">
              <span>ลิงก์เพลง (URL) *</span>
              {songUrl && (
                <span className={`detected-tag ${detectedSource}`}>
                  ระบบตรวจพบ: {detectedSource === 'youtube' ? 'YouTube' : detectedSource === 'spotify' ? 'Spotify' : 'Direct Audio'}
                </span>
              )}
            </label>
            <div className="url-input-action-wrap">
              <input
                type="url"
                required
                placeholder="วางลิงก์ YouTube (เช่น https://www.youtube.com/watch?v=...) หรือ Spotify หรือ MP3"
                value={songUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="admin-music-input"
              />
              {isFetchingMeta && (
                <div className="input-fetching-indicator">
                  <RefreshCw size={15} className="spin-icon" />
                  <span>กำลังดึงข้อมูล...</span>
                </div>
              )}
            </div>
            <p className="field-hint">
              💡 เมื่อวางหรือเปลี่ยนลิงก์ ระบบจะดึง <strong>ชื่อเพลง</strong> และ <strong>ชื่อศิลปิน</strong> มาแสดงให้อัตโนมัติทันที
            </p>
          </div>

          {/* Editable Title & Artist Fields */}
          <div className="music-details-fields-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
            <div className="input-field-group">
              <label className="field-label">
                <span>ชื่อเพลง (Song Title)</span>
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อเพลง"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="admin-music-input"
              />
            </div>
            <div className="input-field-group">
              <label className="field-label">
                <span>ศิลปิน / ช่อง (Artist)</span>
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อศิลปิน"
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
                className="admin-music-input"
              />
            </div>
          </div>

          {/* Auto-detected metadata card preview */}
          {detectedMeta && (
            <div className="meta-auto-detected-card animate-fade-in" style={{ marginTop: '12px' }}>
              <div className="meta-auto-badge">
                <Check size={14} />
                <span>ดึงข้อมูลเพลงอัตโนมัติสำเร็จ</span>
              </div>
              <div className="meta-auto-content-grid">
                <div className="meta-data-box">
                  <span className="meta-lbl">ชื่อเพลง:</span>
                  <strong className="meta-val highlight-purple">{songTitle || detectedMeta.title}</strong>
                </div>
                <div className="meta-data-box">
                  <span className="meta-lbl">ศิลปิน / ช่อง:</span>
                  <span className="meta-val">{songArtist || detectedMeta.artist}</span>
                </div>
              </div>

              {songUrl && (
                <div style={{ marginTop: '10px' }}>
                  <a 
                    href={songUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="track-link-preview"
                    title="ทดสอบเปิดฟังต้นฉบับ"
                  >
                    <span>คลิกเพื่อทดสอบเปิดฟังเพลงต้นฉบับ</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Save Button Float Footer Bar */}
      <div className="admin-save-footer-bar">
        <div className="save-footer-info">
          <AlertCircle size={16} />
          <span>เมื่อเปลี่ยนลิงก์เพลงแล้ว กด <strong>"บันทึกการตั้งค่าเพลง"</strong> ข้อมูลจะซิงค์ขึ้น Supabase Cloud ทันทีครับ</span>
        </div>
        <button
          type="button"
          className={`btn-admin-save-music ${saveSuccess ? 'success' : ''}`}
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>กำลังบันทึกและซิงค์ Cloud...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check size={18} />
              <span>บันทึกและซิงค์ Cloud สำเร็จ!</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>บันทึกการตั้งค่าเพลง</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
