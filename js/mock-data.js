/* ═══════════════════════════════════════════════
   FLOW FREEDIVING — Mock Data (CMS-Ready)
   모든 섹션의 콘텐츠를 구조화된 객체로 관리
   Firebase Firestore 전환 시 동일 구조 유지
   ═══════════════════════════════════════════════ */

export const MOCK_DATA = {

  /* ── 외부 링크 ── */
  links: {
    kakao: 'https://pf.kakao.com/_placeholder',
    naverBooking: 'https://booking.naver.com/placeholder',
    naverPlace: 'https://map.naver.com/p/entry/place/placeholder',
    naverCafe: 'https://cafe.naver.com/placeholder',
    smartStore: 'https://smartstore.naver.com/placeholder',
    instagram: 'https://instagram.com/flowfreediving',
    youtube: 'https://youtube.com/@flowfreediving',
    blog: 'https://blog.naver.com/flowfreediving',
    phone: 'tel:010-1234-5678'
  },

  /* ── SEO ── */
  seo: {
    title: 'FLOW FREEDIVING | 처음이어도 괜찮습니다. 프리다이빙, 일상이 되다.',
    description: 'FLOW FREEDIVING - 처음이어도 괜찮습니다. 안전 최우선, 소규모 맞춤 교육으로 프리다이빙의 첫 걸음을 함께합니다. 원데이 체험부터 강사 과정까지.',
    ogImage: 'images/og-image.jpg',
    ogUrl: 'https://flowfreediving.kr'
  },

  /* ── 상단 메뉴 설정 (Header Nav) ── */
  headerNav: [
    { id: 'about', label: '소개', targetLabel: 'ABOUT 섹션', target: '#about' },
    { id: 'program', label: '교육과정', targetLabel: 'PROGRAM 섹션', target: '#program' },
    { id: 'instructor', label: '강사진', targetLabel: 'INSTRUCTOR 섹션', target: '#instructor' },
    { id: 'review', label: '후기', targetLabel: 'REVIEW 섹션', target: '#review' },
    { id: 'gallery', label: '갤러리', targetLabel: 'gallery.html', target: 'gallery.html' },
    { id: 'faq', label: 'FAQ', targetLabel: 'FAQ 섹션', target: '#faq' }
  ],

  /* ── Hero ── */
  hero: {
    videoUrl: '',
    bgImage: 'images/hero-bg.jpg',
    title: '처음이어도 괜찮습니다.',
    titleLine2: '프리다이빙, 일상이 되다.',
    subtitle: '물속에서 깊이 숨 쉬고,\n나를 만나는 특별한 시간을 경험하세요.',
    buttons: [
      { text: '카카오톡 상담', link: 'kakao', style: 'kakao', icon: 'kakao' },
      { text: '네이버 예약', link: 'naverBooking', style: 'naver', icon: 'naver' }
    ]
  },

  /* ── WHY FLOW ── */
  whyFlow: {
    label: 'WHY FLOW',
    title: 'WHY FLOW',
    subtitle: 'FLOW와 함께하는 네 가지 약속',
    items: [
      {
        icon: 'shield',
        title: '안전 최우선',
        desc: '2,500일 이상 무사고 안전 기록. 모든 교육은 국제 안전 기준을 준수하며, 응급 장비와 안전 프로토콜을 철저히 갖추고 있습니다.'
      },
      {
        icon: 'award',
        title: '전문 강사진',
        desc: 'AIDA, SSI 국제 자격을 보유한 전문 강사가 직접 교육합니다. 12년 이상의 경력과 3,000명 이상의 교육 실적이 증명합니다.'
      },
      {
        icon: 'users',
        title: '소규모 맞춤 교육',
        desc: '최대 4인 소그룹으로 진행합니다. 수강생 한 분 한 분의 페이스와 목표에 맞춰 1:1 피드백을 제공합니다.'
      },
      {
        icon: 'heart',
        title: '즐거운 커뮤니티',
        desc: '교육 후에도 함께합니다. 정기 펀다이빙, 해양 투어, 호흡 클래스로 프리다이빙이 일상이 되는 커뮤니티를 만들어갑니다.'
      }
    ]
  },

  /* ── Course Finder (나에게 맞는 과정 찾기) ── */
  courseFinder: {
    visible: true,
    title: '나에게 맞는 과정 찾기',
    subtitle: '3가지 질문에 답하면, 딱 맞는 과정을 추천해드려요.',
    steps: [
      {
        id: 'experience',
        question: '프리다이빙 경험이 있으신가요?',
        options: [
          { value: 'none', text: '처음입니다' },
          { value: 'trial', text: '체험만 해봤어요' },
          { value: 'certified', text: '자격증이 있어요' }
        ]
      },
      {
        id: 'goal',
        question: '어떤 목표를 가지고 계신가요?',
        options: [
          { value: 'experience', text: '한번 체험해보고 싶어요' },
          { value: 'cert', text: '자격증을 취득하고 싶어요' },
          { value: 'advanced', text: '더 깊이 도전하고 싶어요' },
          { value: 'instructor', text: '강사가 되고 싶어요' }
        ]
      },
      {
        id: 'duration',
        question: '원하는 교육 기간은 얼마인가요?',
        options: [
          { value: 'half', text: '반나절 (3~4시간)' },
          { value: '1-2days', text: '1~2일' },
          { value: '3days+', text: '3일 이상' }
        ]
      }
    ],
    results: [
      {
        conditions: { experience: 'none', goal: 'experience' },
        programId: 'oneday',
        title: '원데이 체험 다이빙',
        desc: '수영 못해도 OK! 반나절 만에 프리다이빙을 안전하게 경험할 수 있습니다.',
        image: 'images/program-oneday.jpg',
        buttons: [
          { text: '자세히 보기', action: 'detail', target: 'oneday' },
          { text: '카카오톡 상담', action: 'link', target: 'kakao' }
        ]
      },
      {
        conditions: { experience: 'none', goal: 'cert' },
        programId: 'level1',
        title: 'LEVEL 1 입문 과정',
        desc: '호흡법부터 이퀄라이징 기초까지. 체계적인 2일 교육으로 프리다이빙을 시작하세요.',
        image: 'images/program-level1.jpg',
        buttons: [
          { text: '자세히 보기', action: 'detail', target: 'level1' },
          { text: '네이버 예약', action: 'link', target: 'naverBooking' }
        ]
      },
      {
        conditions: { experience: 'trial' },
        programId: 'level1',
        title: 'LEVEL 1 입문 과정',
        desc: '체험을 넘어 본격적으로 시작하세요. 체계적인 이론과 실습으로 자격증을 취득합니다.',
        image: 'images/program-level1.jpg',
        buttons: [
          { text: '자세히 보기', action: 'detail', target: 'level1' },
          { text: '카카오톡 상담', action: 'link', target: 'kakao' }
        ]
      },
      {
        conditions: { experience: 'certified', goal: 'advanced' },
        programId: 'level2',
        title: 'LEVEL 2 심화 과정',
        desc: 'FRC 다이빙과 고급 이퀄라이징으로 20~30m에 도전하세요.',
        image: 'images/program-level2.jpg',
        buttons: [
          { text: '자세히 보기', action: 'detail', target: 'level2' },
          { text: '네이버 예약', action: 'link', target: 'naverBooking' }
        ]
      },
      {
        conditions: { experience: 'certified', goal: 'instructor' },
        programId: 'instructor-course',
        title: '강사 과정',
        desc: '교육 방법론부터 안전 관리까지. 프리다이빙 강사로 성장할 수 있는 전문 과정입니다.',
        image: 'images/program-instructor.jpg',
        buttons: [
          { text: '카카오톡 상담', action: 'link', target: 'kakao' }
        ]
      },
      {
        // Default fallback
        conditions: {},
        programId: 'level1',
        title: 'LEVEL 1 입문 과정',
        desc: '프리다이빙의 기초부터 탄탄하게. 가장 많은 분들이 선택하는 과정입니다.',
        image: 'images/program-level1.jpg',
        buttons: [
          { text: '자세히 보기', action: 'detail', target: 'level1' },
          { text: '카카오톡 상담', action: 'link', target: 'kakao' }
        ]
      }
    ]
  },

  /* ── Programs ── */
  programs: [
    {
      id: 'oneday',
      visible: true,
      category: 'freediving',
      title: '원데이 체험',
      subtitle: 'One-Day Experience',
      desc: '수영 못해도 OK! 반나절 만에 수중 세계를 안전하게 경험하세요.',
      image: 'images/program-oneday.jpg',
      tags: ['반나절', '초보 환영', '장비 포함'],
      originalPrice: '₩200,000',
      price: '₩150,000',
      duration: '3~4시간',
      groupSize: '최대 2인',
      curriculum: [
        '프리다이빙 기본 이론 (30분)',
        '호흡법 기초 연습 — 복식호흡, 릴렉세이션',
        '풀장 수중 적응 훈련',
        '5m 얕은 수심 잠수 체험',
        '수중 사진 촬영 포함'
      ],
      includes: [
        '전 장비 대여 (마스크, 스노클, 핀, 웨트슈트)',
        '강사 1:2 소수 교육',
        '수중 사진 촬영 및 제공',
        '수영장 입장료'
      ],
      prep: ['수영복, 세면도구', '편한 마음']
    },
    {
      id: 'level1',
      visible: true,
      category: 'freediving',
      title: 'LEVEL 1',
      subtitle: '입문 과정',
      desc: '호흡법과 이퀄라이징의 기초. 10~20m에 도전합니다.',
      image: 'images/program-level1.jpg',
      smartStoreUrl: 'https://smartstore.naver.com/flowfreediving/products/level1',
      tags: ['2일', '입문자', '자격증'],
      originalPrice: '₩550,000',
      price: '₩450,000',
      duration: '2일',
      groupSize: '최대 4인',
      curriculum: [
        'Day 1: 이론 교육 — 프리다이빙 생리학, 안전 규칙',
        'Day 1: 호흡법 실습 — 다이어프램 호흡, 릴렉세이션',
        'Day 1: 풀장 실습 — STA(정적 무호흡), DYN(동적 무호흡)',
        'Day 2: 이퀄라이징(압력평형) 이론 및 실습',
        'Day 2: 덕다이브(머리부터 입수) 기술',
        'Day 2: 수심 10~20m 풀장 실습 및 평가'
      ],
      includes: [
        '전 장비 대여',
        'AIDA/SSI Level 1 자격증 발급',
        '강사 1:4 소수 교육',
        '이론 교재 제공',
        '수영장 입장료'
      ],
      prep: ['수영복, 세면도구', '필기구', '가벼운 간식']
    },
    {
      id: 'level2',
      visible: true,
      category: 'freediving',
      title: 'LEVEL 2',
      subtitle: '심화 과정',
      desc: 'FRC 다이빙 and 고급 기술. 20~30m 목표입니다.',
      image: 'images/program-level2.jpg',
      tags: ['2일', 'L1 수료자', '자격증'],
      originalPrice: '₩500,000',
      price: '₩500,000',
      duration: '2일',
      groupSize: '최대 3인',
      curriculum: [
        'Day 1: 고급 이론 — 산소/질소 대사, 블랙아웃 메커니즘',
        'Day 1: FRC(잔기량) 다이빙 이론 및 실습',
        'Day 1: 마우스필 이퀄라이징 기초',
        'Day 2: 프리폴(자유낙하) 기술',
        'Day 2: 수심 20~30m 풀장/해양 실습',
        'Day 2: 버디 안전 관리 심화'
      ],
      includes: [
        '전 장비 대여',
        'AIDA/SSI Level 2 자격증 발급',
        '강사 1:3 소수 교육',
        '고급 이론 교재',
        '수영장 입장료'
      ],
      prep: ['수영복, 세면도구', 'Level 1 자격증 사본', '개인 장비(있는 경우)']
    },
    {
      id: 'level3',
      visible: true,
      category: 'freediving',
      title: 'LEVEL 3',
      subtitle: '고급 과정',
      desc: '고급 이퀄라이징, 30~40m, 해양 실습을 포함합니다.',
      image: 'images/program-level3.jpg',
      tags: ['3일', 'L2 수료자', '해양 실습'],
      price: '₩650,000',
      duration: '3일',
      groupSize: '최대 2인',
      curriculum: [
        'Day 1: 전문 이론 — 딥 다이빙 생리학',
        'Day 1: 마우스필 이퀄라이징 심화',
        'Day 2: 풀장 실습 — 고급 덕다이브, 프리폴 최적화',
        'Day 2: 30m+ 풀장 실습',
        'Day 3: 해양 실습 — 실제 바다에서 30~40m 도전',
        'Day 3: 안전 다이버 역할 교육'
      ],
      includes: [
        '전 장비 대여',
        'AIDA/SSI Level 3 자격증 발급',
        '강사 1:2 밀착 교육',
        '해양 실습 교통 포함',
        '수영장 + 해양 입수 비용'
      ],
      prep: ['수영복, 세면도구', 'Level 2 자격증 사본', '개인 장비 권장']
    },
    {
      id: 'instructor-course',
      visible: true,
      category: 'freediving',
      title: '강사 과정',
      subtitle: 'Instructor Course',
      desc: '교육 방법론과 안전 관리, 강사로서의 전문성을 갖춥니다.',
      image: 'images/program-instructor.jpg',
      tags: ['4일+', 'L3 수료자', '강사 자격'],
      price: '별도 문의',
      duration: '4일 이상',
      groupSize: '1:1 맞춤',
      curriculum: [
        'Day 1~2: 강사 이론 — 교육 방법론, 안전 관리 체계',
        'Day 2~3: 40m+ 수심 훈련',
        'Day 3~4: 교육 시연 및 평가',
        'Day 4: 긴급 상황 대응 실습'
      ],
      includes: [
        '전 장비 대여',
        'AIDA/SSI 강사 자격증 발급',
        '강사 1:1 맞춤 교육',
        '모든 교육 장소 비용 포함'
      ],
      prep: ['Level 3 자격증 사본', '개인 장비 필수', '응급처치 자격증(EFR)']
    },
    // 향후 추가될 프로그램 (현재 비공개)
    {
      id: 'survival-swim',
      visible: false,
      category: 'lifeguard',
      title: '생존수영',
      subtitle: 'Survival Swimming',
      desc: '수상 안전과 생존 기술을 배우는 과정입니다.',
      image: '',
      tags: ['1일', '누구나'],
      price: '별도 문의',
      duration: '1일',
      groupSize: '최대 6인',
      curriculum: [],
      includes: [],
      prep: []
    },
    {
      id: 'kids',
      visible: false,
      category: 'freediving',
      title: '유스 프리다이빙',
      subtitle: 'Youth Freediving',
      desc: '청소년 및 유스를 위한 안전한 수중 체험 프로그램입니다.',
      image: '',
      tags: ['반나절', '8~15세'],
      price: '별도 문의',
      duration: '3시간',
      groupSize: '최대 4인',
      curriculum: [],
      includes: [],
      prep: []
    },
    {
      id: 'eggyeong-course',
      visible: false,
      category: 'eggyeong',
      title: '입영 클래스',
      subtitle: 'Eggbeater Kick Class',
      desc: '물속에서 힘을 들이지 않고 편안하게 머무르는 입영 동작을 배웁니다.',
      image: '',
      tags: ['반나절', '입영 기초'],
      price: '별도 문의',
      curriculum: [
        '입영 기초 이론 및 호흡 조절',
        '지상에서의 다리 동작(에그비터 킥) 지상 훈련',
        '수중에서의 팔과 다리 협응 동작 실습',
        '체력 소모 최소화 훈련'
      ],
      includes: [
        '강사 밀착 지도',
        '수영장 입장료'
      ],
      prep: ['수영복, 수영모, 물안경', '개인 타월']
    }
  ],

  /* ── Instructors ── */
  instructors: [
    {
      id: 'main',
      name: 'FLOW 대표 강사',
      photo: 'images/instructor-main.jpg',
      role: 'AIDA / SSI Freediving Instructor Trainer',
      philosophy: '기록보다 안전을, 기술보다 이완을 우선합니다.',
      bio: '12년 이상의 프리다이빙 경력으로 3,000명 이상의 다이버를 안전하게 교육해왔습니다. 수강생 한 분 한 분의 페이스에 맞춘 맞춤형 교육을 진행합니다.',
      certifications: [
        'AIDA Instructor Trainer',
        'SSI Level 4 Instructor',
        'PADI Freediver Instructor',
        'Emergency First Response',
        '수상 인명구조 자격'
      ],
      career: [
        { year: '2013', text: '프리다이빙 입문 및 AIDA 자격 취득' },
        { year: '2016', text: 'AIDA 강사 자격 취득, 전문 교육 시작' },
        { year: '2019', text: 'FLOW FREEDIVING 브랜드 설립' },
        { year: '2022', text: '누적 교육 인원 2,000명 돌파' },
        { year: '현재', text: 'Instructor Trainer로서 강사 양성 및 교육 운영 중' }
      ],
      visible: true
    }
  ],

  /* ── Reviews ── */
  reviews: [
    {
      stars: 5,
      text: '물이 무서웠는데, 첫 수업 후 두려움이 편안함으로 바뀌었어요. 강사님의 세심한 케어 덕분에 안전하게 즐길 수 있었습니다.',
      name: '김O영',
      course: '원데이 체험',
      date: '2026.06'
    },
    {
      stars: 5,
      text: '호흡에 집중하는 법을 배우고 나니 일상까지 달라졌어요. 프리다이빙이 단순한 스포츠가 아니라 명상이라는 걸 느꼈습니다.',
      name: '박O현',
      course: 'Level 1',
      date: '2026.05'
    },
    {
      stars: 5,
      text: '다른 곳에서 레벨1을 따고 왔는데, FLOW에서 레벨2를 하면서 기본기를 다시 잡았어요. 진짜 실력이 늘었습니다.',
      name: '이O수',
      course: 'Level 2',
      date: '2026.04'
    },
    {
      stars: 5,
      text: '수영을 전혀 못하는데도 안전하게 체험할 수 있었어요. 수면 아래 세상이 이렇게 아름다운 줄 몰랐습니다!',
      name: '최O서',
      course: '원데이 체험',
      date: '2026.07'
    },
    {
      stars: 5,
      text: '레벨3 해양 실습이 정말 인생 경험이었어요. 30m 아래에서 올려다본 수면의 빛이 아직도 잊히지 않습니다.',
      name: '한O진',
      course: 'Level 3',
      date: '2026.03'
    },
    {
      stars: 5,
      text: '처음엔 걱정이 많았는데 소수 수업이라 편안했어요. 벌써 레벨2까지 왔네요. FLOW 만나서 다행이에요.',
      name: '정O은',
      course: 'Level 2',
      date: '2026.06'
    }
  ],
  galleryCategories: [
    { id: 'freediving', name: '프리다이빙' },
    { id: 'swimming', name: '입영' },
    { id: 'course', name: '강습' },
    { id: 'etc', name: '기타' }
  ],

  gallery: [
    { src: 'images/gallery-1.jpg', alt: '풀장에서 프리다이빙 연습', category: 'freediving', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-2.jpg', alt: '수중 호흡 훈련', category: 'freediving', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-3.jpg', alt: '버디 시스템 안전 교육', category: 'course', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-4.jpg', alt: '해양에서 프리다이빙', category: 'freediving', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-5.jpg', alt: '깊은 바다 속 프리다이버', category: 'freediving', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-6.jpg', alt: '수중 촬영 현장', category: 'etc', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-7.jpg', alt: '단체 교육 후 기념 촬영', category: 'course', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-8.jpg', alt: '프리다이빙 커뮤니티 펀다이빙', category: 'freediving', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-1.jpg', alt: '입영 클래스 다리 동작 실습', category: 'swimming', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-2.jpg', alt: '입영 수중 호흡 및 밸런스', category: 'swimming', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-3.jpg', alt: '강습 세션 피드백', category: 'course', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-4.jpg', alt: '해양 세션 다이빙 교육', category: 'freediving', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-5.jpg', alt: '수중 스페셜 영상', category: 'freediving', mediaType: 'video', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'images/gallery-5.jpg', visible: true, enabled: true },
    { src: 'images/gallery-6.jpg', alt: '입영 실습 현장 스케치', category: 'swimming', mediaType: 'image', visible: true, enabled: true },
    { src: 'images/gallery-7.jpg', alt: '수중 릴렉세이션 모음', category: 'etc', mediaType: 'image', visible: true, enabled: true }
  ],

  /* ── FAQ ── */
  faq: [
    {
      question: '수영을 못해도 프리다이빙을 배울 수 있나요?',
      answer: '네, 가능합니다! 기본적인 물 적응부터 시작하며, 수영 능력과 관계없이 안전하게 교육합니다. 많은 수강생분들이 수영을 못하는 상태에서 시작하여 성공적으로 프리다이빙을 즐기고 계십니다.'
    },
    {
      question: '원데이 체험과 Level 1의 차이점은 무엇인가요?',
      answer: '원데이 체험은 반나절 동안 프리다이빙을 가볍게 경험하는 과정이고, Level 1은 2일간 체계적으로 기초 기술을 배워 자격증을 취득하는 정규 과정입니다. 체험 후 Level 1으로 이어가는 분들이 많습니다.'
    },
    {
      question: '교육 시 장비는 제공되나요?',
      answer: '네, 교육에 필요한 모든 장비(마스크, 스노클, 핀, 웨트슈트 등)가 포함되어 있습니다. 개인 장비가 있으시면 가져오셔도 됩니다.'
    },
    {
      question: '환불 규정은 어떻게 되나요?',
      answer: '교육 7일 전 100% 환불, 3일 전 50% 환불, 당일 취소 시 환불이 어렵습니다. 날씨 등 불가피한 사유 시 일정 변경을 도와드립니다.'
    },
    {
      question: '교육 장소는 어디인가요?',
      answer: '풀 교육은 수도권 내 전용 다이빙 풀에서, 해양 실습은 제주도 또는 동해안에서 진행됩니다. 상세 위치는 예약 시 안내드립니다.'
    },
    {
      question: '혼자 가도 괜찮나요?',
      answer: '물론입니다! 수강생의 대부분이 혼자 오십니다. 소수 수업이라 오히려 더 편안하게 교육에 집중할 수 있고, 교육 중 자연스럽게 동기 분들과 친해지는 경우가 많습니다.'
    }
  ],

  /* ── CTA ── */
  cta: {
    title: '바다 속 고요함을 경험할 준비가 되셨나요?',
    subtitle: '지금 바로 상담하고, 프리다이빙을 시작하세요.',
    buttons: [
      { text: '카카오톡 상담', link: 'kakao', style: 'kakao', icon: 'kakao' },
      { text: '전화 상담', link: 'phone', style: 'outline', icon: 'phone' },
      { text: '네이버 예약', link: 'naverBooking', style: 'naver', icon: 'naver' }
    ]
  },

  /* ── Footer ── */
  footer: {
    slogan: '처음이어도 괜찮습니다. 프리다이빙, 일상이 되다.',
    company: {
      name: 'FLOW FREEDIVING',
      representative: '홍길동',
      businessNumber: '123-45-67890',
      address: '경기도 수원시 영통구 OO로 123',
      phone: '010-1234-5678',
      email: 'hello@flowfreediving.kr'
    },
    sns: [
      { id: 'instagram', name: '인스타그램', icon: 'instagram', link: 'instagram', visible: true },
      { id: 'blog', name: '블로그', icon: 'blog', link: 'blog', visible: true },
      { id: 'youtube', name: '유튜브', icon: 'youtube', link: 'youtube', visible: true },
      { id: 'kakao', name: '카카오톡', icon: 'kakao', link: 'kakao', visible: true }
    ],
    legal: {
      terms: '#',
      privacy: '#',
      copyright: '© 2026 FLOW FREEDIVING. All rights reserved.'
    }
  },

  /* ── Popup (optional) ── */
  popup: [
    {
      id: 'popup-1',
      title: '여름 프리다이빙 할인 이벤트',
      desc: '여름 시즌 한정! 레벨 1 교육 10% 할인 혜택을 놓치지 마세요.',
      image: 'images/gallery-1.jpg',
      link: 'https://flowfreediving.kr/programs/level1',
      startDate: '2026-07-01',
      endDate: '2026-08-31',
      enabled: true,
      priority: 1,
      target: 'all',
      views: 742,
      clicks: 124,
      createdAt: '2026-06-25 14:20',
      updatedAt: '2026-06-28 10:30',
      useDismiss: true,
      dismissText: '오늘 하루 보지 않기'
    },
    {
      id: 'popup-2',
      title: '7월 교육 마감 임박 안내',
      desc: '7월 레벨 1 교육이 곧 마감됩니다. 서둘러 신청해주세요!',
      image: 'images/gallery-2.jpg',
      link: 'https://flowfreediving.kr/programs/level1',
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      enabled: true,
      priority: 2,
      target: 'all',
      views: 506,
      clicks: 79,
      createdAt: '2026-06-26 09:15',
      updatedAt: '2026-06-26 09:15',
      useDismiss: true,
      dismissText: '오늘 하루 보지 않기'
    },
    {
      id: 'popup-3',
      title: '원데이 체험 이벤트',
      desc: '처음이어도 괜찮아요! 원데이 체험으로 프리다이빙을 경험해보세요.',
      image: 'images/gallery-3.jpg',
      link: 'https://flowfreediving.kr/programs/oneday',
      startDate: '2026-06-20',
      endDate: '2026-12-31',
      enabled: false,
      priority: 3,
      target: 'all',
      views: 0,
      clicks: 0,
      createdAt: '2026-06-18 11:00',
      updatedAt: '2026-06-19 15:40',
      useDismiss: true,
      dismissText: '다시 보지 않기'
    },
    {
      id: 'popup-4',
      title: '수중 촬영 서비스 안내',
      desc: '교육 및 투어 중 생생한 수중 촬영 서비스를 제공합니다.',
      image: 'images/gallery-4.jpg',
      link: '',
      startDate: '2026-06-01',
      endDate: '2026-12-31',
      enabled: false,
      priority: 4,
      target: 'all',
      views: 0,
      clicks: 0,
      createdAt: '2026-05-28 16:30',
      updatedAt: '2026-05-28 16:30',
      useDismiss: false,
      dismissText: '오늘 하루 보지 않기'
    }
  ]
};
