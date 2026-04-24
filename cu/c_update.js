(function () {
    'use strict';

    // =============================================================
    // 定数
    // =============================================================
    const GEOCODE_BASE_URL = 'https://cityniigata.com/geo/tr.php/geocode?opts=all&';
    const HOKENSHI_APP_ID  = 2417;   // 保健師リスト app

    // フィールドコード（現アプリ）
    const F = {
        // 住所パーツ
        pref:     'ap11',   // 県
        city:     'ap12',   // 市町村区
        town:     'ap13',   // 町名
        banchi:   'ap14',   // 番地

        // ジオコーディング結果
        addrInput:  '位置用住所',
        addrNormal: '正規化住所',
        lat:        'lat',
        lng:        'lng',
        level:      'level',
        postcode:   'postcode',

        // 保健師情報（書き込み先）
        busho:    '部署',   // 部署
        chiku:    '地区',   // 地区
        hokenshi: '保健師', // 保健師
        ku:       '区',     // 区
        machiNm:  '町名',   // 町名（保健師リスト由来）
    };

    // 保健師アプリのフィールドコード
    const HF = {
        fullname: 'fullname', // 住所照合用フルネーム
        busho:    '部署',
        chiku:    '地区',
        hokenshi: '保健師',
        ku:       '区',
        machi:    '町名',
    };

    // =============================================================
    // ユーティリティ
    // =============================================================

    /** 魲→鱸 変換＋前後空白除去 */
    function replaceSpecialKanji(str) {
        if (!str) return '';
        // 魲(U+9C73)→鱸(U+9C38)
        return str.replace(/\u9C73/g, '\u9C38').trim();
    }

    /** geo.js と同じ joinFullname */
    function joinFullname(fullname) {
        if (!Array.isArray(fullname)) return fullname || '';
        let ss = '', dc = '';
        for (let j = 0; j < fullname.length; j++) {
            ss = ss + dc + fullname[j];
            dc = ' ';
        }
        return ss;
    }

    // =============================================================
    // ジオコーディング（geo.js の geocodeAddress と同実装）
    // =============================================================

    async function geocodeAddress(address) {
        if (!address) return null;
        try {
            const url = `${GEOCODE_BASE_URL}addr=${encodeURIComponent(address)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data[0] && data[0].node && data[0].node.y) {
                return {
                    latitude:  data[0].node.y,
                    longitude: data[0].node.x,
                    fullname:  data[0].node.fullname,   // 配列
                    level:     data[0].node.level,
                    postcode:  data[0].node.postcode,
                };
            }
            return null;
        } catch (e) {
            console.error('geocodeAddress error:', e);
            return null;
        }
    }

    // =============================================================
    // 保健師レコード全件取得
    // =============================================================

    async function fetchAllHokenshiRecords() {
        const limit = 500;
        let offset  = 0;
        let allRecs = [];
        while (true) {
            const res = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
                app:    HOKENSHI_APP_ID,
                query:  `${HF.busho} != "#N/A" limit ${limit} offset ${offset}`,
                fields: [HF.fullname, HF.busho, HF.chiku, HF.hokenshi, HF.ku, HF.machi],
            });
            allRecs = allRecs.concat(res.records);
            if (res.records.length < limit) break;
            offset += limit;
        }
        return allRecs;
    }

    // =============================================================
    // 住所照合
    // 正規化住所（スペース区切り配列）の先頭 N 要素が
    // fullname のスペース区切り N 要素と一致するか判定
    // =============================================================

    function matchAddress(normalAddr, fullname) {
        if (!normalAddr || !fullname) return false;

        const fnParts   = fullname.trim().split(/\s+/);  // fullname を空白で分割
        const addrParts = normalAddr.trim().split(/\s+/); // 正規化住所を空白で分割

        const n = fnParts.length;
        if (addrParts.length < n) return false;

        for (let i = 0; i < n; i++) {
            if (fnParts[i] !== addrParts[i]) return false;
        }
        return true;
    }

    // =============================================================
    // 詳細画面：[C更新] ボタン
    // =============================================================

    kintone.events.on('app.record.detail.show', (event) => {
        if (document.getElementById('cUpdateBtn')) return event;

        // --- ボタン生成 ---
        const btn = document.createElement('button');
        btn.id          = 'cUpdateBtn';
        btn.textContent = 'C更新';
        btn.style.cssText =
            'margin:4px 8px;padding:8px 20px;background:#28a745;color:white;' +
            'border:none;border-radius:4px;font-size:14px;cursor:pointer;';

        const progress = document.createElement('span');
        progress.id          = 'cUpdateProgress';
        progress.style.cssText = 'margin-left:12px;font-size:13px;color:#555;vertical-align:middle;';

        // --- クリックハンドラ ---
        btn.addEventListener('click', async () => {
            btn.disabled       = true;
            progress.textContent = '処理中…';

            try {
                const record = event.record;
                const val    = code => (record[code] ? record[code].value : '') || '';

                // ── Step 1: 位置用住所を組み立て ──────────────────────────
                const rawAddr = [val(F.pref), val(F.city), val(F.town), val(F.banchi)]
                    .join('')
                    .replace(/[\s　]/g, ''); // 空白除去

                // 魲→鱸 変換
                const addrForGeo = replaceSpecialKanji(rawAddr);

                if (!addrForGeo) {
                    alert('住所が入力されていません（ap11〜ap14）。');
                    btn.disabled       = false;
                    progress.textContent = '';
                    return;
                }

                // ── Step 2: ジオコーディング ──────────────────────────────
                progress.textContent = 'ジオコーディング中…';
                const geo = await geocodeAddress(addrForGeo);

                if (!geo) {
                    alert('ジオコーディングに失敗しました。\n住所を確認してください。\n住所: ' + addrForGeo);
                    btn.disabled       = false;
                    progress.textContent = '';
                    return;
                }

                const normalAddr = joinFullname(geo.fullname); // スペース区切り文字列

                // ── Step 3: 現レコードに地理情報を書き込み ────────────────
                progress.textContent = '保健師リスト照合中…';

                // ── Step 4: 保健師リスト取得 ──────────────────────────────
                const hokenshiRecs = await fetchAllHokenshiRecords();

                // ── Step 5: 照合 ──────────────────────────────────────────
                let matched = null;
                for (const rec of hokenshiRecs) {
                    const fn = (rec[HF.fullname] ? rec[HF.fullname].value : '') || '';
                    if (matchAddress(normalAddr, fn)) {
                        matched = rec;
                        break;
                    }
                }

                // ── Step 6: kintone 更新 ──────────────────────────────────
                progress.textContent = 'kintoneに保存中…';

                const recId   = record['$id'].value;
                const updates = {};

                // 位置用住所・ジオコーディング結果
                updates[F.addrInput]  = { value: addrForGeo };
                updates[F.addrNormal] = { value: normalAddr };
                updates[F.lat]        = { value: String(geo.latitude) };
                updates[F.lng]        = { value: String(geo.longitude) };
                updates[F.level]      = { value: String(geo.level) };
                updates[F.postcode]   = { value: geo.postcode || '' };

                // 保健師情報（一致した場合のみ）
                if (matched) {
                    updates[F.busho]    = { value: (matched[HF.busho]    ? matched[HF.busho].value    : '') || '' };
                    updates[F.chiku]    = { value: (matched[HF.chiku]    ? matched[HF.chiku].value    : '') || '' };
                    updates[F.hokenshi] = { value: (matched[HF.hokenshi] ? matched[HF.hokenshi].value : '') || '' };
                    updates[F.ku]       = { value: (matched[HF.ku]       ? matched[HF.ku].value       : '') || '' };
                    updates[F.machiNm]  = { value: (matched[HF.machi]    ? matched[HF.machi].value    : '') || '' };
                }

                await kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
                    app:    kintone.app.getId(),
                    id:     recId,
                    record: updates,
                });

                progress.textContent = '';

                if (matched) {
                    alert(
                        'C更新が完了しました。\n\n' +
                        `正規化住所: ${normalAddr}\n` +
                        `保健師: ${updates[F.hokenshi].value}\n` +
                        `地区: ${updates[F.chiku].value}\n` +
                        `区: ${updates[F.ku].value}`
                    );
                } else {
                    alert(
                        'C更新が完了しました。\n\n' +
                        `正規化住所: ${normalAddr}\n\n` +
                        '⚠ 保健師リストに一致する住所が見つかりませんでした。\n' +
                        '保健師・地区・区は更新されていません。'
                    );
                }

                // 画面リロードして最新値を表示
                location.reload();

            } catch (e) {
                alert('エラーが発生しました:\n' + e.message);
                console.error(e);
                progress.textContent = 'エラー発生';
            } finally {
                btn.disabled = false;
            }
        });

        // ヘッダーに追加
        const header = kintone.app.record.getHeaderMenuSpaceElement
            ? kintone.app.record.getHeaderMenuSpaceElement()
            : kintone.app.getHeaderMenuSpaceElement();
        if (header) {
            header.appendChild(btn);
            header.appendChild(progress);
        }

        return event;
    });

})();
