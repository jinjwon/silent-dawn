# 타이틀 키아트 · 2026-10-03

내장 이미지 생성 도구로 제작. 원본은 `public/assets/title/silent-dawn-keyart.png`이며 게임 시작 화면과 GitHub README가 같은 파일을 사용한다. 소개용 키아트로, 실제 플레이 화면의 스크린샷은 아니다. 생성 결과의 한국어 제목과 영어 부제를 육안으로 확인했다.

## 최종 프롬프트
Create a polished premium fantasy RPG title key visual as a wide 16:9 landscape image. Original Korean indie pixel-fantasy game titled EXACT Korean text '종이 잠든 새벽', smaller English subtitle 'SILENT DAWN'. The Korean title must be perfectly readable and carefully typeset as elegant large ivory and antique gold calligraphic serif lettering centered in upper-middle, restrained ornamental details. Above the title an exquisite broken sleeping bell sigil with a small star, delicate circular seal linework. Deep midnight teal and forest green, luminous antique gold, warm ivory. Bottom right two small original anime-inspired adventurers seen from behind: a short brown-haired male wanderer with teal cape and sword, and silver long-haired female knight with navy cape, ivory armor and star shield. They overlook a misty medieval forest village and a distant illuminated gothic bell tower under a waning crescent moon. Composition spacious editorial luxury, cinematic depth, lovingly detailed pixel-art landscape with crisp pixel edges, no plastic 3D rendering, no recognizable existing franchise characters. Title occupies clear dark sky area, no busy texture behind letters. Mood melancholy, hopeful, a promise shared by two souls. No UI buttons, no badges, no fake screenshots, no extra words, no watermark. The resulting art will be a game title screen and GitHub README hero banner.

## V2 · 실제 게임 화면용 재설계 (2026-10-03)

### 문제와 결정
기존 배너는 로고가 배경에 붙어 있어 모바일에서 함께 축소되고, 메뉴와 장면 사이에 큰 공백이 생겼다. 배경은 새로 생성하고 제목·설명·버튼은 HTML로 분리했다. 화면 비율에 따라 배경만 자르고 글자는 읽을 수 있는 크기로 유지한다. 과도하게 큰 왕도 대신 프롤로그의 에델 마을, 단일 종탑, 두 동료를 장면 중심에 둔다.

### 현재 공식 참고
- [Sea of Stars 공식 사이트](https://seaofstarsgame.co/): 2026-10-03 현재 화면에서 넓은 캐릭터 키아트와 별도 내비게이션을 관찰했다. 장면과 조작 영역을 분리하는 방식에 참고했다. 원작 이미지·캐릭터·UI 파일은 사용하지 않았다.
- [OCTOPATH TRAVELER II 공식 소개](https://www.square-enix.com/asia/newsportal/en/sg/octopathii/): 픽셀 캐릭터와 깊이 있는 환경을 함께 보여주는 방향을 참고했다. 본 게임은 Canvas 2D이며 해당 작품의 3D 렌더링 기술을 구현한 것은 아니다.

### V2 생성 프롬프트
Use case: stylized-concept. Production background art for original Korean pixel fantasy RPG SILENT DAWN, no text whatsoever. Widescreen 16:9 detailed pixel art with deliberate crisp pixel clusters, beautiful layered environmental lighting. Narrative: a small intimate medieval forest village called Edel whose morning bell has stopped; two travelers approach its last bell tower before dawn. NOT an enormous city, NOT royal palace. Modest stone chapel with a single bell tower and visibly silent bronze bell at right-of-center, softly lit rose window; 5 small timber cottages below, winding stone path through meadow and mist. Two original small anime-inspired adventurers stand together on foreground path at 65 percent image width: brown-haired wanderer wearing teal cape carrying a sword; silver-haired female knight in ivory armor and navy cape with a star shield. Full figures seen from behind, silhouette readable, companions not romantic pose. Ancient sealed stone ring near chapel, faint gold crack and a few warm fireflies. Night forest teal, desaturated blue, ivory moonlight, subtle warm gold lights, approaching dawn barely visible at horizon. Composition for real responsive game UI: LEFT 42 percent must be calm dark misty forest with very low detail and no bright highlights, reserved for large overlaid heading and controls; focal tower and two heroes inside middle-right 45-80 percent so center-right portrait crop remains meaningful. Upper sky calm. Bottom 20 percent muted darker foreground for navigation. Elegant restrained illustration, strong depth in 3 planes, atmospheric but crisp. No lettering, no logos, no borders, no UI, no watermarks. Entire canvas filled with continuous scene.

내장 이미지 생성 도구 사용. V2 파일: `public/assets/title/edel-title-v2.png`. 기존 로고 포함 이미지는 README 소개 배너로 보존했다.
