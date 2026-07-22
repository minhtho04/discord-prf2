const discordId = "699955801887866911";
const introScreen = document.querySelector("#intro-screen");
const copyButton = document.querySelector("#copy-discord");
const toast = document.querySelector("#toast");
const cursorGlow = document.querySelector("#cursor-glow");
const ambientParticles = document.querySelector("#ambient-particles");
const visitorCount = document.querySelector("#visitor-count");
const discordElements = {
  avatar: document.querySelector("#discord-avatar"),
  name: document.querySelector("#discord-name"),
  handle: document.querySelector("#discord-handle"),
  status: document.querySelector("#discord-status"),
  activityIcon: document.querySelector("#discord-activity-icon"),
  activityName: document.querySelector("#discord-activity-name"),
  activityDetail: document.querySelector("#discord-activity-detail"),
  activityTime: document.querySelector("#discord-activity-time"),
};
const heroElements = {
  avatar: document.querySelector("#hero-avatar"),
  name: document.querySelector("#hero-name"),
  handle: document.querySelector("#hero-handle"),
  status: document.querySelector("#hero-status"),
};
const characterElements = {
  avatar: document.querySelector("#minji-character-avatar"),
  name: document.querySelector("#minji-character-name"),
  handle: document.querySelector("#minji-character-handle"),
  status: document.querySelector("#character-status"),
};
const modalElements = {
  modal: document.querySelector("#character-modal"),
  open: document.querySelector("#character-open"),
  closes: document.querySelectorAll("[data-modal-close]"),
  avatar: document.querySelector("#minji-modal-avatar"),
  name: document.querySelector("#minji-modal-name"),
  handle: document.querySelector("#minji-modal-handle"),
};
const playerElements = {
  launch: document.querySelector("#spotify-launch"),
  embed: document.querySelector("#spotify-embed"),
  player: document.querySelector("#spotify-player"),
  art: document.querySelector("#now-playing-art"),
  title: document.querySelector("#now-playing-title"),
  detail: document.querySelector("#now-playing-detail"),
};
const spotifyController = { instance: null, entity: "spotify:playlist:5muSk2zfQ3LI70S64jbrX7", shouldPlay: false };

function setStatus(status) {
  const labels = { online: "Online", idle: "Idle", dnd: "Do not disturb", offline: "Offline" };
  [discordElements.status, heroElements.status, characterElements.status].forEach((element) => {
    const positionClass = element === characterElements.status ? "character-presence " : "";
    element.className = `${positionClass}presence-dot status--${status}`;
    element.title = labels[status] ?? "Offline";
  });
}

function loadSpotifyEntity(entity) {
  spotifyController.entity = entity;
  spotifyController.instance?.loadUri(entity);
}

function renderNowPlaying(spotify) {
  if (spotify) {
    playerElements.art.textContent = "";
    playerElements.art.style.backgroundImage = `url("${spotify.album_art_url}")`;
    playerElements.title.textContent = spotify.song;
    playerElements.detail.textContent = `${spotify.artist} · Click to play`;
    playerElements.launch.setAttribute("aria-label", `Mở ${spotify.song} trên Spotify`);
    loadSpotifyEntity(`spotify:track:${spotify.track_id}`);
    return;
  }
  playerElements.art.textContent = "♫";
  playerElements.art.style.backgroundImage = "";
  playerElements.title.textContent = "Spotify is quiet";
  playerElements.detail.textContent = "Click to play my playlist";
  playerElements.launch.setAttribute("aria-label", "Mở Spotify playlist");
  loadSpotifyEntity("spotify:playlist:5muSk2zfQ3LI70S64jbrX7");
}

function renderActivity(presence) {
  const spotify = presence.spotify;
  const activity = presence.activities.find(({ type }) => type === 0 || type === 4);
  renderNowPlaying(spotify);
  if (spotify) {
    discordElements.activityIcon.textContent = "♫";
    discordElements.activityName.textContent = spotify.song;
    discordElements.activityDetail.textContent = `Spotify · ${spotify.artist}`;
    discordElements.activityTime.textContent = "Listening";
  } else if (activity) {
    discordElements.activityIcon.textContent = activity.type === 4 ? "☁" : "✦";
    discordElements.activityName.textContent = activity.type === 4 ? "Custom Status" : activity.name;
    discordElements.activityDetail.textContent = activity.state || activity.details || "Active on Discord";
    discordElements.activityTime.textContent = "Live";
  } else {
    discordElements.activityIcon.textContent = "✦";
    discordElements.activityName.textContent = "No active status";
    discordElements.activityDetail.textContent = "Say hello on Discord";
    discordElements.activityTime.textContent = "Live";
  }
}

