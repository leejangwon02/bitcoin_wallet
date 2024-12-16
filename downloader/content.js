// 디버그용 로그 함수
function debugLog(message) {
  console.log(`[Image Video Downloader] ${message}`);
}

// 다운로드 버튼 관리를 위한 상태 객체
const DownloadButtonManager = {
  currentButton: null,
  currentTarget: null,

  create(target, sourceUrl) {
    // 기존 버튼 제거
    this.remove();

    const downloadButton = document.createElement('div');
    downloadButton.textContent = '📥 다운로드';
    downloadButton.id = 'image-video-downloader-button';
    
    // 고정된 스타일 적용
    downloadButton.style.cssText = `
      position: fixed;
      z-index: 10000;
      background-color: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      pointer-events: auto;
    `;
    
    // 위치 계산
    const rect = target.getBoundingClientRect();
    downloadButton.style.top = `${rect.top + window.scrollY + 10}px`;
    downloadButton.style.left = `${rect.left + window.scrollX + 10}px`;
    
    // 클릭 이벤트
    downloadButton.addEventListener('click', function(e) {
      e.stopPropagation();
      debugLog(`다운로드 시도: ${sourceUrl}`);
      chrome.runtime.sendMessage({
        action: 'download',
        url: sourceUrl
      });
    });

    // 버튼 상태 업데이트
    this.currentButton = downloadButton;
    this.currentTarget = target;

    // 문서에 추가
    document.body.appendChild(downloadButton);
  },

  remove() {
    if (this.currentButton) {
      this.currentButton.remove();
      this.currentButton = null;
      this.currentTarget = null;
    }
  },

  isValidMedia(target) {
    const sourceUrl = 
      target.src || 
      target.currentSrc || 
      (target.tagName === 'DIV' && window.getComputedStyle(target).backgroundImage.slice(4, -1).replace(/"/g, "")) ||
      null;
    
    return (
      (target.tagName === 'IMG' || 
       target.tagName === 'VIDEO' || 
       (target.tagName === 'DIV' && sourceUrl && sourceUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|mp4|webm)$/i))
      ) && sourceUrl
    );
  }
};

// 스로틀링을 위한 함수
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func.apply(this, args);
  }
}

// 마우스 오버 이벤트 (스로틀링 적용)
document.addEventListener('mouseover', throttle(function(event) {
  const target = event.target;
  
  // 이미 같은 대상이면 무시
  if (target === DownloadButtonManager.currentTarget) return;
  
  // 유효한 미디어 확인
  if (DownloadButtonManager.isValidMedia(target)) {
    const sourceUrl = target.src || target.currentSrc || 
      window.getComputedStyle(target).backgroundImage.slice(4, -1).replace(/"/g, "");
    
    debugLog(`유효한 미디어 발견: ${target.tagName}, URL: ${sourceUrl}`);
    
    // 다운로드 버튼 생성
    DownloadButtonManager.create(target, sourceUrl);
  }
}, 200));

// 마우스 아웃 이벤트
document.addEventListener('mouseout', function(event) {
  // 관련 없는 요소로 이동할 때만 버튼 제거
  if (!event.relatedTarget || !event.relatedTarget.contains(DownloadButtonManager.currentTarget)) {
    DownloadButtonManager.remove();
  }
});

// 클릭 이벤트 전파 방지 (버튼 클릭 가능하도록)
document.addEventListener('click', function(event) {
  const downloadButton = document.getElementById('image-video-downloader-button');
  if (downloadButton && downloadButton.contains(event.target)) {
    event.stopPropagation();
  }
});

// 로딩 확인 메시지
debugLog('콘텐츠 스크립트 성공적으로 로드됨');
