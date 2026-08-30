// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Firebase Service Initialization
// Firebase SDK v10 Modular (Authentication & Cloud Firestore)
// ═══════════════════════════════════════════════

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
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
      auth.languageCode = 'ko';
      db = getFirestore(app);
      console.log('[Firebase] Successfully initialized Firebase App, Auth (Language: ko), and Firestore.');
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
 * 관리자 아이디로 Firestore에서 계정 프로필 조회
 */
export async function getAdminProfileById(adminId) {
  if (!db || !adminId) return null;
  const cleanId = adminId.trim();
  try {
    // 1. Document ID로 직접 조회
    const docRef = doc(db, 'admins', cleanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }

    // 2. adminId 필드로 쿼리 조회
    const q = query(collection(db, 'admins'), where('adminId', '==', cleanId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data();
    }
  } catch (err) {
    console.warn('[Firebase] Firestore admin lookup error by ID:', err);
  }
  return null;
}

/**
 * 이메일로 Firestore에서 계정 프로필 조회 (대소문자 미구분 호환)
 */
export async function getAdminProfileByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const rawEmail = email.trim();

  // 1. LocalStorage 캐시 우선 검색
  try {
    const cachedStr = localStorage.getItem('flow_admin_profile');
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (cached && cached.email && (cached.email.trim().toLowerCase() === cleanEmail || cached.email.trim() === rawEmail)) {
        return cached;
      }
    }
  } catch (e) {}

  // 2. Firestore 쿼리 검색
  if (db) {
    try {
      const q1 = query(collection(db, 'admins'), where('email', '==', cleanEmail));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        return snap1.docs[0].data();
      }

      const q2 = query(collection(db, 'admins'), where('email', '==', rawEmail));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        return snap2.docs[0].data();
      }
    } catch (err) {
      console.warn('[Firebase] Firestore admin lookup error by Email:', err);
    }
  }

  return null;
}

/**
 * 관리자 계정 정보 생성/업데이트 (Firestore + LocalStorage 저장)
 */
export async function saveAdminProfile(profileData) {
 if (!profileData || !profileData.adminId) return null;
 const cleanAdminId = profileData.adminId.trim();
 const data = {
   adminId: cleanAdminId,
   email: profileData.email ? profileData.email.trim() : '',
   name: profileData.name ? profileData.name.trim() : '관리자',
   role: profileData.role || '관리자',
   updatedAt: new Date().toISOString()
 };

 // 1. 로컬 저장소 즉시 영구 저장 (새로고침 시 유지)
 try {
   localStorage.setItem('flow_admin_profile', JSON.stringify(data));
 } catch (e) {
   console.warn('[LocalStorage] Profile save warning:', e);
 }

 // 2. Firestore 동기화 (오류 발생 시 콘솔 경고 및 격리)
 if (db) {
   try {
     const docRef = doc(db, 'admins', cleanAdminId);
     await setDoc(docRef, data, { merge: true });
   } catch (err) {
     console.warn('[Firebase Firestore] Profile sync warning (Check Security Rules):', err);
   }
 }
 return data;
}

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
 * 관리자 아이디 또는 이메일로 로그인
 */
export async function loginWithAdminId(adminIdOrInput, password) {
  const input = adminIdOrInput ? adminIdOrInput.trim() : '';
  if (!input || !password) {
    throw new Error('아이디와 비밀번호를 모두 입력해주세요.');
  }

  let targetEmail = input;
  let adminProfile = null;

  if (input.includes('@')) {
    targetEmail = input;
  } else {
    try {
      const cachedStr = localStorage.getItem('flow_admin_profile');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached && (cached.adminId === input || (cached.email && cached.email.split('@')[0] === input))) {
          adminProfile = cached;
          if (cached.email) targetEmail = cached.email;
        }
      }
    } catch (e) {}

    if (!adminProfile) {
      adminProfile = await getAdminProfileById(input);
      if (adminProfile && adminProfile.email) {
        targetEmail = adminProfile.email;
      }
    }
  }

  let userCredential = null;
  try {
    userCredential = await loginWithEmail(targetEmail, password);
  } catch (authErr) {
    console.warn('[Firebase Auth] Login error:', authErr.code, authErr.message);
    throw authErr;
  }

  if (userCredential && userCredential.user) {
    const userEmail = userCredential.user.email || targetEmail;
    const defaultAdminId = input.includes('@') ? (userEmail ? userEmail.split('@')[0] : input) : input;

    if (!adminProfile) {
      adminProfile = await getCurrentAdminProfile(userCredential.user);
    }

    const finalProfile = {
      adminId: adminProfile && adminProfile.adminId ? adminProfile.adminId : defaultAdminId,
      email: userEmail,
      name: adminProfile && adminProfile.name ? adminProfile.name : '관리자',
      role: adminProfile && adminProfile.role ? adminProfile.role : '관리자'
    };

    try {
      await saveAdminProfile(finalProfile);
    } catch (e) {
      console.warn('[Firebase] Auto saving admin profile warning:', e);
    }
  }

  return userCredential;
}

