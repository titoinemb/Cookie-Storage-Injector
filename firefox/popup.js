document.getElementById('injectButton').addEventListener('click', () => {
  const cookiesInput = document.getElementById('cookiesInput').value;
  const data = JSON.parse(cookiesInput);

  chrome.runtime.sendMessage({ action: "inject", data });
});