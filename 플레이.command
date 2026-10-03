#!/bin/zsh
cd "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  print 'Node.js 22 이상이 필요합니다. nodejs.org에서 설치해 주세요.'
  read '?Enter 키를 누르면 닫힙니다.'
  exit 1
fi
if curl -fsS --max-time 2 http://localhost:4177/ 2>/dev/null | grep -q '종이 잠든 새벽'; then
  open 'http://localhost:4177/'
  exit 0
fi
print '종이 잠든 새벽 — 이 창을 켜 두세요. 종료: Ctrl+C'
(sleep 1; open 'http://localhost:4177/') &
node server.mjs