/**
 * 아이디 마스킹 함수 (예: flowadmin -> flo*****)
 */
export function maskAdminId(adminId) {
  if (!adminId) return '';
  const str = adminId.trim();
  if (str.length <= 2) {
    return str.substring(0, 1) + '*';
  }
  if (str.length === 3) {
    return str.substring(0, 1) + '**';
  }
  const prefix = str.substring(0, 3);
  const maskLength = Math.min(5, str.length - 3);
  return prefix + '*'.repeat(maskLength);
}

/**
 * 이메일로 관리자 아이디 찾기
 */
export async function findAdminIdByEmail(email) {
  if (!email || !email.trim()) {
    throw new Error('이메일을 입력해주세요.');
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. LocalStorage 캐시 우선 검색
  try {
    const cachedStr = localStorage.getItem('flow_admin_profile');
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (cached && cached.email && cached.email.trim().toLowerCase() === cleanEmail) {
        const foundId = cached.adminId || cached.email.split('@')[0];
        return {
          adminId: foundId,
          maskedId: maskAdminId(foundId),
          email: cleanEmail
        };
      }
    }
  } catch (e) {}

  // 2. Firestore admins 컬렉션 이메일 검색
  const profile = await getAdminProfileByEmail(cleanEmail);
  if (profile && profile.adminId) {
    return {
      adminId: profile.adminId,
      maskedId: maskAdminId(profile.adminId),
      email: cleanEmail
    };
  }

  // 3. Firestore admins 컬렉션 문서 ID 직접 검색 (이메일 아이디 부분)
  if (cleanEmail.includes('@')) {
    const defaultId = cleanEmail.split('@')[0];
    const profileById = await getAdminProfileById(defaultId);
    if (profileById && (profileById.email?.trim().toLowerCase() === cleanEmail || profileById.adminId === defaultId)) {
      return {
        adminId: profileById.adminId || defaultId,
        maskedId: maskAdminId(profileById.adminId || defaultId),
        email: cleanEmail
      };
    }

    // 4. 폴백: 이메일 입력 시 이메일 아이디(예: sungung1@naver.com -> sungung1)를 관리자 아이디로 반환 및 보존
    const derivedId = defaultId;
    const newAdminDoc = {
      adminId: derivedId,
      email: cleanEmail,
      name: '관리자',
      role: '관리자'
    };

    try {
      await saveAdminProfile(newAdminDoc);
    } catch (e) {}

    return {
      adminId: derivedId,
      maskedId: maskAdminId(derivedId),
      email: cleanEmail
    };
  }

  return null;
}

/**
 * 비밀번호 재설정 이메일 전송 (아이디 또는 이메일 입력)
 */
export async function sendAdminPasswordReset(adminIdOrEmail) {
  if (!auth) {
    throw new Error('Firebase Auth가 초기화되지 않았습니다. config.js를 확인해주세요.');
  }
  const input = adminIdOrEmail ? adminIdOrEmail.trim() : '';
  if (!input) {
    throw new Error('아이디 또는 이메일을 입력해주세요.');
  }

  let targetEmail = input;
  if (!input.includes('@')) {
    const profile = await getAdminProfileById(input);
    if (profile && profile.email) {
      targetEmail = profile.email;
    } else {
      const err = new Error('입력하신 아이디로 등록된 계정 정보를 찾을 수 없습니다.');
      err.code = 'auth/user-not-found';
      throw err;
    }
  }

  await sendPasswordResetEmail(auth, targetEmail);
  return { success: true, email: targetEmail };
}

/**
 * 현재 로그인한 관리자의 프로필 정보 조회
 */
export async function getCurrentAdminProfile(user) {
 if (!user) return null;

 // 1. 로컬 저장소 캐시 확인
 try {
   const cachedStr = localStorage.getItem('flow_admin_profile');
   if (cachedStr) {
     const cached = JSON.parse(cachedStr);
     if (cached && cached.name) {
       return cached;
     }
   }
 } catch (e) {}

 // 2. Firestore에서 조회
 if (user.email) {
   const firestoreProfile = await getAdminProfileByEmail(user.email);
   if (firestoreProfile) {
     try {
       localStorage.setItem('flow_admin_profile', JSON.stringify(firestoreProfile));
     } catch (e) {}
     return firestoreProfile;
   }
 }

 // 3. 기본 프로필 폴백
 return {
   adminId: user.email ? user.email.split('@')[0] : 'admin',
   email: user.email || '',
   name: '관리자',
   role: '관리자'
 };
}

