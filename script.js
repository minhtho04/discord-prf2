const copyButton = document.querySelector("#copy-discord");
const toast = document.querySelector("#toast");

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("YOUR_DISCORD");
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  } catch {
    copyButton.textContent = "Discord: YOUR_DISCORD";
  }
});
