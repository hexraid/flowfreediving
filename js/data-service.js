// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Data Service
// Mock Data → Firebase 전환이 쉬운 추상화 레이어
// IndexedDB + LocalStorage 이중 영구 저장 지원 (대용량 영상/이미지 완벽 보존)
// ═══════════════════════════════════════════════

import { MOCK_DATA } from './mock-data.js';
import { isFirebaseConfigured, isCloudinaryConfigured, CLOUDINARY_CONFIG } from './config.js';
import { db, auth } from './firebase-service.js';
import { doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const STORAGE_PREFIX = 'flow_cms_';
const DB_NAME = 'flow_cms_db';
const DB_VERSION = 1;
const STORE_NAME = 'cms_store';

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      console.warn('IndexedDB open error:', req.error);
      resolve(null);
    };
  });
}

async function getIdb(key) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STORAGE_PREFIX + key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB get error:', e);
    return null;
  }
}

async function setIdb(key, data) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, STORAGE_PREFIX + key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.error('IndexedDB put error:', req.error);
        resolve(false);
      };
    });
  } catch (e) {
    console.warn('IndexedDB set error:', e);
    return false;
  }
}

async function deleteIdb(key) {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(STORAGE_PREFIX + key);
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }
}

/**
 * Base64 또는 대용량 Data URL 여부 판별 (Firestore 1MB 한도 보호)
 */
function isBase64OrLargeDataUrl(val) {
  if (typeof val !== 'string') return false;
  return (
    val.startsWith('data:image/') ||
    val.startsWith('data:video/') ||
    val.startsWith('data:application/') ||
    (val.startsWith('data:') && val.length > 300)
  );
}

/**
 * Firestore 전송용 경량화 정제 함수 (Base64 제외, 메타데이터/URL만 보존)
 */
function sanitizeForFirestore(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    if (isBase64OrLargeDataUrl(data)) {
      return ''; // Base64 제거하여 1MB 초과 방지
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }

  if (typeof data === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(data)) {
      if (isBase64OrLargeDataUrl(v)) {
        clean[k] = '';
      } else {
        clean[k] = sanitizeForFirestore(v);
      }
    }
    return clean;
  }

  return data;
}

/**
 * 로컬 미디어(Base64)와 Firestore 메타데이터 병합 함수
 */
function mergeLocalMedia(firestoreData, localData) {
  if (!firestoreData) return localData;
  if (!localData) return firestoreData;

  if (Array.isArray(firestoreData) && Array.isArray(localData)) {
    return firestoreData.map((fItem, idx) => {
      const lItem = localData.find(l => (l && l.id && fItem && fItem.id && l.id === fItem.id)) || localData[idx];
      if (!lItem) return fItem;
      return {
        ...fItem,
        src: (!fItem.src || fItem.src === '') && lItem.src ? lItem.src : (fItem.src || lItem.src || ''),
        image: (!fItem.image || fItem.image === '') && lItem.image ? lItem.image : (fItem.image || lItem.image || ''),
        thumbnailUrl: (!fItem.thumbnailUrl || fItem.thumbnailUrl === '') && lItem.thumbnailUrl ? lItem.thumbnailUrl : (fItem.thumbnailUrl || lItem.thumbnailUrl || ''),
        videoUrl: (!fItem.videoUrl || fItem.videoUrl === '') && lItem.videoUrl ? lItem.videoUrl : (fItem.videoUrl || lItem.videoUrl || ''),
      };
    });
  }

  if (typeof firestoreData === 'object' && typeof localData === 'object') {
    const merged = { ...firestoreData };
    for (const [k, v] of Object.entries(localData)) {
      if ((!merged[k] || merged[k] === '') && v) {
        merged[k] = v;
      }
    }
    return merged;
  }

  return firestoreData;
}

/**
 * 로컬 저장소에서 데이터 읽기 (IndexedDB -> localStorage)
 */