/**
 * 관리자 프로필 정보 수정 (이름 및 등록 이메일 변경)
 */
export async function updateAdminProfile(user, { name, email }) {
 if (!user) {
   throw new Error('로그인된 사용자 정보를 찾을 수 없습니다.');
 }

 const cleanName = name ? name.trim() : '';
 const cleanEmail = email ? email.trim() : '';

 if (!cleanName) {
   const err = new Error('관리자 이름을 입력해주세요.');
   err.code = 'custom/invalid-name';
   throw err;
 }

 if (!cleanEmail) {
   const err = new Error('등록 이메일을 입력해주세요.');
   err.code = 'custom/invalid-email';
   throw err;
 }

 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(cleanEmail)) {
   const err = new Error('이메일 형식이 올바르지 않습니다.');
   err.code = 'auth/invalid-email';
   throw err;
 }

 // 1. 이메일이 변경된 경우 Firebase Auth 이메일 업데이트
 if (user.email && user.email !== cleanEmail) {
   try {
     await updateEmail(user, cleanEmail);
   } catch (authErr) {
     console.error('[Firebase Auth] updateEmail error details:', authErr);
     if (authErr.code === 'auth/requires-recent-login') {
       const reAuthErr = new Error('이메일 변경을 위해 보안상 로그아웃 후 다시 로그인해주세요.');
       reAuthErr.code = 'auth/requires-recent-login';
       throw reAuthErr;
     } else if (authErr.code === 'auth/invalid-email') {
       const invalidErr = new Error('이메일 형식이 올바르지 않습니다.');
       invalidErr.code = 'auth/invalid-email';
       throw invalidErr;
     } else if (authErr.code === 'auth/email-already-in-use') {
       const inUseErr = new Error('이미 사용 중인 이메일입니다.');
       inUseErr.code = 'auth/email-already-in-use';
       throw inUseErr;
     }
     throw authErr;
   }
 }

 // 2. 프로필 객체 생성 및 영구 저장
 const currentProfile = await getCurrentAdminProfile(user);
 const adminId = currentProfile && currentProfile.adminId ? currentProfile.adminId : (user.email ? user.email.split('@')[0] : 'admin');

 const updatedProfile = {
   adminId: adminId,
   email: cleanEmail,
   name: cleanName,
   role: currentProfile && currentProfile.role ? currentProfile.role : '관리자'
 };

 await saveAdminProfile(updatedProfile);
 return updatedProfile;
}

/**
 * 관리자 비밀번호 직접 변경 (기존 비밀번호 재인증 후 새 비밀번호 업데이트)
 */
export async function changeAdminPassword(user, currentPassword, newPassword) {
  if (!user || !user.email) {
    throw new Error('로그인된 사용자 정보를 찾을 수 없습니다.');
  }

  const cleanCurrentPw = currentPassword ? currentPassword.trim() : '';
  const cleanNewPw = newPassword ? newPassword.trim() : '';

  if (!cleanCurrentPw) {
    const err = new Error('기존 비밀번호가 올바르지 않습니다.');
    err.code = 'auth/wrong-password';
    throw err;
  }

  if (!cleanNewPw || cleanNewPw.length < 6) {
    const err = new Error('새 비밀번호는 6자리 이상이어야 합니다.');
    err.code = 'auth/weak-password';
    throw err;
  }

  // 1. 기존 비밀번호 재인증
  try {
    const credential = EmailAuthProvider.credential(user.email, cleanCurrentPw);
    await reauthenticateWithCredential(user, credential);
  } catch (reAuthErr) {
    console.warn('[Firebase Auth] Re-authentication failed:', reAuthErr);
    const customErr = new Error('기존 비밀번호가 올바르지 않습니다.');
    customErr.code = 'auth/wrong-password';
    throw customErr;
  }

  // 2. 새 비밀번호 변경
  try {
    await updatePassword(user, cleanNewPw);
  } catch (updateErr) {
    console.warn('[Firebase Auth] Update password failed:', updateErr);
    if (updateErr.code === 'auth/weak-password') {
      throw new Error('새 비밀번호는 6자리 이상이어야 합니다.');
    }
    throw updateErr;
  }

  return { success: true };
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
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut
};




