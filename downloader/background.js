chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    console.log('다운로드 요청 받음:', request.url);
    
    // 파일 이름 추출 (URL의 마지막 부분 사용)
    const filename = request.url.split('/').pop().split('?')[0];
    
    try {
      chrome.downloads.download({
        url: request.url,
        filename: filename,
        saveAs: false // 자동으로 다운로드
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('다운로드 중 오류:', chrome.runtime.lastError);
          // 실패 시 저장 위치 선택 모드로 전환
          chrome.downloads.download({
            url: request.url,
            saveAs: true
          });
        } else {
          console.log('다운로드 시작:', downloadId);
        }
      });
    } catch (error) {
      console.error('다운로드 예외 발생:', error);
    }
  }
});
