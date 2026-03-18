document.getElementById('checkBtn').addEventListener('click', async function () {
    const btn = document.getElementById('checkBtn');
    const btnText = document.getElementById('btnText');
    const ring = document.getElementById('loadingRing');
    const resultDiv = document.getElementById('result');

    // 解析中は二重押しを防ぐ
    if (btn.classList.contains('analyzing')) return;

    btn.classList.add('analyzing');
    btn.style.pointerEvents = 'none';
    btnText.innerText = '解析中...';
    ring.classList.remove('hidden');

    resultDiv.classList.remove('show-result');
    resultDiv.innerHTML = '';

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: analyzeTech,
    }, function (results) {
        const data = results[0].result;

        setTimeout(function () {
            btn.classList.remove('analyzing');
            btn.style.pointerEvents = 'auto';
            btnText.innerText = '完了!';
            ring.classList.add('hidden');

            const categoryInfo = {
                language: { label: '言語', icon: '' },
                framework: { label: 'フレームワーク', icon: '' },
                library: { label: 'ライブラリ', icon: '' },
                css: { label: 'CSS / スタイル', icon: '' },
                cms: { label: 'CMS / プラットフォーム', icon: '' },
                analytics: { label: '分析 / マーケ', icon: '' },
                database: { label: 'DB / API', icon: '' },
                infra: { label: 'インフラ', icon: '' },
                font: { label: 'フォント', icon: '' },
            };
            // icon''のところにsvgまたは画像を入れる予定

            let totalCount = 0;
            let htmlText = '';

            for (const key in categoryInfo) {
                const list = data[key];
                if (!list || list.length === 0) continue;

                const info = categoryInfo[key];
                htmlText += '<div class="category-block">';
                htmlText += '<div class="category-label">' + info.icon + ' ' + info.label + '</div>';
                htmlText += '<div class="tech-list">';
                for (let i = 0; i < list.length; i++) {
                    htmlText += '<span class="tech-tag ' + key + '-tag">' + list[i] + '</span>';
                    totalCount++;
                }
                htmlText += '</div></div>';
            }

            // 未検出の可能性がある技術
            if (data.notDetected && data.notDetected.length > 0) {
                htmlText += '<div class="not-detected-block">';
                htmlText += '<div class="category-label"> 未検出の可能性</div>';
                htmlText += '<p class="not-detected-text">' + data.notDetected.join('、') + '</p>';
                htmlText += '</div>';
            }

            if (totalCount === 0) {
                htmlText = '<p class="empty-msg">技術スタックを検出できませんでした</p>';
            } else {
                htmlText = '<div class="result-header">🛠 ' + totalCount + ' 件の技術を検出</div>' + htmlText;
            }

            resultDiv.innerHTML = htmlText;
            resultDiv.classList.add('show-result');

            setTimeout(function () {
                btnText.innerText = '解析';
            }, 2000);

        }, 1200);
    });
});