async function getLocalItem(key) {
  try {
    const idbData = await getIdb(key);
    if (idbData !== null && idbData !== undefined) {
      return idbData;
    }
  } catch (e) {}

  try {
    const localData = localStorage.getItem(STORAGE_PREFIX + key);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (e) {}

  return null;
}

/**
 * 리스트 데이터를 개별 문서 및 집계 문서로 안전 저장
 */
async function saveListToFirestore(key, items) {
  if (!db || !Array.isArray(items)) return;

  const cleanItems = sanitizeForFirestore(items);

  // 1. 단일 집계 문서로 경량 저장 (Base64 제거 상태이므로 10~20KB로 극도로 안전)
  const docRef = doc(db, 'content', key);
  await setDoc(docRef, {
    data: cleanItems,
    updatedAt: new Date().toISOString(),
    count: cleanItems.length
  });

  // 2. 개별 아이템 문서 서브컬렉션(content/{key}/items/{itemId}) 단위로도 안전하게 저장
  for (let idx = 0; idx < cleanItems.length; idx++) {
    const item = cleanItems[idx];
    const itemId = String(item.id || `${key}_${idx + 1}`);
    try {
      const itemRef = doc(db, 'content', key, 'items', itemId);
      await setDoc(itemRef, {
        ...item,
        order: idx,
        updatedAt: new Date().toISOString()
      });
    } catch (itemErr) {
      console.warn(`[Firestore] Subcollection item save '${key}/${itemId}':`, itemErr.message);
    }
  }
}

/**
 * 단일 객체 데이터를 Firestore에 안전 저장
 */
async function saveDocToFirestore(key, data) {
  if (!db) return;
  const cleanData = sanitizeForFirestore(data);
  const docRef = doc(db, 'content', key);
  await setDoc(docRef, {
    data: cleanData,
    updatedAt: new Date().toISOString()
  });
}

/**
 * 데이터 읽기 (Cloud Firestore 우선 확인 -> 없으면 로컬/MOCK_DATA -> Firestore 안전 시딩)
 */
async function getItem(key) {
  let localData = await getLocalItem(key);

  // 1. Firebase Cloud Firestore 연동 확인
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'content', key);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data().data;
        if (firestoreData !== undefined && firestoreData !== null) {
          // 로컬 미디어(Base64)와 Firestore 메타데이터 병합
          const mergedData = mergeLocalMedia(firestoreData, localData);
          await setIdb(key, mergedData);
          try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(mergedData)); } catch (e) {}
          return mergedData;
        }
      } else {
        // Firestore에 해당 문서가 아직 없는 경우 (최초 안전 이전)
        const initialData = (localData !== null && localData !== undefined) ? localData : MOCK_DATA[key];

        // 로그인된 관리자가 조회 중일 때만 대용량 Base64를 제거한 정제 데이터로 안전하게 Firestore에 시딩
        if (auth && auth.currentUser && initialData !== undefined) {
          try {
            if (Array.isArray(initialData)) {
              await saveListToFirestore(key, initialData);
            } else {
              await saveDocToFirestore(key, initialData);
            }
            console.log(`[Firestore] Safely initialized 'content/${key}' without payload bloat.`);
          } catch (seedErr) {
            console.warn(`[Firestore] Initial seed for '${key}' deferred:`, seedErr.message);
          }
        }
        return initialData || null;
      }
    } catch (err) {
      console.warn(`[Firestore] Read fallback for '${key}':`, err.message);
    }
  }

  // 2. 오프라인 / 미연동 / 에러 시 로컬 저장소 fallback
  if (localData !== null && localData !== undefined) {
    return localData;
  }

  return MOCK_DATA[key] || null;
}

/**
 * 데이터 쓰기 (로컬 원본 보존 + Cloud Firestore 경량 메타데이터 안전 저장)
 */
