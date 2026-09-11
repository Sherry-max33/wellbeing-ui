(function () {
  const screens = {
    welcome: document.getElementById("screen-welcome"),
    home: document.getElementById("screen-home"),
    diary: document.getElementById("screen-diary"),
    insights: document.getElementById("screen-insights"),
    mood: document.getElementById("screen-mood"),
    chat: document.getElementById("screen-chat"),
  };

  const dots = document.querySelectorAll(".screen-dot");

  function closeDiarySummarySheet() {
    const sheet = document.getElementById("diary-summary-sheet");
    const btn = document.getElementById("btn-diary-perspective");
    const shell = document.querySelector("#screen-diary .diary-shell");
    const floats = document.getElementById("diary-float-actions");
    if (!sheet) return;
    sheet.classList.remove("diary-summary-sheet--open");
    sheet.setAttribute("aria-hidden", "true");
    if (btn) btn.setAttribute("aria-expanded", "false");
    shell?.classList.remove("diary-shell--reflection-open");
    if (floats) {
      floats.hidden = false;
      floats.setAttribute("aria-hidden", "false");
    }
  }

  function showScreen(name) {
    if (name !== "diary") closeDiarySummarySheet();
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      const active = key === name;
      el.hidden = !active;
      el.classList.toggle("screen--active", active);
    });
    if (name === "home" || name === "welcome" || name === "chat") {
      dots.forEach((dot) => {
        const go = dot.getAttribute("data-go");
        const on = go === name;
        dot.classList.toggle("screen-dot--active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
  }

  function setHomeTabActive(tabBtn) {
    if (!tabBtn) return;
    document.querySelectorAll("#screen-home .home-tabbar .home-tab").forEach((t) => {
      t.classList.remove("home-tab--active");
    });
    tabBtn.classList.add("home-tab--active");
  }

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav");
      if (!target || !screens[target]) return;
      if (target === "home") {
        const t1 = document.getElementById("btn-home-tab-1");
        if (t1) setHomeTabActive(t1);
      }
      if (target === "insights") {
        const diary = document.getElementById("screen-diary");
        const insights = document.getElementById("screen-insights");
        if (diary && insights) {
          insights.setAttribute("data-home-theme", diary.getAttribute("data-home-theme") || "night");
          insights.setAttribute("data-home-season", diary.getAttribute("data-home-season") || "summer");
        }
      }
      showScreen(target);
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const go = dot.getAttribute("data-go");
      if (go && screens[go]) showScreen(go);
    });
  });

  const voiceWelcome = document.getElementById("btn-voice-welcome");
  if (voiceWelcome) {
    voiceWelcome.addEventListener("click", () => showScreen("home"));
  }

  document.querySelectorAll(".dock--welcome .icon-btn").forEach((btn, i) => {
    if (i === 0) btn.addEventListener("click", () => showScreen("home"));
  });

  document.querySelectorAll("[data-open-chat]").forEach((el) => {
    el.addEventListener("click", () => showScreen("chat"));
  });

  const statusTime = document.getElementById("status-time");
  function updateStatusTime() {
    if (!statusTime) return;
    const now = new Date();
    statusTime.textContent = now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  }
  updateStatusTime();
  setInterval(updateStatusTime, 30000);

  const heroVideo = document.querySelector(".hero-mascot__video");
  if (heroVideo) {
    const tryPlay = () => heroVideo.play().catch(() => {});
    tryPlay();
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tryPlay();
    });
  }

  const homeScreen = document.getElementById("screen-home");
  const btnDayNight = document.getElementById("btn-home-daynight");
  const btnSeason = document.getElementById("btn-home-season");

  const SEASONS = ["spring", "summer", "autumn", "winter"];
  const SEASON_LABEL = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };

  function syncHomeChrome() {
    if (!homeScreen || !btnSeason || !btnDayNight) return;
    const season = homeScreen.getAttribute("data-home-season") || "summer";
    const theme = homeScreen.getAttribute("data-home-theme") || "night";
    btnSeason.textContent = SEASON_LABEL[season] || "Summer";
    btnDayNight.setAttribute(
      "aria-label",
      theme === "night" ? "切换为白天模式" : "切换为夜晚模式"
    );
    try {
      localStorage.setItem("wellbeing-home-theme", theme);
      localStorage.setItem("wellbeing-home-season", season);
    } catch (_) {}
  }

  function syncDiaryThemeFromHome() {
    const diary = document.getElementById("screen-diary");
    if (!homeScreen || !diary) return;
    diary.setAttribute("data-home-theme", homeScreen.getAttribute("data-home-theme") || "night");
    diary.setAttribute("data-home-season", homeScreen.getAttribute("data-home-season") || "summer");
  }

  function syncMoodThemeFromHome() {
    const mood = document.getElementById("screen-mood");
    if (!homeScreen || !mood) return;
    mood.setAttribute("data-home-theme", homeScreen.getAttribute("data-home-theme") || "night");
    mood.setAttribute("data-home-season", homeScreen.getAttribute("data-home-season") || "summer");
  }

  function setMoodSubTab(which) {
    const tTrack = document.getElementById("mood-tab-tracking");
    const tSum = document.getElementById("mood-tab-summary");
    const pTrack = document.getElementById("mood-panel-tracking");
    const pSum = document.getElementById("mood-panel-summary");
    if (!tTrack || !tSum || !pTrack || !pSum) return;
    const track = which === "tracking";
    tTrack.classList.toggle("mood-seg__btn--active", track);
    tSum.classList.toggle("mood-seg__btn--active", !track);
    tTrack.setAttribute("aria-selected", track ? "true" : "false");
    tSum.setAttribute("aria-selected", track ? "false" : "true");
    pTrack.hidden = !track;
    pSum.hidden = track;
  }

  function openMoodScreen() {
    syncMoodThemeFromHome();
    setMoodSubTab("tracking");
    showScreen("mood");
  }

  if (homeScreen && btnSeason && btnDayNight) {
    try {
      const t = localStorage.getItem("wellbeing-home-theme");
      const s = localStorage.getItem("wellbeing-home-season");
      if (t === "day" || t === "night") homeScreen.setAttribute("data-home-theme", t);
      if (s && SEASONS.includes(s)) homeScreen.setAttribute("data-home-season", s);
    } catch (_) {}

    btnDayNight.addEventListener("click", () => {
      const next = homeScreen.getAttribute("data-home-theme") === "day" ? "night" : "day";
      homeScreen.setAttribute("data-home-theme", next);
      syncHomeChrome();
      syncDiaryThemeFromHome();
    });

    btnSeason.addEventListener("click", () => {
      const cur = homeScreen.getAttribute("data-home-season") || "summer";
      const i = SEASONS.indexOf(cur);
      const next = SEASONS[(i + 1) % SEASONS.length];
      homeScreen.setAttribute("data-home-season", next);
      syncHomeChrome();
      syncDiaryThemeFromHome();
    });

    syncHomeChrome();
    syncDiaryThemeFromHome();
  } else if (homeScreen) {
    syncDiaryThemeFromHome();
  }

  const immLayer = document.getElementById("imm-chat-layer");
  const immVideo = immLayer?.querySelector(".imm-chat-layer__video");
  const immScroll = document.getElementById("imm-chat-scroll");
  const immComposerInput = document.getElementById("imm-chat-composer-input");
  const btnImmHome = document.getElementById("btn-imm-chat-home");
  const homeChatField = document.querySelector(".home-chat-bar__field");
  const homeChatInput = document.querySelector(".home-chat-bar__input");

  function staggerImmMessages() {
    if (!immScroll) return;
    immScroll.querySelectorAll(".imm-msg, .imm-chat-meta").forEach((el, i) => {
      el.style.setProperty("--imm-delay", `${0.05 + i * 0.065}s`);
    });
  }

  function openImmChat() {
    if (!immLayer || immLayer.hidden === false) return;
    immLayer.classList.remove("imm-chat-layer--visible");
    if (immScroll) {
      immScroll.querySelectorAll(".imm-msg, .imm-chat-meta").forEach((el) => {
        el.style.animation = "none";
      });
      void immScroll.offsetHeight;
      staggerImmMessages();
    }

    immLayer.hidden = false;
    immLayer.setAttribute("aria-hidden", "false");
    if (heroVideo) heroVideo.pause();
    immVideo?.play().catch(() => {});

    const draft = homeChatInput?.value?.trim();
    if (draft && immComposerInput) {
      immComposerInput.value = draft;
      if (homeChatInput) homeChatInput.value = "";
    }

    void immLayer.offsetWidth;
    requestAnimationFrame(() => {
      immLayer.classList.add("imm-chat-layer--visible");
      immScroll?.querySelectorAll(".imm-msg, .imm-chat-meta").forEach((el) => {
        el.style.removeProperty("animation");
      });
    });

    setTimeout(() => {
      if (immScroll) immScroll.scrollTop = immScroll.scrollHeight;
      immComposerInput?.focus();
    }, 400);
  }

  function closeImmChat() {
    if (!immLayer || immLayer.hidden) return;
    immLayer.classList.remove("imm-chat-layer--visible");
    immVideo?.pause();

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      immLayer.hidden = true;
      immLayer.setAttribute("aria-hidden", "true");
      if (heroVideo) heroVideo.play().catch(() => {});
      immLayer.removeEventListener("transitionend", onTrans);
      clearTimeout(fallback);
    };

    const onTrans = (e) => {
      if (e.target !== immLayer || e.propertyName !== "opacity") return;
      done();
    };
    immLayer.addEventListener("transitionend", onTrans);
    const fallback = setTimeout(done, 480);
  }

  homeChatField?.addEventListener("pointerdown", (e) => {
    if (e.target.closest?.(".home-chat-bar__voice")) return;
    if (!immLayer || immLayer.hidden === false) return;
    e.preventDefault();
    openImmChat();
  });

  if (homeChatInput) {
    homeChatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        openImmChat();
      }
    });
  }

  btnImmHome?.addEventListener("click", closeImmChat);

  const callLayer = document.getElementById("call-video-layer");
  const callVideo = document.getElementById("call-video-full");
  const btnHomeCall = document.getElementById("btn-home-call");
  const btnCallClose = document.getElementById("call-video-close");

  const gardenLayer = document.getElementById("garden-video-layer");
  const gardenHomeImage = document.getElementById("garden-home-image");
  const btnHomeTab1 = document.getElementById("btn-home-tab-1");
  const btnHomeTab2 = document.getElementById("btn-home-tab-2");
  const btnHomeTabGarden = document.getElementById("btn-home-tab-garden");
  const btnHomeTabCourse = document.getElementById("btn-home-tab-course");
  const btnGardenClose = document.getElementById("garden-video-close");
  const gardenStreakN = document.getElementById("garden-streak-n");

  function bumpGardenStreak() {
    if (!gardenStreakN) return;
    try {
      let n = parseInt(localStorage.getItem("wellbeing-garden-streak") || "0", 10);
      if (Number.isNaN(n)) n = 0;
      n += 1;
      localStorage.setItem("wellbeing-garden-streak", String(n));
      gardenStreakN.textContent = String(n);
    } catch (_) {
      const cur = parseInt(gardenStreakN.textContent || "0", 10);
      gardenStreakN.textContent = String((Number.isNaN(cur) ? 0 : cur) + 1);
    }
  }

  function forceCloseCallVideo() {
    if (!callLayer || callLayer.hidden) return;
    callLayer.classList.remove("call-video-layer--visible");
    callVideo?.pause();
    callLayer.hidden = true;
    callLayer.setAttribute("aria-hidden", "true");
  }

  function forceCloseGardenVideo() {
    if (!gardenLayer || gardenLayer.hidden) return;
    gardenLayer.classList.remove("call-video-layer--visible");
    gardenLayer.hidden = true;
    gardenLayer.setAttribute("aria-hidden", "true");
  }

  function openCallVideo() {
    if (!callLayer || !callVideo || callLayer.hidden === false) return;
    forceCloseGardenVideo();
    callLayer.classList.remove("call-video-layer--visible");
    callLayer.hidden = false;
    callLayer.setAttribute("aria-hidden", "false");
    if (heroVideo) heroVideo.pause();
    if (immLayer && immLayer.hidden === false && immVideo) immVideo.pause();

    callVideo.muted = true;
    callVideo.playsInline = true;
    callVideo.loop = true;

    const startPlayback = () => {
      try {
        callVideo.currentTime = 0;
      } catch (_) {}
      callVideo.play().catch(() => {});
    };

    if (callVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
    } else {
      callVideo.addEventListener("loadeddata", startPlayback, { once: true });
      callVideo.addEventListener("canplay", startPlayback, { once: true });
      try {
        callVideo.load();
      } catch (_) {}
    }

    void callLayer.offsetWidth;
    requestAnimationFrame(() => {
      callLayer.classList.add("call-video-layer--visible");
      // Layer was display:none; nudge play again once visible
      callVideo.play().catch(() => {});
    });
  }

  function closeCallVideo() {
    if (!callLayer || !callVideo || callLayer.hidden) return;
    if (document.fullscreenElement === callVideo) {
      document.exitFullscreen?.().catch(() => {});
    }
    callLayer.classList.remove("call-video-layer--visible");
    callVideo.pause();

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      callLayer.hidden = true;
      callLayer.setAttribute("aria-hidden", "true");
      if (immLayer && immLayer.hidden === false && immVideo) {
        immVideo.play().catch(() => {});
      } else if (heroVideo) {
        heroVideo.play().catch(() => {});
      }
      callLayer.removeEventListener("transitionend", onTrans);
      clearTimeout(fallback);
    };

    const onTrans = (e) => {
      if (e.target !== callLayer || e.propertyName !== "opacity") return;
      done();
    };
    callLayer.addEventListener("transitionend", onTrans);
    const fallback = setTimeout(done, 420);
  }

  function openGardenVideo() {
    if (!gardenLayer || !gardenHomeImage || gardenLayer.hidden === false) return;
    forceCloseCallVideo();
    gardenLayer.classList.remove("call-video-layer--visible");
    bumpGardenStreak();
    gardenLayer.hidden = false;
    gardenLayer.setAttribute("aria-hidden", "false");
    if (heroVideo) heroVideo.pause();
    if (immLayer && immLayer.hidden === false && immVideo) immVideo.pause();
    void gardenLayer.offsetWidth;
    requestAnimationFrame(() => {
      gardenLayer.classList.add("call-video-layer--visible");
    });
  }

  function closeGardenVideo() {
    if (!gardenLayer || gardenLayer.hidden) return;
    gardenLayer.classList.remove("call-video-layer--visible");

    let gDone = false;
    const gardenFinish = () => {
      if (gDone) return;
      gDone = true;
      gardenLayer.hidden = true;
      gardenLayer.setAttribute("aria-hidden", "true");
      if (immLayer && immLayer.hidden === false && immVideo) {
        immVideo.play().catch(() => {});
      } else if (heroVideo) {
        heroVideo.play().catch(() => {});
      }
      gardenLayer.removeEventListener("transitionend", onGardenTrans);
      clearTimeout(gardenFallback);
    };

    const onGardenTrans = (e) => {
      if (e.target !== gardenLayer || e.propertyName !== "opacity") return;
      gardenFinish();
    };
    gardenLayer.addEventListener("transitionend", onGardenTrans);
    const gardenFallback = setTimeout(gardenFinish, 420);
  }

  btnHomeCall?.addEventListener("click", openCallVideo);
  document.getElementById("btn-imm-call")?.addEventListener("click", openCallVideo);
  btnCallClose?.addEventListener("click", closeCallVideo);

  function openHomeTab2() {
    syncDiaryThemeFromHome();
    showScreen("diary");
  }

  btnHomeTab1?.addEventListener("click", () => {
    setHomeTabActive(btnHomeTab1);
    showScreen("home");
  });

  btnHomeTab2?.addEventListener("click", () => {
    setHomeTabActive(btnHomeTab2);
    openHomeTab2();
  });

  btnHomeTabGarden?.addEventListener("click", () => {
    setHomeTabActive(btnHomeTabGarden);
    openGardenVideo();
  });

  document.getElementById("btn-toolbar-garden")?.addEventListener("click", () => {
    setHomeTabActive(btnHomeTabGarden);
    openGardenVideo();
  });

  btnHomeTabCourse?.addEventListener("click", () => {
    setHomeTabActive(btnHomeTabCourse);
    openMoodScreen();
  });

  document.getElementById("btn-home-avatar-mood")?.addEventListener("click", () => {
    openMoodScreen();
  });

  document.getElementById("btn-mood-back")?.addEventListener("click", () => {
    showScreen("home");
  });

  document.getElementById("mood-tab-tracking")?.addEventListener("click", () => {
    setMoodSubTab("tracking");
  });

  document.getElementById("mood-tab-summary")?.addEventListener("click", () => {
    setMoodSubTab("summary");
  });

  btnGardenClose?.addEventListener("click", closeGardenVideo);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (gardenLayer && !gardenLayer.hidden) closeGardenVideo();
    else if (callLayer && !callLayer.hidden) closeCallVideo();
    else if (immLayer && !immLayer.hidden) closeImmChat();
    else {
      const sheet = document.getElementById("diary-summary-sheet");
      if (sheet?.classList.contains("diary-summary-sheet--open")) {
        closeDiarySummarySheet();
        document.getElementById("btn-diary-perspective")?.focus();
      }
    }
  });

  (function initDiaryPerspectiveSummary() {
    const sheet = document.getElementById("diary-summary-sheet");
    const btnPerspective = document.getElementById("btn-diary-perspective");
    const btnClose = document.getElementById("btn-diary-summary-close");
    const backdrop = sheet?.querySelector(".diary-summary-sheet__backdrop");
    if (!sheet || !btnPerspective) return;

    function openDiarySummarySheet() {
      const shell = document.querySelector("#screen-diary .diary-shell");
      const floats = document.getElementById("diary-float-actions");
      sheet.classList.add("diary-summary-sheet--open");
      sheet.setAttribute("aria-hidden", "false");
      btnPerspective.setAttribute("aria-expanded", "true");
      shell?.classList.add("diary-shell--reflection-open");
      if (floats) {
        floats.hidden = true;
        floats.setAttribute("aria-hidden", "true");
      }
      queueMicrotask(() => btnClose?.focus());
    }

    function toggleDiarySummarySheet() {
      if (sheet.classList.contains("diary-summary-sheet--open")) closeDiarySummarySheet();
      else openDiarySummarySheet();
    }

    btnPerspective.addEventListener("click", () => {
      toggleDiarySummarySheet();
    });
    btnClose?.addEventListener("click", () => {
      closeDiarySummarySheet();
      btnPerspective.focus();
    });
    backdrop?.addEventListener("click", () => {
      closeDiarySummarySheet();
      btnPerspective.focus();
    });
  })();

  showScreen("home");
})();
