(() => {
  const video = document.getElementById('about-video');
  const aboutSection = document.getElementById('ueber-uns');
  if (!video || !aboutSection) return;

  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.loop = true;
  video.playsInline = true;

  let started = false;
  const startVideo = () => {
    if (started) return;
    const playAttempt = video.play();
    if (!playAttempt || typeof playAttempt.then !== 'function') {
      started = true;
      return;
    }
    playAttempt.then(() => {
      started = true;
    }).catch(() => {
      video.addEventListener('canplay', () => {
        video.play().then(() => { started = true; }).catch(() => {});
      }, { once: true });
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      startVideo();
    }, { threshold: 0.2, rootMargin: '100px 0px' });
    observer.observe(aboutSection);
  } else {
    startVideo();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && aboutSection.getBoundingClientRect().top < window.innerHeight) {
      startVideo();
    }
  });
})();