async function setItem(key, data) {
  // 1. 로컬 저장소에 완전한 원본 데이터(로컬 Base64 포함) 영구 저장
  await setIdb(key, data);
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[FLOW DataService] localStorage quota exceeded for '${key}', safely persisted in IndexedDB.`);
  }

  // 2. Cloud Firestore 저장 (Base64 완전 제거 및 경량화 데이터만 안전 전송)
  if (isFirebaseConfigured() && db) {
    try {
      if (Array.isArray(data)) {
        await saveListToFirestore(key, data);
      } else {
        await saveDocToFirestore(key, data);
      }
      console.log(`[Firestore] Saved '${key}' successfully without payload bloat.`);
    } catch (err) {
      console.error(`[Firestore] Save failed for '${key}':`, err);
    }
  }
}

/**
 * 데이터 삭제
 */
async function removeItem(key) {
  await deleteIdb(key);
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {}

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'content', key);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn(`[Firestore] Delete error for '${key}':`, err);
    }
  }
}

/**
 * 통합 DataService
 */
export const DataService = {

  // ─── Links ───
  async getLinks() {
    return (await getItem('links')) || MOCK_DATA.links;
  },
  async updateLinks(data) {
    await setItem('links', data);
  },

  // ─── SEO ───
  async getSEO() {
    return (await getItem('seo')) || MOCK_DATA.seo;
  },
  async updateSEO(data) {
    await setItem('seo', data);
  },

  // ─── Header Nav ───
  async getHeaderNav() {
    const data = await getItem('headerNav');
    const defaults = MOCK_DATA.headerNav;

    const engToKorMap = {
      'about': '소개',
      'program': '교육과정',
      'instructor': '강사진',
      'review': '후기',
      'gallery': '갤러리',
      'faq': 'FAQ'
    };

    if (Array.isArray(data) && data.length > 0) {
      let needsMigration = false;
      const merged = defaults.map(def => {
        const item = data.find(d => d.id === def.id);
        let label = (item && item.label && item.label.trim()) ? item.label.trim() : def.label;

        // Convert legacy English defaults to Korean defaults automatically
        if (engToKorMap[def.id] && label.toLowerCase() === def.id.toLowerCase()) {
          label = engToKorMap[def.id];
          needsMigration = true;
        }

        return {
          ...def,
          label
        };
      });

      if (needsMigration) {
        await setItem('headerNav', merged);
      }
      return merged;
    }
    return defaults;
  },
  async updateHeaderNav(data) {
    await setItem('headerNav', data);
  },

  // ─── Hero ───
  async getHero() {
    return (await getItem('hero')) || MOCK_DATA.hero;
  },
  async updateHero(data) {
    await setItem('hero', data);
  },

  // ─── WHY FLOW ───
  async getWhyFlow() {
    return (await getItem('whyFlow')) || MOCK_DATA.whyFlow;
  },
  async updateWhyFlow(data) {
    await setItem('whyFlow', data);
  },

  // ─── Course Finder ───
  async getCourseFinder() {
    const res = (await getItem('courseFinder')) || MOCK_DATA.courseFinder;
    if (res && res.visible === undefined) {
      res.visible = true;
    }
    return res;
  },
  async updateCourseFinder(data) {
    await setItem('courseFinder', data);
  },

  // ─── Programs ───
  async getPrograms() {
    return (await getItem('programs')) || JSON.parse(JSON.stringify(MOCK_DATA.programs));
  },
  async getVisiblePrograms() {
    const programs = await this.getPrograms();
    return programs.filter(p => p.visible);
  },
  async updatePrograms(data) {
    await setItem('programs', data);
  },
  async updateProgram(id, updates) {
    const programs = await this.getPrograms();
    const idx = programs.findIndex(p => p.id === id);
    if (idx !== -1) {
      programs[idx] = { ...programs[idx], ...updates };
      await setItem('programs', programs);
    }
  },

  // ─── Instructors ───
  async getInstructors() {
    return (await getItem('instructors')) || MOCK_DATA.instructors;
  },
  async updateInstructors(data) {
    await setItem('instructors', data);
  },

  // ─── Reviews ───
  async getReviews() {
    return (await getItem('reviews')) || MOCK_DATA.reviews;
  },
  async updateReviews(data) {
    await setItem('reviews', data);
  },

  // ─── Gallery ───
  async getGallery() {
    const raw = (await getItem('gallery')) || MOCK_DATA.gallery;
    if (!Array.isArray(raw)) return [];
    // 기존 데이터 호환: mediaType 누락 시 자동으로 'image' 처리
    return raw.map(item => ({
      ...item,
      mediaType: item.mediaType || 'image'
    }));
  },
  async updateGallery(data) {
    const sanitized = Array.isArray(data) ? data.map(item => ({
      ...item,
      mediaType: item.mediaType || 'image'
    })) : [];
    await setItem('gallery', sanitized);
  },

  // ─── Gallery Categories ───
  async getGalleryCategories() {
    const cats = await getItem('galleryCategories');
    if (Array.isArray(cats) && cats.length > 0) return cats;
    return MOCK_DATA.galleryCategories || [
      { id: 'freediving', name: '프리다이빙' },
      { id: 'course', name: '강습' },
      { id: 'etc', name: '기타' }
    ];
  },
  async updateGalleryCategories(data) {
    await setItem('galleryCategories', data);
  },
  normalizeCategory(category, categoriesList = []) {
    if (!category) return (categoriesList[0]?.id || 'freediving');
    const c = String(category).trim().toLowerCase();

    // 1. Direct ID or Name match
    const directMatch = categoriesList.find(cat =>
      cat.id.toLowerCase() === c || cat.name.toLowerCase() === c
    );
    if (directMatch) return directMatch.id;

    // 2. Legacy alias mappings
    if (c === 'freediving' || c === '프리다이빙' || c.includes('프리다이빙')) {
      const match = categoriesList.find(cat => cat.id === 'freediving' || cat.name.includes('프리다이빙'));
      return match ? match.id : (categoriesList[0]?.id || 'freediving');
    }
    if (c === 'course' || c === 'swimming' || c === 'eggyeong' || c === '강습' || c === '수영' || c.includes('강습') || c.includes('수영')) {
      const match = categoriesList.find(cat => cat.id === 'course' || cat.id === 'swimming' || cat.name.includes('강습') || cat.name.includes('수영'));
      return match ? match.id : (categoriesList[1]?.id || 'course');
    }

    return (categoriesList[categoriesList.length - 1]?.id || 'etc');
  },

  // ─── FAQ ───
  async getFAQ() {
    return (await getItem('faq')) || MOCK_DATA.faq;
  },
  async updateFAQ(data) {
    await setItem('faq', data);
  },

  // ─── CTA ───
  async getCTA() {
    return (await getItem('cta')) || MOCK_DATA.cta;
  },
  async updateCTA(data) {
    await setItem('cta', data);
  },

  // ─── Footer ───
  async getFooter() {
    return (await getItem('footer')) || MOCK_DATA.footer;
  },
  async updateFooter(data) {
    await setItem('footer', data);
  },

  // ─── Popup ───
  async getPopup() {
    return (await getItem('popup')) || MOCK_DATA.popup;
  },
  async updatePopup(data) {
    await setItem('popup', data);
  },

  // ─── 전체 리셋 ───
  async resetAll() {
    const keys = [
      'links', 'seo', 'hero', 'whyFlow', 'courseFinder',
      'programs', 'instructors', 'reviews', 'gallery',
      'faq', 'cta', 'footer', 'popup'
    ];
    for (const key of keys) {
      await removeItem(key);
    }
  },

  // ─── 전체 데이터 내보내기 (백업) ───
  async exportAll() {
    const data = {};
    const keys = [
      'links', 'seo', 'hero', 'whyFlow', 'courseFinder',
      'programs', 'instructors', 'reviews', 'gallery',
      'faq', 'cta', 'footer', 'popup'
    ];
    for (const key of keys) {
      data[key] = (await getItem(key)) || MOCK_DATA[key];
    }
    return data;
  },

  // ─── 전체 데이터 가져오기 (복원) ───
  async importAll(data) {
    for (const [key, value] of Object.entries(data)) {
      await setItem(key, value);
    }
  },

  // ─── 전체 데이터 Firestore 안전 동기화 ───
  async syncAllToFirestore() {
    if (!isFirebaseConfigured() || !db) {
      throw new Error('Firebase가 연결되지 않았습니다.');
    }
    const keys = [
      'links', 'seo', 'hero', 'whyFlow', 'courseFinder',
      'programs', 'instructors', 'reviews', 'gallery',
      'faq', 'cta', 'footer', 'popup'
    ];
    const results = {};
    for (const key of keys) {
      const data = (await getLocalItem(key)) || MOCK_DATA[key];
      if (data !== undefined && data !== null) {
        if (Array.isArray(data)) {
          await saveListToFirestore(key, data);
        } else {
          await saveDocToFirestore(key, data);
        }
        results[key] = true;
      }
    }
    return results;
  },

  // ─── 파일 업로드 (이미지/영상 Cloudinary 실제 연동) ───
  async uploadFile(file, resourceType = 'auto') {
    const { cloudName, uploadPreset } = CLOUDINARY_CONFIG || {};
    
    if (!isCloudinaryConfigured()) {
      console.warn("Cloudinary 설정이 완료되지 않아 로컬 미리보기(Data URL)로 처리합니다.");
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const isVideo = (file.type && file.type.startsWith('video/')) || resourceType === 'video';
          resolve({
            secure_url: e.target.result,
            public_id: 'local_' + Date.now(),
            resource_type: isVideo ? 'video' : 'image',
            thumbnail_url: e.target.result
          });
        };
        reader.onerror = (e) => reject(new Error("파일 읽기 실패"));
        reader.readAsDataURL(file);
      });
    }

    const type = resourceType === 'video' ? 'video' : (file.type && file.type.startsWith('video/')) ? 'video' : 'auto';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const errObj = await res.json();
        throw new Error(errObj.error?.message || `Cloudinary 업로드 실패 (HTTP ${res.status})`);
      }
      const data = await res.json();
      
      const isVideo = data.resource_type === 'video' || type === 'video';
      let thumbnailUrl = data.secure_url;
      if (isVideo && data.secure_url) {
        thumbnailUrl = data.secure_url.replace(/\/video\/upload\/(v\d+\/)?/, (match, version) => {
          return `/video/upload/so_0,q_auto,f_jpg/${version || ''}`;
        }).replace(/\.[^/.]+$/, '.jpg');
      }

      return { 
        secure_url: data.secure_url,
        public_id: data.public_id,
        resource_type: data.resource_type || (isVideo ? 'video' : 'image'),
        format: data.format,
        width: data.width,
        height: data.height,
        duration: data.duration,
        thumbnail_url: thumbnailUrl
      };
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw err;
    }
  }
};

// 글로벌 접근 (admin에서 사용)
window.DataService = DataService;