async function refreshDiscordPresence() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    if (!response.ok) throw new Error("Presence unavailable");
    const { data: presence } = await response.json();
    const user = presence.discord_user;
    const avatarExtension = user.avatar?.startsWith("a_") ? "gif" : "png";
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExtension}?size=256`
      : "https://cdn.discordapp.com/embed/avatars/0.png";
    const displayName = user.global_name || user.display_name || user.username;
    [discordElements.avatar, heroElements.avatar, characterElements.avatar, modalElements.avatar].forEach((avatar) => { avatar.src = avatarUrl; });
    [discordElements.name, heroElements.name, characterElements.name, modalElements.name].forEach((name) => { name.textContent = displayName; });
    [discordElements.handle, heroElements.handle, characterElements.handle, modalElements.handle].forEach((handle) => { handle.textContent = `@${user.username}`; });
    setStatus(presence.discord_status);
    renderActivity(presence);
  } catch {
    setStatus("offline");
    discordElements.activityDetail.textContent = "Discord presence is unavailable right now";
    discordElements.activityTime.textContent = "Offline";
    renderNowPlaying(null);
  }
}

async function recordVisitor() {
  if (window.location.hostname === "localhost") return;
  try {
    const response = await fetch("https://visitor.6developer.com/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "minhtho04.github.io",
        page_path: window.location.pathname,
        page_title: document.title,
      }),
    });
    if (!response.ok) throw new Error("Visitor counter unavailable");
    const { totalCount } = await response.json();
    visitorCount.textContent = new Intl.NumberFormat("vi-VN").format(totalCount);
  } catch {
    visitorCount.textContent = "—";
  }
}

function openPlayer(shouldPlay = true) {
  playerElements.embed.classList.add("is-open");
  playerElements.launch.setAttribute("aria-expanded", "true");
  spotifyController.shouldPlay = shouldPlay;
  if (shouldPlay) spotifyController.instance?.play();
}

introScreen.addEventListener("click", () => {
  document.body.classList.remove("intro-active");
  introScreen.classList.add("is-hidden");
  openPlayer(true);
});
playerElements.launch.addEventListener("click", () => openPlayer(true));
modalElements.open.addEventListener("click", () => {
  modalElements.modal.classList.add("is-open");
  modalElements.modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
});
modalElements.closes.forEach((closeButton) => closeButton.addEventListener("click", () => {
  modalElements.modal.classList.remove("is-open");
  modalElements.modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalElements.modal.classList.contains("is-open")) {
    modalElements.modal.classList.remove("is-open");
    modalElements.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }
});

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    cursorGlow.classList.add("is-visible");
  });
  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) cursorGlow.classList.remove("is-visible");
  });
}

const revealTargets = document.querySelectorAll(".minji-character, .minji-dashboard, .minji-cast, .minji-moments");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  revealTargets.forEach((target) => {
    target.classList.add("scroll-reveal");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-revealed"));
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const particles = Array.from({ length: 38 }, (_, index) => {
    const particle = document.createElement("i");
    particle.className = index % 3 === 0 ? "star-particle" : "snow-particle";
    particle.style.setProperty("--left", `${Math.random() * 100}%`);
    particle.style.setProperty("--delay", `${Math.random() * -15}s`);
    particle.style.setProperty("--duration", `${9 + Math.random() * 10}s`);
    particle.style.setProperty("--size", `${3 + Math.random() * 6}px`);
    return particle;
  });
  ambientParticles.append(...particles);
}
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("minji.no_support");
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  } catch { copyButton.textContent = "minji.no_support"; }
});

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPI.createController(playerElements.player, { width: "100%", height: 152, uri: spotifyController.entity }, (controller) => {
    spotifyController.instance = controller;
    if (spotifyController.shouldPlay) controller.play();
  });
};

refreshDiscordPresence();
recordVisitor();
window.setInterval(refreshDiscordPresence, 60_000);