function analyzeTech() {
    const scripts = document.querySelectorAll('script');
    const links = document.querySelectorAll('link');
    const metas = document.querySelectorAll('meta');
    const htmlText = document.documentElement.innerHTML.toLowerCase();
    const allScriptSrc = Array.from(scripts).map(function (s) { return (s.src || '').toLowerCase(); }).join(' ');
    const allInlineScript = Array.from(scripts).map(function (s) { return (s.innerHTML || '').toLowerCase(); }).join(' ');

    const result = {
        language: [],
        framework: [],
        library: [],
        css: [],
        cms: [],
        analytics: [],
        database: [],
        infra: [],
        font: [],
        notDetected: []
    };

    function add(category, name) {
        if (!result[category].includes(name)) {
            result[category].push(name);
        }
    }

    // 言語
    add('language', 'JavaScript');
    if (htmlText.includes('application/wasm')) add('language', 'WebAssembly');
    if (allScriptSrc.includes('.ts') || htmlText.includes('text/typescript')) add('language', 'TypeScript');

    // React / Next.js
    if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || htmlText.includes('data-reactroot') || htmlText.includes('_reactfiber')) {
        add('framework', 'React');
    }
    if (document.querySelector('#__next') || htmlText.includes('__next_data__') || htmlText.includes('/_next/')) {
        add('framework', 'Next.js');
        add('framework', 'React');
    }

    // Vue / Nuxt
    if (window.Vue || document.querySelector('[data-v-]') || allInlineScript.includes('createapp')) {
        add('framework', 'Vue.js');
    }
    if (htmlText.includes('__nuxt') || htmlText.includes('/_nuxt/')) {
        add('framework', 'Nuxt.js');
        add('framework', 'Vue.js');
    }

    // Angular
    if (document.querySelector('[ng-version]') || document.querySelector('app-root') || htmlText.includes('ng-version')) {
        add('framework', 'Angular');
    }

    // Svelte / SvelteKit
    if (htmlText.includes('__svelte') || allScriptSrc.includes('svelte')) add('framework', 'Svelte');
    if (htmlText.includes('sveltekit') || htmlText.includes('/_app/')) add('framework', 'SvelteKit');

    // その他フレームワーク
    if (allScriptSrc.includes('alpinejs') || htmlText.includes('x-data=')) add('framework', 'Alpine.js');
    if (htmlText.includes('astro-island') || htmlText.includes('/_astro/')) add('framework', 'Astro');
    if (allScriptSrc.includes('stimulus') || htmlText.includes('data-controller=')) add('framework', 'Stimulus');
    if (window.Ember || allScriptSrc.includes('ember')) add('framework', 'Ember.js');
    if (window.Backbone || allScriptSrc.includes('backbone')) add('framework', 'Backbone.js');
    if (htmlText.includes('__remixcontext')) add('framework', 'Remix');
    if (htmlText.includes('___gatsby')) add('framework', 'Gatsby');

    // CSS フレームワーク
    if (htmlText.includes('tailwind')) add('css', 'Tailwind CSS');
    if (htmlText.includes('bootstrap')) add('css', 'Bootstrap');
    if (htmlText.includes('muidata') || htmlText.includes('muibutton')) add('css', 'Material UI');
    if (htmlText.includes('chakra-ui') || htmlText.includes('chakra')) add('css', 'Chakra UI');
    if (htmlText.includes('ant-design') || htmlText.includes('antd')) add('css', 'Ant Design');
    if (htmlText.includes('shadcn') || htmlText.includes('radix-ui')) add('css', 'shadcn/ui');
    if (allScriptSrc.includes('bulma')) add('css', 'Bulma');

    // ライブラリ（scriptのsrcから検出）
    const scriptSrcList = Array.from(scripts).map(function (s) { return s.src || ''; });
    for (let i = 0; i < scriptSrcList.length; i++) {
        const src = scriptSrcList[i].toLowerCase();
        if (src.includes('jquery')) add('library', 'jQuery');
        if (src.includes('three')) add('library', 'Three.js');
        if (src.includes('gsap') || src.includes('tweenmax')) add('library', 'GSAP');
        if (src.includes('/d3') || src.includes('d3.min')) add('library', 'D3.js');
        if (src.includes('chart')) add('library', 'Chart.js');
        if (src.includes('axios')) add('library', 'Axios');
        if (src.includes('lodash')) add('library', 'Lodash');
        if (src.includes('moment')) add('library', 'Moment.js');
        if (src.includes('swiper')) add('library', 'Swiper');
        if (src.includes('framer')) add('library', 'Framer Motion');
        if (src.includes('lottie')) add('library', 'Lottie');
        if (src.includes('aos')) add('library', 'AOS');
        if (src.includes('p5')) add('library', 'p5.js');
        if (src.includes('pixi')) add('library', 'PixiJS');
        if (src.includes('socket.io')) add('library', 'Socket.io');
    }
    // windowオブジェクトからも検出
    if (window.jQuery || window.$) add('library', 'jQuery');
    if (window.THREE) add('library', 'Three.js');
    if (window.gsap || window.TweenMax) add('library', 'GSAP');

    // CMS
    if (htmlText.includes('wp-content') || htmlText.includes('wp-includes')) add('cms', 'WordPress');
    if (htmlText.includes('shopify')) add('cms', 'Shopify');
    if (htmlText.includes('wix.com') || htmlText.includes('wixsite')) add('cms', 'Wix');
    if (htmlText.includes('webflow')) add('cms', 'Webflow');
    if (htmlText.includes('squarespace')) add('cms', 'Squarespace');
    if (htmlText.includes('contentful')) add('cms', 'Contentful');
    if (htmlText.includes('sanity.io')) add('cms', 'Sanity');
    if (htmlText.includes('ghost')) add('cms', 'Ghost');

    // metaのgeneratorから検出
    for (let m of metas) {
        if (m.name === 'generator') {
            const g = (m.content || '').toLowerCase();
            if (g.includes('wordpress')) add('cms', 'WordPress');
            if (g.includes('drupal')) add('cms', 'Drupal');
            if (g.includes('joomla')) add('cms', 'Joomla');
            if (g.includes('hugo')) add('cms', 'Hugo');
            if (g.includes('jekyll')) add('cms', 'Jekyll');
        }
    }

    // DB / API
    if (htmlText.includes('firebase') || htmlText.includes('firebaseapp.com')) add('database', 'Firebase');
    if (htmlText.includes('supabase')) add('database', 'Supabase');
    if (htmlText.includes('mongodb') || htmlText.includes('mongoose')) add('database', 'MongoDB');
    if (htmlText.includes('/graphql') || htmlText.includes('__typename')) add('database', 'GraphQL');
    if (htmlText.includes('prisma')) add('database', 'Prisma');

    // インフラ
    if (htmlText.includes('vercel') || htmlText.includes('_vercel')) add('infra', 'Vercel');
    if (htmlText.includes('netlify')) add('infra', 'Netlify');
    if (htmlText.includes('cloudflare')) add('infra', 'Cloudflare');
    if (htmlText.includes('amazonaws.com') || htmlText.includes('awsstatic')) add('infra', 'AWS');
    if (htmlText.includes('googleapis.com') || htmlText.includes('gstatic.com')) add('infra', 'Google Cloud');
    if (htmlText.includes('azurestaticapps') || htmlText.includes('azure.com')) add('infra', 'Azure');

    // 分析
    if (window.dataLayer || htmlText.includes('googletagmanager')) add('analytics', 'Google Tag Manager');
    if (window.ga || window.gtag || htmlText.includes('google-analytics')) add('analytics', 'Google Analytics');
    if (window.fbq || htmlText.includes('fbevents')) add('analytics', 'Meta Pixel');
    if (window.hj || htmlText.includes('hotjar')) add('analytics', 'Hotjar');
    if (htmlText.includes('mixpanel')) add('analytics', 'Mixpanel');
    if (window.amplitude || htmlText.includes('amplitude.com')) add('analytics', 'Amplitude');

    // フォント
    for (let l of links) {
        const href = (l.href || '').toLowerCase();
        if (href.includes('fonts.googleapis.com')) add('font', 'Google Fonts');
        if (href.includes('use.typekit.net')) add('font', 'Adobe Fonts');
        if (href.includes('fontawesome')) add('font', 'Font Awesome');
    }
    if (htmlText.includes('font-awesome') || htmlText.includes(' fa-')) add('font', 'Font Awesome');

    // CSSのfont-familyから取得する
    const fontFamily = (window.getComputedStyle(document.body).fontFamily || '').toLowerCase();
    const knownFonts = ['inter', 'roboto', 'noto', 'geist', 'poppins', 'lato', 'montserrat', 'open sans'];
    for (let i = 0; i < knownFonts.length; i++) {
        if (fontFamily.includes(knownFonts[i])) {
            const name = knownFonts[i];
            add('font', name.charAt(0).toUpperCase() + name.slice(1));
        }
    }

    // 未検出の可能性がある技術を推測する
    if (result.framework.length === 0 && htmlText.includes('hydrate')) {
        result.notDetected.push('SSR/SSGフレームワーク（詳細不明）');
    }
    if (result.database.length === 0 && (allInlineScript.includes('fetch(') || allInlineScript.includes('xmlhttprequest'))) {
        result.notDetected.push('バックエンドAPI（詳細不明）');
    }

    return result;
}