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
  ExternalLink
} from 'lucide-react';
import { 
  loadMusicSettings, 
  saveMusicSettings, 
  detectSourceType, 
  DEFAULT_MUSIC_SETTINGS,
  fetchMusicMetadata
} from '../utils/musicData';

export function AdminMusicTab() {
  const [settings, setSettings] = useState(loadMusicSettings);
  
  // Get currently active song or first song
  const initialTrack = settings.track || settings.playlist?.[0] || DEFAULT_MUSIC_SETTINGS.playlist[0];
  const [songUrl, setSongUrl] = useState(initialTrack.url || '');
  const [detectedMeta, setDetectedMeta] = useState({
    title: initialTrack.title,
    artist: initialTrack.artist,
    source: initialTrack.source,
    thumbnail: initialTrack.thumbnail
  });
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const debounceTimeoutRef = useRef(null);

  // Auto-detect source for the current URL input
  const detectedSource = detectSourceType(songUrl);

  // Handle URL change (Auto-Fetch Title & Artist)
  const handleUrlChange = (url) => {
    setSongUrl(url);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const clean = url.trim();
    if (!clean || clean.length < 10) {
      setIsFetchingMeta(false);
      return;
    }

    setIsFetchingMeta(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const meta = await fetchMusicMetadata(clean);
        if (meta) {
          setDetectedMeta(meta);
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
    setDetectedMeta({
      title: preset.title,
      artist: preset.artist,
      source: preset.source,
      thumbnail: preset.thumbnail
    });
  };

  // Save Settings to Storage (Only single button at the bottom)
  const handleSaveAll = async () => {
    const cleanUrl = songUrl.trim();
    let finalMeta = detectedMeta;

    if (cleanUrl && (!finalMeta || isFetchingMeta)) {
      finalMeta = await fetchMusicMetadata(cleanUrl);
    }

    const singleTrack = {
      id: `track-${Date.now()}`,
      title: finalMeta?.title || (detectedSource === 'youtube' ? 'YouTube Music Track' : 'Audio Track'),
      artist: finalMeta?.artist || 'FP TCG',
      source: finalMeta?.source || detectedSource,
      url: cleanUrl || initialTrack.url,
      thumbnail: finalMeta?.thumbnail || ''
    };

    const updatedSettings = {
      ...settings,
      enabled: true,
      autoplay: true,
      activeTrackId: singleTrack.id,
      track: singleTrack,
      playlist: [singleTrack]
    };

    const ok = saveMusicSettings(updatedSettings);
    if (ok) {
      setSettings(updatedSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="admin-music-tab-container">
      
      {/* Tab Header (No top save button) */}
      <div className="admin-section-header-row">
        <div>
          <h2 className="admin-section-main-title">
            <Music size={22} className="title-icon-neon" />
            <span>จัดการเพลงพื้นหลังหน้าเว็บ (Background Music)</span>
          </h2>
          <p className="admin-section-sub-desc">
            กำหนดเพลงที่จะให้ลูกค้าฟังขณะเข้าใช้งานเว็บไซต์ รองรับลิงก์จาก <strong>YouTube</strong>, <strong>Spotify</strong> และ <strong>ไฟล์เสียง MP3</strong>
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
              <span className="toggle-switch-slider" />
            </button>
            <span className="toggle-label-text">
              {settings.enabled ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Disabled)'}
            </span>
          </div>
        </div>

        {/* Config Card 2: Default Volume */}
        <div className="music-config-card">
          <div className="config-card-header">
            <span className="config-card-icon-wrap">
              <Volume2 size={18} />
            </span>
            <div>
              <h4 className="config-card-title">ระดับเสียงเริ่มต้น ({settings.defaultVolume}%)</h4>
              <p className="config-card-desc">ความดังเสียงของเพลงเมื่อผู้ใช้กดเปิดฟัง</p>
            </div>
          </div>
          <div className="config-card-action volume-slider-action">
            <input
              type="range"
              min="5"
              max="100"
              value={settings.defaultVolume}
              onChange={handleVolumeChange}
              className="admin-volume-slider"
            />
            <span className="volume-display-badge">{settings.defaultVolume}%</span>
          </div>
        </div>

      </div>

      {/* Background Music Song Configuration Card (Single Song with Auto-detected Title & Artist) */}
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

          {/* Auto-detected metadata card */}
          {detectedMeta && (
            <div className="meta-auto-detected-card animate-fade-in">
              <div className="meta-auto-badge">
                <Check size={14} />
                <span>ดึงข้อมูลเพลงอัตโนมัติสำเร็จ</span>
              </div>
              <div className="meta-auto-content-grid">
                <div className="meta-data-box">
                  <span className="meta-lbl">ชื่อเพลง (Auto Title):</span>
                  <strong className="meta-val highlight-purple">{detectedMeta.title}</strong>
                </div>
                <div className="meta-data-box">
                  <span className="meta-lbl">ศิลปิน / ช่อง (Auto Artist):</span>
                  <span className="meta-val">{detectedMeta.artist}</span>
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

          <div className="form-submit-row">
           
          </div>

        </div>
      </div>

      {/* Only Save Button Float Footer Bar (Single Save Button at the Bottom) */}
      <div className="admin-save-footer-bar">
        <div className="save-footer-info">
          <AlertCircle size={16} />
          <span>เมื่อเปลี่ยนลิงก์เพลงแล้ว อย่าลืมกด <strong>"บันทึกการตั้งค่าเพลง"</strong> เพื่อให้ระบบอัปเดตไปยังหน้าแรกทันทีครับ</span>
        </div>
        <button
          type="button"
          className={`btn-admin-save-music ${saveSuccess ? 'success' : ''}`}
          onClick={handleSaveAll}
        >
          {saveSuccess ? (
            <>
              <Check size={18} />
              <span>บันทึกสำเร็จแล้ว!</span>
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
