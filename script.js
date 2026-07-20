const copyButton = document.querySelector("#copy-discord");
const toast = document.querySelector("#toast");
const discordId = "699955801887866911";
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
const nowPlayingElements = {
  button: document.querySelector("#now-playing"),
  widget: document.querySelector("#spotify-widget"),
  player: document.querySelector("#spotify-player"),
  art: document.querySelector("#now-playing-art"),
  title: document.querySelector("#now-playing-title"),
  detail: document.querySelector("#now-playing-detail"),
};

const spotifyPlaylistEmbed = "https://open.spotify.com/embed/playlist/5muSk2zfQ3LI70S64jbrX7?utm_source=generator";

nowPlayingElements.button.addEventListener("click", () => {
  const isOpen = nowPlayingElements.widget.classList.toggle("is-open");
  nowPlayingElements.button.setAttribute("aria-expanded", String(isOpen));
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("minji.no_support");
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  } catch {
    copyButton.textContent = "Discord: minji.no_support";
  }
});

function setDiscordStatus(status) {
  const labels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do not disturb",
    offline: "Offline",
  };

  discordElements.status.className = `status-dot status--${status}`;
  discordElements.status.title = labels[status] ?? "Offline";
}

function renderDiscordActivity(presence) {
  const spotify = presence.spotify;
  const activity = presence.activities.find(({ type }) => type === 0 || type === 4);

  renderNowPlaying(spotify);

  if (spotify) {
    discordElements.activityIcon.textContent = "♫";
    discordElements.activityName.textContent = spotify.song;
    discordElements.activityDetail.textContent = `Spotify · ${spotify.artist}`;
    discordElements.activityTime.textContent = "Listening";
    return;
  }

  if (activity) {
    discordElements.activityIcon.textContent = activity.type === 4 ? "☁" : "✦";
    discordElements.activityName.textContent = activity.type === 4 ? "Custom Status" : activity.name;
    discordElements.activityDetail.textContent = activity.state || activity.details || "Active on Discord";
    discordElements.activityTime.textContent = "Live";
    return;
  }

  discordElements.activityIcon.textContent = "✦";
  discordElements.activityName.textContent = "No active status";
  discordElements.activityDetail.textContent = "Say hello on Discord";
  discordElements.activityTime.textContent = "Live";
}

function renderNowPlaying(spotify) {
  if (spotify) {
    nowPlayingElements.art.textContent = "";
    nowPlayingElements.art.style.backgroundImage = `url("${spotify.album_art_url}")`;
    nowPlayingElements.title.textContent = spotify.song;
    nowPlayingElements.detail.textContent = `${spotify.artist} · Click to play`;
    nowPlayingElements.button.setAttribute("aria-label", `Mở ${spotify.song} trên Spotify`);
    nowPlayingElements.player.src = `https://open.spotify.com/embed/track/${spotify.track_id}?utm_source=generator`;
    return;
  }

  nowPlayingElements.art.textContent = "♫";
  nowPlayingElements.art.style.backgroundImage = "";
  nowPlayingElements.title.textContent = "Spotify is quiet";
  nowPlayingElements.detail.textContent = "Click to play my playlist";
  nowPlayingElements.button.setAttribute("aria-label", "Mở Spotify playlist");
  nowPlayingElements.player.src = spotifyPlaylistEmbed;
}

async function refreshDiscordPresence() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    if (!response.ok) throw new Error("Presence unavailable");

    const { data: presence } = await response.json();
    const user = presence.discord_user;
    const avatarExtension = user.avatar?.startsWith("a_") ? "gif" : "png";
    const displayName = user.global_name || user.display_name || user.username;

    discordElements.avatar.src = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExtension}?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";
    discordElements.name.textContent = displayName;
    discordElements.handle.textContent = `@${user.username}`;
    setDiscordStatus(presence.discord_status);
    renderDiscordActivity(presence);
  } catch {
    setDiscordStatus("offline");
    discordElements.activityDetail.textContent = "Discord presence is unavailable right now";
    discordElements.activityTime.textContent = "Offline";
    renderNowPlaying(null);
  }
}

refreshDiscordPresence();
window.setInterval(refreshDiscordPresence, 60_000);
