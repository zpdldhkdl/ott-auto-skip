import puppeteer from 'puppeteer';
import express from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const locales = {
  en: { 
    extName: "OTT Auto Skip", 
    extDescription: "Automatically clicks OTT intro, recap, and next-episode buttons.", 
    toggleMaster: "Enable Auto Skip", 
    toggleNetflix: "Enable Netflix Auto Skip",
    toggleIntro: "Skip Intro", 
    toggleRecap: "Skip Recap", 
    toggleNextEpisode: "Auto Click Next Episode", 
    statusEnabled: "Auto skip is enabled.", 
    statusDisabled: "Auto skip is disabled.", 
    statusError: "Failed to load settings", 
    openOptions: "Options", 
    contactUs: "Contact Us" 
  },
  ko: { 
    extName: "OTT Auto Skip", 
    extDescription: "OTT의 오프닝, 줄거리, 다음 화 버튼을 자동으로 클릭합니다.", 
    toggleMaster: "자동 스킵 전체 사용", 
    toggleNetflix: "Netflix 자동 스킵 켜기",
    toggleIntro: "오프닝 스킵", 
    toggleRecap: "줄거리 스킵", 
    toggleNextEpisode: "다음 화 자동 클릭", 
    statusEnabled: "자동 스킵이 켜져 있습니다.", 
    statusDisabled: "자동 스킵이 꺼져 있습니다.", 
    statusError: "설정 로드에 실패했습니다", 
    openOptions: "설정", 
    contactUs: "문의하기" 
  },
  ja: { 
    extName: "OTT Auto Skip", 
    extDescription: "OTTのイントロ・あらすじ・次のエピソードボタンを自動でクリックします。", 
    toggleMaster: "自動スキップを有効化", 
    toggleNetflix: "Netflixの自動スキップを有効化",
    toggleIntro: "イントロをスキップ", 
    toggleRecap: "あらすじをスキップ", 
    toggleNextEpisode: "次のエピソードを自動クリック", 
    statusEnabled: "自動スキップは有効です。", 
    statusDisabled: "自動スキップは無効です。", 
    statusError: "設定の読み込みに失敗しました", 
    openOptions: "設定", 
    contactUs: "お問い合わせ" 
  },
  zh_CN: { 
    extName: "OTT Auto Skip", 
    extDescription: "自动点击 OTT 的片头、剧情回顾和下一集按钮。", 
    toggleMaster: "启用自动跳过", 
    toggleNetflix: "启用 Netflix 自动跳过",
    toggleIntro: "跳过片头", 
    toggleRecap: "跳过剧情回顾", 
    toggleNextEpisode: "自动点击下一集", 
    statusEnabled: "自动跳过已开启。", 
    statusDisabled: "自动跳过已关闭。", 
    statusError: "加载设置失败", 
    openOptions: "选项", 
    contactUs: "联系我们" 
  }
};

const app = express();
app.use(express.static(resolve(rootDir, 'dist')));

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log('Listening for screenshots on port', port);
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const langs = ['en', 'ko', 'ja', 'zh_CN'];
    
    if (!fs.existsSync(resolve(rootDir, 'images'))) {
      fs.mkdirSync(resolve(rootDir, 'images'), { recursive: true });
    }

    for (const lang of langs) {
      // Intercept page to inject mock chrome APIs
      await page.goto(`http://localhost:${port}/src/options/index.html`);
      
      await page.evaluateOnNewDocument((lang, dict) => {
        window.chrome = window.chrome || {};
        window.chrome.i18n = { getMessage: (k) => dict[k] || k };
        window.chrome.storage = { 
          sync: { 
            get: (d, cb) => setTimeout(() => cb(d), 0), 
            set: (s, cb) => setTimeout(() => cb(), 0) 
          } 
        };
        window.chrome.runtime = { lastError: null };
      }, lang, locales[lang]);

      await page.goto(`http://localhost:${port}/src/options/index.html`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 800)); // wait for animations and fonts
      
      await page.screenshot({ 
        path: resolve(rootDir, `images/options_${lang}.jpg`), 
        type: 'jpeg', 
        quality: 100, 
        clip: { x: 0, y: 0, width: 1280, height: 800 } 
      });
      console.log(`Saved screenshot: images/options_${lang}.jpg (1280x800)`);
    }

    await browser.close();
    server.close();
    process.exit(0);
  } catch(e) {
    console.error('Screenshot generation failed:', e);
    process.exit(1);
  }
});
