window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault()
  window.__pwaInstallEvent = event
})
