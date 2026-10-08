import { qrcode } from './vendor/qrcode.mjs';

const appURL = new URL('./app/', import.meta.url);
const appLink = document.getElementById('app-link');
const shareInput = document.getElementById('share-url');
const status = document.getElementById('share-status');
appLink.href = appURL.href;
shareInput.value = appURL.href;
const qr = qrcode(0, 'M');
qr.addData(appURL.href);
qr.make();
document.getElementById('app-qr-image').src = qr.createDataURL(4, 16);
document.getElementById('app-qr').hidden = false;

document.getElementById('copy-link').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(appURL.href);
    status.textContent = ['localhost', '127.0.0.1', '[::1]'].includes(appURL.hostname)
      ? 'コピーしました。このローカルURLは他の端末からは開けません。公開サイトのリンクを送ってください。'
      : 'コピーしました。Safariで開いてもらってください。';
  } catch {
    shareInput.focus();
    shareInput.select();
    status.textContent = 'URLを選択しました。長押し、またはCtrl+C / ⌘Cでコピーしてください。';
  }
});
