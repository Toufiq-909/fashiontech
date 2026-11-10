const folds = "rgba(61,60,66,0.18)";

export function garmentMarkup(category: string, colour: string) {
  const body = `fill="${colour}" stroke="rgba(61,60,66,0.55)" stroke-width="2" stroke-linejoin="round"`;
  const detail = `fill="none" stroke="${folds}" stroke-width="2.5" stroke-linecap="round"`;
  switch (category) {
    case "shirts":
      return `
        <path d="M130 122 L176 100 L200 130 L224 100 L270 122 L298 164 L266 192 L256 174 L256 424 L144 424 L144 174 L134 192 L102 164 Z" ${body}/>
        <path d="M176 100 L200 130 L224 100 L214 92 L200 112 L186 92 Z" fill="rgba(61,60,66,0.16)" stroke="rgba(61,60,66,0.4)" stroke-width="2"/>
        <path d="M200 132 L200 424" ${detail}/>
        <circle cx="200" cy="178" r="4" fill="rgba(61,60,66,0.45)"/>
        <circle cx="200" cy="238" r="4" fill="rgba(61,60,66,0.45)"/>
        <circle cx="200" cy="298" r="4" fill="rgba(61,60,66,0.45)"/>
        <circle cx="200" cy="358" r="4" fill="rgba(61,60,66,0.45)"/>
        <rect x="146" y="168" width="40" height="42" rx="4" fill="none" stroke="${folds}" stroke-width="2"/>
        <path d="M160 424 Q200 434 240 424" ${detail}/>`;
    case "hoodies":
      return `
        <path d="M158 128 Q200 68 242 128 Q252 158 232 176 L168 176 Q148 158 158 128 Z" fill="rgba(61,60,66,0.14)" stroke="rgba(61,60,66,0.45)" stroke-width="2"/>
        <path d="M130 158 Q166 136 200 136 Q234 136 270 158 L302 204 L272 234 L260 216 L260 414 Q200 428 140 414 L140 216 L128 234 L98 204 Z" ${body}/>
        <path d="M172 140 L168 214 M228 140 L232 214" ${detail}/>
        <path d="M162 322 L238 322 L238 384 L162 384 Z" fill="none" stroke="${folds}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M174 186 L174 218 M226 186 L226 218" stroke="rgba(61,60,66,0.4)" stroke-width="3" stroke-linecap="round"/>`;
    case "pants":
    case "joggers":
      return `
        <rect x="140" y="104" width="120" height="34" rx="8" ${body}/>
        <path d="M142 138 L258 138 L272 448 L220 448 L204 250 Q200 236 196 250 L180 448 L128 448 Z" ${body}/>
        <path d="M200 140 L200 246" ${detail}/>
        ${
          category === "joggers"
            ? `<rect x="128" y="418" width="54" height="30" rx="8" fill="rgba(61,60,66,0.14)" stroke="rgba(61,60,66,0.4)" stroke-width="2"/>
               <rect x="218" y="418" width="54" height="30" rx="8" fill="rgba(61,60,66,0.14)" stroke="rgba(61,60,66,0.4)" stroke-width="2"/>`
            : ""
        }
        <path d="M170 120 Q200 128 230 120" stroke="rgba(61,60,66,0.35)" stroke-width="3" fill="none"/>`;
    case "shorts":
      return `
        <rect x="140" y="132" width="120" height="30" rx="8" ${body}/>
        <path d="M142 162 L258 162 L266 312 L214 312 L202 232 Q200 224 198 232 L186 312 L134 312 Z" ${body}/>
        <path d="M200 164 L200 230" ${detail}/>`;
    case "accessories":
      return `
        <path d="M132 150 Q132 122 156 122 L186 122 L186 392 Q186 420 160 420 Q134 420 134 392 Z" ${body}/>
        <path d="M214 150 Q214 122 238 122 L268 122 L268 392 Q268 420 242 420 Q216 420 216 392 Z" ${body}/>
        <path d="M132 210 L186 210 M214 210 L268 210" ${detail}/>`;
    default:
      return `
        <path d="M126 132 C150 114 170 106 200 106 C230 106 250 114 274 132 L302 174 L270 204 L258 186 L258 396 C220 410 180 410 142 396 L142 186 L130 204 L98 174 Z" ${body}/>
        <path d="M176 110 Q200 136 224 110" fill="rgba(61,60,66,0.14)" stroke="rgba(61,60,66,0.4)" stroke-width="2"/>
        <path d="M160 260 Q200 272 240 260" ${detail}/>`;
  }
}

export function garmentSvg(category: string, colour: string, transparent = false) {
  const background = transparent
    ? ""
    : `<rect width="400" height="500" fill="#F1DEC4"/>
       <circle cx="330" cy="96" r="86" fill="rgba(254,251,246,0.35)"/>
       <circle cx="58" cy="420" r="110" fill="rgba(103,126,97,0.12)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img">${background}${garmentMarkup(category, colour)}</svg>`;
}
