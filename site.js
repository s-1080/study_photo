import { qrcode } from './vendor/qrcode.mjs';

const appLink = document.getElementById('app-link');
const appStatus = document.getElementById('app-status');
const appQR = document.getElementById('app-qr');
const appQRImage = document.getElementById('app-qr-image');
const expoInput = document.getElementById('expo-url');
const shareResult = document.getElementById('share-result');
const shareInput = document.getElementById('share-url');
const shareStatus = document.getElementById('share-status');
const shortcutURL = document.getElementById('shortcut-url');
const shortcutLaunch = document.getElementById('shortcut-launch');
const shortcutNote = document.getElementById('shortcut-url-note');


function parseLaunchURL(value) {
  if (!value || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    if (!['exp:', 'exps:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url.href.length <= 2048 ? url.href : null;
  } catch {
    return null;
  }
}

function showLaunchURL(url) {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  appQRImage.src = qr.createDataURL(4, 16);
  appQR.hidden = false;
  appLink.href = url;
  appLink.hidden = false;
  appStatus.textContent = 'SDK 57対応のExpo Goを入れたiPhoneで、QRを読み取るか、このボタンをタップしてください。配布者の開発サーバーが起動している必要があります。';
  shortcutURL.value = url;
  shortcutLaunch.hidden = false;
  shortcutNote.textContent = '下の起動URLをコピーして、ショートカットの「URL」アクションに貼り付けてください。';
}

const initialValue = new URL(window.location.href).searchParams.get('app')
  ?? document.querySelector('meta[name="expo-launch-url"]')?.content;
if (initialValue) {
  const launchURL = parseLaunchURL(initialValue);
  if (launchURL) {
    showLaunchURL(launchURL);
    expoInput.value = launchURL;
  } else {
    appStatus.textContent = '起動リンクの形式が正しくありません。配布してくれた友達に、exp:// または exps:// のリンクを作り直してもらってください。';
  }
}

expoInput.addEventListener('input', () => {
  expoInput.setCustomValidity('');
  shareResult.hidden = true;
  shareStatus.textContent = '';
});

document.getElementById('share-form').addEventListener('submit', event => {
  event.preventDefault();
  const launchURL = parseLaunchURL(expoInput.value);
  if (!launchURL) {
    expoInput.setCustomValidity('exp:// または exps:// で始まる、正しいExpo起動URLを入力してください。');
    expoInput.reportValidity();
    shareStatus.textContent = '共有リンクを作れませんでした。Expoが表示した起動URLをそのまま貼り付けてください。';
    shareResult.hidden = true;
    return;
  }
  if (!['http:', 'https:'].includes(window.location.protocol)) {
    shareStatus.textContent = '友達に送るには、siteフォルダを静的ホスティングに公開し、そのページでリンクを作ってください。ローカルファイルのURLは共有できません。';
    shareResult.hidden = true;
    return;
  }
  const pageURL = new URL(window.location.href);
  pageURL.searchParams.set('app', launchURL);
  pageURL.hash = 'start';
  shareInput.value = pageURL.href;
  shareResult.hidden = false;
  showLaunchURL(launchURL);
  const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(pageURL.hostname);
  shareStatus.textContent = localHost
    ? 'ローカルでの確認用リンクです。このlocalhostのURLは友達には開けません。公開したサイトで作り直してください。'
    : 'このページのURLを友達に送ってね。Expoのサーバーは起動したままにしてください。LANの起動URLは同じWi-Fiの相手にだけ使えます。';
});

document.getElementById('copy-link').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(shareInput.value);
    const host = new URL(shareInput.value).hostname;
    shareStatus.textContent = ['localhost', '127.0.0.1', '[::1]'].includes(host)
      ? 'コピーしました。ただしlocalhostは確認用です。友達には開けないので、公開したサイトでリンクを作り直してください。'
      : 'コピーしました。友達に送る前に、ページが公開されていることとサーバーの起動を確認してね。';
  } catch {
    shareInput.focus();
    shareInput.select();
    shareStatus.textContent = 'URLを選択しました。長押し、またはCtrl+C / ⌘Cでコピーしてください。';
  }
});
