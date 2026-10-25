import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'graded-cards');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cards = [
  {
    filename: 'pikachu_promo.svg',
    pngFilename: 'pikachu_promo.png',
    title: 'PIKACHU PROMO',
    subtitle: 'Pokémon JPN 2025',
    grade: 'PCG 10',
    gradeDesc: 'GEM MINT',
    cert: '10998420',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    accentColor: '#fef08a',
    bgGrad1: '#422006',
    bgGrad2: '#1e1b4b',
    symbol: '⚡',
    jpName: 'ピカチュウ',
    hp: 'HP 120',
    type: 'LIGHTNING'
  },
  {
    filename: 'lucario_vstar.svg',
    pngFilename: 'lucario_vstar.png',
    title: 'LUCARIO VSTAR',
    subtitle: 'Pokémon VSTAR Universe',
    grade: 'PCG 10',
    gradeDesc: 'GEM MINT',
    cert: '10998421',
    primaryColor: '#06b6d4',
    secondaryColor: '#0284c7',
    accentColor: '#a5f3fc',
    bgGrad1: '#082f49',
    bgGrad2: '#1e1b4b',
    symbol: '🐺',
    jpName: 'ルカリオ VSTAR',
    hp: 'HP 270',
    type: 'FIGHTING / AURA'
  },
  {
    filename: 'great_saiyaman.svg',
    pngFilename: 'great_saiyaman.png',
    title: 'SS GREAT SAIYAMAN',
    subtitle: 'Dragon Ball Super',
    grade: 'PCG 10+',
    gradeDesc: 'PRISTINE',
    cert: '10998422',
    primaryColor: '#10b981',
    secondaryColor: '#f59e0b',
    accentColor: '#6ee7b7',
    bgGrad1: '#064e3b',
    bgGrad2: '#18181b',
    symbol: '💥',
    jpName: 'グレートサイヤマン',
    hp: 'BP 85000',
    type: 'SUPER SAIYAN'
  },
  {
    filename: 'vegetto.svg',
    pngFilename: 'vegetto.png',
    title: 'VEGETTO',
    subtitle: 'DB 40th Anniversary',
    grade: 'PCG 10+',
    gradeDesc: 'PRISTINE',
    cert: '10998423',
    primaryColor: '#6366f1',
    secondaryColor: '#3b82f6',
    accentColor: '#c7d2fe',
    bgGrad1: '#1e1b4b',
    bgGrad2: '#312e81',
    symbol: '✨',
    jpName: 'ベジット',
    hp: 'BP 99000',
    type: 'POTARA FUSION'
  },
  {
    filename: 'vegeta.svg',
    pngFilename: 'vegeta.png',
    title: 'VEGETA',
    subtitle: 'DBS Manga Booster',
    grade: 'PCG 10',
    gradeDesc: 'GEM MINT',
    cert: '10998424',
    primaryColor: '#a855f7',
    secondaryColor: '#7c3aed',
    accentColor: '#e9d5ff',
    bgGrad1: '#3b0764',
    bgGrad2: '#09090b',
    symbol: '👑',
    jpName: 'ベジータ',
    hp: 'BP 92000',
    type: 'ROYAL SAIYAN'
  },
  {
    filename: 'luffy_tarou.svg',
    pngFilename: 'luffy_tarou.png',
    title: 'LUFFY TAROU',
    subtitle: 'One Piece Card Game',
    grade: 'PCG 10+',
    gradeDesc: 'PRISTINE',
    cert: '10998425',
    primaryColor: '#ef4444',
    secondaryColor: '#dc2626',
    accentColor: '#fecaca',
    bgGrad1: '#450a0a',
    bgGrad2: '#18181b',
    symbol: '🏴‍☠️',
    jpName: 'ルフィ太郎',
    hp: 'POWER 7000',
    type: 'WANOKUNI / STRAW HAT'
  },
  {
    filename: 'uzumaki_naruto.svg',
    pngFilename: 'uzumaki_naruto.png',
    title: 'UZUMAKI NARUTO',
    subtitle: 'Naruto Card Game',
    grade: 'PCG 10+',
    gradeDesc: 'PRISTINE',
    cert: '10998426',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
    accentColor: '#fed7aa',
    bgGrad1: '#431407',
    bgGrad2: '#18181b',
    symbol: '🍥',
    jpName: 'うずまきナルト',
    hp: 'CHAKRA 9500',
    type: 'SAGE MODE'
  },
  {
    filename: 'ichigo_kurosaki.svg',
    pngFilename: 'ichigo_kurosaki.png',
    title: 'ICHIGO KUROSAKI',
    subtitle: 'Union Arena — Bleach',
    grade: 'PCG 10',
    gradeDesc: 'GEM MINT',
    cert: '10998427',
    primaryColor: '#f43f5e',
    secondaryColor: '#991b1b',
    accentColor: '#ffe4e6',
    bgGrad1: '#3f0713',
    bgGrad2: '#09090b',
    symbol: '⚔️',
    jpName: '黒崎 一護',
    hp: 'AP 4000',
    type: 'BANKAI / HOLLOW'
  }
];

