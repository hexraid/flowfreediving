// ═══════════════════════════════════════════════
// FLOW FREEDIVING — Configuration
// Firebase & Cloudinary 연동 설정
// ═══════════════════════════════════════════════

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBB9ndhgOkXY-5LfnZikhxHZPSKsMVl7jM",
  authDomain: "flowfreediving-e79bc.firebaseapp.com",
  projectId: "flowfreediving-e79bc",
  storageBucket: "flowfreediving-e79bc.firebasestorage.app",
  messagingSenderId: "82908715839",
  appId: "1:82908715839:web:451a00cfae4b98d927d18a"
};

export const CLOUDINARY_CONFIG = {
  cloudName: "ov24dbs2",
  uploadPreset: "flow_unsigned_preset"
};

// 유효한 Firebase 설정인지 확인 (실제 키가 입력되었을 때만 true 반환)
export const isFirebaseConfigured = () => {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.apiKey.trim() !== "" &&
    !FIREBASE_CONFIG.apiKey.includes("YOUR_")
  );
};

// 유효한 Cloudinary 설정인지 확인 (실제 Cloud Name과 Preset이 입력되었을 때만 true 반환)
export const isCloudinaryConfigured = () => {
  return Boolean(
    CLOUDINARY_CONFIG.cloudName &&
    CLOUDINARY_CONFIG.cloudName.trim() !== "" &&
    !CLOUDINARY_CONFIG.cloudName.includes("YOUR_") &&
    !CLOUDINARY_CONFIG.cloudName.includes("여기에_") &&
    CLOUDINARY_CONFIG.uploadPreset &&
    CLOUDINARY_CONFIG.uploadPreset.trim() !== "" &&
    !CLOUDINARY_CONFIG.uploadPreset.includes("YOUR_") &&
    !CLOUDINARY_CONFIG.uploadPreset.includes("여기에_")
  );
};

