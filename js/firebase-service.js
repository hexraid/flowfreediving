// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Firebase Service Initialization
// Firebase SDK v10 Modular (Authentication & Cloud Firestore)
// ═══════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { FIREBASE_CONFIG, isFirebaseConfigured } from './config.js';

let app = null;
let auth = null;
let db = null;

// Firebase 초기화 함수
export function initFirebase() {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('[Firebase] Successfully initialized Firebase App, Auth, and Firestore.');
      return { app, auth, db, isReady: true };
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      return { app: null, auth: null, db: null, isReady: false, error };
    }
  } else {
    // 설정값이 아직 입력되지 않은 초기 상태
    return { app: null, auth: null, db: null, isReady: false };
  }
}

// 자동 초기화 실행
const firebaseInstance = initFirebase();
app = firebaseInstance.app;
auth = firebaseInstance.auth;
db = firebaseInstance.db;

/**
 * 이메일 / 비밀번호 관리자 로그인
 */
export async function loginWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase Auth가 초기화되지 않았습니다. config.js를 확인해주세요.');
  }
  return await signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * 관리자 로그아웃
 */
export async function logoutAdmin() {
  if (auth) {
    await signOut(auth);
  }
  sessionStorage.removeItem('flow_admin_auth');
}

/**
 * 관리자 인증 상태 변경 리스너
 */
export function onAdminAuthStateChanged(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { 
  app, 
  auth, 
  db, 
  isFirebaseConfigured, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};