function generateSvg(c) {
  const isPristine = c.grade.includes('+');
  const labelHeaderBg = isPristine ? '#854d0e' : '#1e1b4b';
  const labelAccent = isPristine ? '#fef08a' : '#c084fc';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 590" width="400" height="590">
  <defs>
    <!-- Slab Acrylic Reflection -->
    <linearGradient id="acrylic" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.03" />
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>

    <!-- Label Metallic Gradient -->
    <linearGradient id="labelGrad-${c.cert}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="${labelHeaderBg}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Card Holographic BG -->
    <linearGradient id="cardBg-${c.cert}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bgGrad1}" />
      <stop offset="60%" stop-color="${c.bgGrad2}" />
      <stop offset="100%" stop-color="#090a16" />
    </linearGradient>

    <!-- Foil Shimmer -->
    <linearGradient id="foil-${c.cert}" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${c.primaryColor}" stop-opacity="0.6" />
      <stop offset="30%" stop-color="${c.accentColor}" stop-opacity="0.9" />
      <stop offset="60%" stop-color="${c.secondaryColor}" stop-opacity="0.5" />
      <stop offset="100%" stop-color="${c.primaryColor}" stop-opacity="0.7" />
    </linearGradient>

    <!-- Rainbow Hologram Stamp -->
    <linearGradient id="holoStamp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="25%" stop-color="#eab308" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="75%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>

  <!-- OUTER SLAB CASING -->
  <rect x="6" y="6" width="388" height="578" rx="22" fill="#080914" stroke="#334155" stroke-width="2.5" />
  <rect x="12" y="12" width="376" height="566" rx="18" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
  <rect x="6" y="6" width="388" height="578" rx="22" fill="url(#acrylic)" />

  <!-- TOP PCG HEADER LABEL -->
  <g transform="translate(24, 22)">
    <!-- Label Background -->
    <rect x="0" y="0" width="352" height="74" rx="8" fill="url(#labelGrad-${c.cert})" stroke="${c.primaryColor}" stroke-width="1.2" />
    <rect x="3" y="3" width="346" height="68" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
    
    <!-- Left PCG Brand -->
    <rect x="8" y="8" width="56" height="58" rx="5" fill="#000000" stroke="${labelAccent}" stroke-width="1" />
    <text x="36" y="32" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="14" text-anchor="middle" letter-spacing="1">PCG</text>
    <text x="36" y="46" fill="${c.primaryColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="8.5" text-anchor="middle">AUTHENTIC</text>
    <circle cx="36" cy="56" r="3" fill="${labelAccent}" />

    <!-- Center Card Metadata -->
    <text x="74" y="24" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="12.5" letter-spacing="0.2">${c.title}</text>
    <text x="74" y="40" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="10.5">${c.subtitle}</text>
    
    <!-- Barcode simulation & Cert Number -->
    <g transform="translate(74, 48)">
      <line x1="0" y1="0" x2="0" y2="12" stroke="#ffffff" stroke-width="1.5" />
      <line x1="3" y1="0" x2="3" y2="12" stroke="#ffffff" stroke-width="1" />
      <line x1="6" y1="0" x2="6" y2="12" stroke="#ffffff" stroke-width="2.5" />
      <line x1="11" y1="0" x2="11" y2="12" stroke="#ffffff" stroke-width="1" />
      <line x1="14" y1="0" x2="14" y2="12" stroke="#ffffff" stroke-width="2" />
      <line x1="18" y1="0" x2="18" y2="12" stroke="#ffffff" stroke-width="1.5" />
      <line x1="22" y1="0" x2="22" y2="12" stroke="#ffffff" stroke-width="1" />
      <line x1="25" y1="0" x2="25" y2="12" stroke="#ffffff" stroke-width="3" />
      <line x1="30" y1="0" x2="30" y2="12" stroke="#ffffff" stroke-width="1" />
      <line x1="33" y1="0" x2="33" y2="12" stroke="#ffffff" stroke-width="2" />
      <text x="44" y="10" fill="#cbd5e1" font-family="monospace" font-size="9" letter-spacing="0.5">#${c.cert}</text>
    </g>

    <!-- Right Grade Score Box -->
    <rect x="268" y="8" width="76" height="58" rx="6" fill="#030712" stroke="${c.primaryColor}" stroke-width="1.5" />
    <text x="306" y="27" fill="${c.accentColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle" letter-spacing="0.5">${c.grade}</text>
    <text x="306" y="44" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="8.5" text-anchor="middle" letter-spacing="1">${c.gradeDesc}</text>
    <rect x="274" y="50" width="64" height="2" fill="${c.primaryColor}" rx="1" />
  </g>

  <!-- INNER SLAB CARD RECESS -->
  <rect x="24" y="108" width="352" height="428" rx="14" fill="#05060d" stroke="rgba(255,255,255,0.18)" stroke-width="1.8" />

  <!-- ACTUAL TRADING CARD INSIDE -->
  <g transform="translate(36, 120)">
    <!-- Card Base & Foil Background -->
    <rect x="0" y="0" width="328" height="404" rx="10" fill="url(#cardBg-${c.cert})" stroke="${c.primaryColor}" stroke-width="1.5" />
    
    <!-- Holographic Foil Pattern Overlays -->
    <rect x="6" y="6" width="316" height="392" rx="8" fill="none" stroke="url(#foil-${c.cert})" stroke-width="1" opacity="0.8" />
    
    <!-- Top Card Header: Name & HP -->
    <rect x="12" y="12" width="304" height="34" rx="6" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
    <text x="24" y="34" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13">${c.title}</text>
    <text x="24" y="20" fill="${c.accentColor}" font-family="system-ui, sans-serif" font-weight="600" font-size="7.5">${c.jpName}</text>
    <text x="302" y="33" fill="${c.primaryColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="12" text-anchor="end">${c.hp}</text>

    <!-- Character Artwork Portal -->
    <rect x="12" y="52" width="304" height="230" rx="8" fill="#000000" stroke="${c.primaryColor}" stroke-width="1" />
    
    <!-- Dynamic Energy Radial Glow -->
    <circle cx="164" cy="167" r="90" fill="${c.primaryColor}" opacity="0.25" />
    <circle cx="164" cy="167" r="55" fill="${c.accentColor}" opacity="0.35" />

    <!-- Stylized Anime Foil Icon -->
    <text x="164" y="185" font-size="64" text-anchor="middle" filter="drop-shadow(0px 8px 16px ${c.primaryColor})">${c.symbol}</text>
    <text x="164" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="17" text-anchor="middle" letter-spacing="2">${c.title}</text>
    <text x="164" y="255" fill="${c.accentColor}" font-family="system-ui, sans-serif" font-weight="700" font-size="9" text-anchor="middle" letter-spacing="1">★ SPECIAL SECRET FOIL EDITION ★</text>

    <!-- Card Description & Attack Box -->
    <rect x="12" y="290" width="304" height="98" rx="8" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" />
    
    <!-- Move 1 -->
    <circle cx="28" cy="315" r="7" fill="${c.primaryColor}" />
    <circle cx="46" cy="315" r="7" fill="${c.secondaryColor}" />
    <text x="62" y="320" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="12">${c.type}</text>
    <text x="302" y="320" fill="${c.accentColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="14" text-anchor="end">280+</text>

    <line x1="20" y1="334" x2="308" y2="334" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

    <!-- Card Bottom Footer Info -->
    <text x="24" y="356" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="8">Illus. FP Zerofour Card Studio</text>
    <text x="24" y="372" fill="#64748b" font-family="monospace" font-size="7.5">2025 Special Promo © Nintendo / Shueisha / Toei</text>
    
    <!-- Rarity Gold Stars -->
    <text x="302" y="365" fill="${c.primaryColor}" font-size="11" text-anchor="end">★★★★★</text>
  </g>

  <!-- BOTTOM SLAB EMBOSSING & HOLOGRAM STAMP -->
  <g transform="translate(24, 544)">
    <text x="8" y="18" fill="rgba(255,255,255,0.3)" font-family="system-ui, sans-serif" font-weight="800" font-size="10" letter-spacing="1.5">PCG GRADED AUTHENTIC</text>
    <!-- Hologram Diamond Seal -->
    <polygon points="334,8 344,16 334,24 324,16" fill="url(#holoStamp)" opacity="0.9" stroke="#ffffff" stroke-width="0.5" />
    <text x="334" y="19" fill="#000000" font-family="system-ui, sans-serif" font-weight="900" font-size="8" text-anchor="middle">10</text>
  </g>

  <!-- Diagonal Acrylic Glare / Frosted Shine Line -->
  <path d="M 6 120 L 220 6 L 240 6 L 6 140 Z" fill="#ffffff" opacity="0.06" />
  <path d="M 6 360 L 394 120 L 394 140 L 6 380 Z" fill="#ffffff" opacity="0.04" />
</svg>`;
}

for (const card of cards) {
  const svgContent = generateSvg(card);
  const svgPath = path.join(outDir, card.filename);
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  
  // Also create .png duplicate file with the svg content so both extensions resolve
  const pngPath = path.join(outDir, card.pngFilename);
  fs.writeFileSync(pngPath, svgContent, 'utf-8');
  console.log(`Generated: ${card.filename} & ${card.pngFilename}`);
}
console.log('All 8 graded card slab images generated successfully!');
