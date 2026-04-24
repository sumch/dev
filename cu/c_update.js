(function () {
    'use strict';

    // =============================================================
    // 定数
    // =============================================================
    const GEOCODE_BASE_URL = 'https://cityniigata.com/geo/tr.php/geocode?opts=all&';
    const HOKENSHI_APP_ID  = 2417;
    const GEO_CONCURRENCY  = 1;   // 並列ジオコーディング数

    // フィールドコード（現アプリ）
    const F = {
        pref:       'ap11',
        city:       'ap12',
        town:       'ap13',
        banchi:     'ap14',
        addrInput:  '位置用住所',
        addrNormal: '正規化住所',
        lat:        'lat',
        lng:        'lng',
        level:      'level',
        postcode:   'postcode',
        busho:      '部署',
        chiku:      '地区',
        hokenshi:   '保健師',
        ku:         '区',
        machiNm:    '町名',
    };

    // 保健師アプリのフィールドコード
    const HF = {
        fullname: 'fullname',
        busho:    '部署',
        chiku:    '地区',
        hokenshi: '保健師',
        ku:       '区',
        machi:    '町名',
    };

    // =============================================================
    // ユーティリティ
    // =============================================================

    function replaceSpecialKanji(str) {
        if (!str) return '';
        return str.replace(/\u9C73/g, '\u9C38').trim(); // 魲→鱸
    }

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
    // ジオコーディング
    // =============================================================

    async function geocodeAddress(address) {
        if (!address) return null;
        try {
            const res  = await fetch(`${GEOCODE_BASE_URL}addr=${encodeURIComponent(address)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data[0] && data[0].node && data[0].node.y) {
                return {
                    latitude:  data[0].node.y,
                    longitude: data[0].node.x,
                    fullname:  data[0].node.fullname,
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
    // 現アプリ：部署が空欄のレコード全件取得
    // =============================================================

    async function fetchTargetRecords() {
        const limit  = 500;
        let offset   = 0;
        let allRecs  = [];
        const fields = ['$id', F.pref, F.city, F.town, F.banchi];
        while (true) {
            const res = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
                app:    kintone.app.getId(),
                query:  `${F.busho} = "" limit ${limit} offset ${offset}`,
                fields,
            });
            allRecs = allRecs.concat(res.records);
            if (res.records.length < limit) break;
            offset += limit;
        }
        return allRecs;
    }

    // =============================================================
    // 保健師リスト全件取得（部署 != "#N/A" のみ）
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
    // 住所照合：正規化住所の先頭 N 要素が fullname の N 要素と一致
    // =============================================================

    function matchAddress(normalAddr, fullname) {
        if (!normalAddr || !fullname) return false;
        const fnParts   = fullname.trim().split(/\s+/);
        const addrParts = normalAddr.trim().split(/\s+/);
        const n = fnParts.length;
        if (addrParts.length < n) return false;
        for (let i = 0; i < n; i++) {
            if (fnParts[i] !== addrParts[i]) return false;
        }
        return true;
    }

    // =============================================================
    // 一覧画面：[C更新] ボタン
    // =============================================================

    kintone.events.on('app.record.index.show', (event) => {
        if (document.getElementById('cUpdateBtn')) return event;

        const btn = document.createElement('button');
        btn.id          = 'cUpdateBtn';
        btn.textContent = 'C更新';
        btn.style.cssText =
            'margin:4px 8px;padding:8px 20px;background:#28a745;color:white;' +
            'border:none;border-radius:4px;font-size:14px;cursor:pointer;';

        const progress = document.createElement('span');
        progress.id          = 'cUpdateProgress';
        progress.style.cssText = 'margin-left:12px;font-size:13px;color:#555;vertical-align:middle;';

        btn.addEventListener('click', async () => {
            btn.disabled         = true;
            progress.textContent = '対象レコード取得中…';

            try {
                // Step 1: 対象レコード取得（部署が空欄）
                const targets = await fetchTargetRecords();
                if (targets.length === 0) {
                    progress.textContent = '';
                    alert('対象レコードなし');
                    btn.disabled = false;
                    return;
                }

                // Step 2: 保健師リスト取得
                progress.textContent = '保健師リスト取得中…';
                const hokenshiRecs = await fetchAllHokenshiRecords();

                // Step 3: ジオコーディング（GEO_CONCURRENCY 件ずつ並列）
                progress.textContent = `ジオコーディング中… 0 / ${targets.length}`;
                const geoResults = new Array(targets.length);

                for (let i = 0; i < targets.length; i += GEO_CONCURRENCY) {
                    const chunk = targets.slice(i, i + GEO_CONCURRENCY);
                    const chunkGeo = await Promise.all(chunk.map(rec => {
                        const v = code => (rec[code] ? rec[code].value : '') || '';
                        const rawAddr = replaceSpecialKanji(
                            [v(F.pref), v(F.city), v(F.town), v(F.banchi)]
                                .join('').replace(/[\s　]/g, '')
                        );
                        return geocodeAddress(rawAddr).then(geo => ({ geo, rawAddr }));
                    }));
                    chunkGeo.forEach((g, j) => { geoResults[i + j] = g; });
                    progress.textContent =
                        `ジオコーディング中… ${Math.min(i + GEO_CONCURRENCY, targets.length)} / ${targets.length}`;
                }

                // Step 4: 照合 & 更新データ組み立て
                progress.textContent = '照合・書き込み準備中…';
                const updates = [];

                for (let i = 0; i < targets.length; i++) {
                    const rec               = targets[i];
                    const recId             = rec['$id'].value;
                    const { geo, rawAddr }  = geoResults[i];
                    const record            = {};

                    record[F.addrInput] = { value: rawAddr };

                    if (geo) {
                        const normalAddr = joinFullname(geo.fullname);
                        record[F.addrNormal] = { value: normalAddr };
                        record[F.lat]        = { value: String(geo.latitude) };
                        record[F.lng]        = { value: String(geo.longitude) };
                        record[F.level]      = { value: String(geo.level) };
                        record[F.postcode]   = { value: geo.postcode || '' };

                        // 保健師照合
                        for (const hr of hokenshiRecs) {
                            const fn = (hr[HF.fullname] ? hr[HF.fullname].value : '') || '';
                            if (matchAddress(normalAddr, fn)) {
                                record[F.busho]    = { value: (hr[HF.busho]    ? hr[HF.busho].value    : '') || '' };
                                record[F.chiku]    = { value: (hr[HF.chiku]    ? hr[HF.chiku].value    : '') || '' };
                                record[F.hokenshi] = { value: (hr[HF.hokenshi] ? hr[HF.hokenshi].value : '') || '' };
                                record[F.ku]       = { value: (hr[HF.ku]       ? hr[HF.ku].value       : '') || '' };
                                record[F.machiNm]  = { value: (hr[HF.machi]    ? hr[HF.machi].value    : '') || '' };
                                break;
                            }
                        }
                    }

                    updates.push({ id: recId, record });
                }

                // Step 5: 一括書き込み（100件ずつ）
                progress.textContent = 'kintoneに書き込み中…';
                for (let i = 0; i < updates.length; i += 100) {
                    await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', {
                        app:     kintone.app.getId(),
                        records: updates.slice(i, i + 100).map(u => ({ id: u.id, record: u.record })),
                    });
                }

                progress.textContent = '';
                alert(`完了 ${updates.length} 件`);

            } catch (e) {
                alert('エラー: ' + e.message);
                console.error(e);
                progress.textContent = 'エラー発生';
            } finally {
                btn.disabled = false;
            }
        });

        const header = kintone.app.getHeaderMenuSpaceElement();
        if (header) {
            header.appendChild(btn);
            header.appendChild(progress);
        }

        return event;
    });

})();
