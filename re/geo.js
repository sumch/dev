(function () {
    'use strict';

    // =============================================================
    // フィールドコード設定
    // =============================================================
    const F = {
        // --- 申請住所（住所1）ap11〜 ---
        addr1_input:  '位置用住所',
        addr1_normal: '正規化住所',
        addr1_lat:    'lat',
        addr1_lng:    'lng',
        addr1_level:  'level',
        addr1_post:   'postcode',

        // --- 工事場所（住所2）ap212〜 ---
        addr2_input:  '位置用住所2',
        addr2_normal: '正規化住所2',
        addr2_lat:    'lat2',
        addr2_lng:    'lng2',
        addr2_level:  'level2',
        addr2_post:   'postcode2',

        // --- 申請住所 パーツ（ap11〜）---
        addr1_p1: 'ap11',
        addr1_p2: 'ap12',
        addr1_p3: 'ap13',
        addr1_p4: 'ap14',

        // --- 工事場所 パーツ（ap212〜）---
        addr2_p1: 'ap212',
        addr2_p2: 'ap222',
        addr2_p3: 'ap232',
        addr2_p4: 'ap242',

        // --- 照合用フィールド ---
        kana:     'ap17f',  // 申請者_ふりがな
        bday:     'bd1',    // 生年月日
        tel:      'ap18',   // 申請者_電話番号

        // --- 申請住所 Google マップリンク ---
        addr1_map:    'map1',   // Googleマップリンク（リンク型）
        addr1_place:  'place1', // ストリートビューリンク（リンク型）

        // --- 工事場所 Google マップリンク ---
        addr2_map:    'map2',   // Googleマップリンク（リンク型）
        addr2_place:  'place2', // ストリートビューリンク（リンク型）

        // --- 重複自動チェック（チェックボックス型）---
        dupCheck:       '重複自動チェック',
        dupCheckResult: '重複自動チェック結果', // 重複詳細テキスト（1行テキスト型）
    };

    // =============================================================
    // Google マップ URL 生成
    // =============================================================

    function buildGoogleMapUrl(address) {
        if (!address) return '';
        return 'https://www.google.co.jp/maps/search/?api=1&query=' + encodeURIComponent(address);
    }

    function buildStreetViewUrl(lat, lng) {
        if (!lat || !lng) return '';
        return `https://www.google.com/maps/@?api=1&map_action=pano&parameters&viewpoint=${lat},${lng}`;
    }

    // =============================================================
    // チェックボックス選択肢名（kintoneアプリの設定と一致させること）
    // =============================================================
    const CB = {
        ok:       'OK',       // 重複なし・処理完了
        addr1:    '申請住所', // 申請住所で重複
        addr2:    '工事場所', // 工事場所で重複
        tel:      '電話番号', // 電話番号で重複
        kana:     'フリガナ', // フリガナ+生年月日で重複
    };

    // =============================================================
    // 定数
    // =============================================================
    const GEOCODE_BASE_URL = 'https://cityniigata.com/geo/tr.php/geocode?opts=all&';
    const CSV_URLS = {
        '2024R': 'https://cityniigata.com/r/rb/csv_proxy.php?f=2024R',
        '2025R': 'https://cityniigata.com/r/rb/csv_proxy.php?f=2025R',
    };
    const GEO_CONCURRENCY = 5;
    const APP_ID = kintone.app.getId();

    // =============================================================
    // ユーティリティ
    // =============================================================

    function normalizeKana(str) {
        if (!str) return '';
        return str
            .replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60))
            .replace(/[\s　]/g, '');
    }

    function getFamilyKana(str) {
        if (!str) return '';
        const parts = str.trim().split(/[\s　]+/);
        return normalizeKana(parts[0]);
    }

    function normalizeTel(str) {
        return String(str || '').replace(/\D/g, '');
    }

    function normalizeBday(str) {
        if (!str) return '';
        let s = str.split(' ')[0];
        s = s.replace(/\//g, '-');
        const parts = s.split('-');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        if (s.length === 8 && !isNaN(s)) {
            return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6)}`;
        }
        return s;
    }

    // =============================================================
    // ジオコーディング
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
    // CSV 取得・パース
    // =============================================================

    async function fetchCSV(url) {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        return new TextDecoder('shift-jis').decode(buf);
    }

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (!lines.length) return [];
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        return lines.slice(1).map(line => {
            const vals = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/"/g, ''));
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
            return obj;
        });
    }

    // =============================================================
    // kintone REST API 全件取得（500件ずつoffset、2000件超対応）
    // =============================================================

    async function fetchAllKintoneRecords(query, fields) {
        const limit = 500;
        let offset  = 0;
        let allRecs = [];
        while (true) {
            const res = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
                app: APP_ID,
                query: `${query} limit ${limit} offset ${offset}`,
                fields,
            });
            allRecs = allRecs.concat(res.records);
            if (res.records.length < limit) break;
            offset += limit;
        }
        return allRecs;
    }

    // =============================================================
    // 重複チェック共通ロジック
    // 戻り値: { kana, tel, addr1, addr2 } の一致フラグオブジェクト
    // （家族重複はaddr1/addr2フラグで表現）
    // =============================================================

    function detectDup(target, rowKana, rowFamily, rowBday, rowTel, rowAddr1, rowAddr2) {
        const mKana   = target.kana   && rowKana   === target.kana;
        const mFamily = target.family && rowFamily  === target.family;
        const mBday   = target.bday   && rowBday   === target.bday;
        const mTel    = target.tel    && rowTel    === target.tel;
        const mAddr1  = target.addr1  && (rowAddr1 === target.addr1 || rowAddr2 === target.addr1);
        const mAddr2  = target.addr2  && (rowAddr1 === target.addr2 || rowAddr2 === target.addr2);

        const hit = {
            kana:  (mKana && mBday),                   // フリガナ+生年月日
            tel:   mTel,                               // 電話番号
            addr1: (mAddr1 || (mFamily && mAddr1)),    // 申請住所（本人 or 家族）
            addr2: (mAddr2 || (mFamily && mAddr2)),    // 工事場所（本人 or 家族）
        };

        const matched = hit.kana || hit.tel || hit.addr1 || hit.addr2;
        return matched ? hit : null;
    }

    // =============================================================
    // 重複チェック（過去 CSV）
    // CSVの正規化済み住所をそのまま使用
    // =============================================================

    function checkDupInCSV(target, rows, yearLabel) {
        for (const row of rows) {
            if (row.status !== '申請' && row.status !== '実績') continue;

            const hit = detectDup(
                target,
                normalizeKana(row['申請者_ふりがな'] || ''),
                getFamilyKana(row['申請者_ふりがな'] || ''),
                normalizeBday(row['生年月日'] || ''),
                normalizeTel(row['申請者_電話番号'] || ''),
                (row['正規化住所']  || '').trim(),
                (row['正規化住所2'] || '').trim()
            );

            if (hit) return { label: `${yearLabel} 受付:${row['受付番号']}`, hit };
        }
        return null;
    }

    // =============================================================
    // 重複チェック（2026R 現データ）
    // ループ前に一括取得済みのレコード配列をメモリ内で比較
    // =============================================================

    function checkDupIn2026R(target, currentRecordId, checkedRecs) {
        for (const rec of checkedRecs) {
            const val = v => (rec[v] ? rec[v].value : '') || '';
            if (String(rec['$id'].value) === String(currentRecordId)) continue;

            const hit = detectDup(
                target,
                normalizeKana(val(F.kana)),
                getFamilyKana(val(F.kana)),
                normalizeBday(val(F.bday)),
                normalizeTel(val(F.tel)),
                val(F.addr1_normal).trim(),
                val(F.addr2_normal).trim()
            );

            if (hit) return { label: `2026R レコードID:${rec['$id'].value}`, hit };
        }
        return null;
    }

    // =============================================================
    // 重複結果 → チェックボックスの値（配列）に変換
    // =============================================================

    function dupResultToCheckboxValues(dupResults) {
        const flags = { kana: false, tel: false, addr1: false, addr2: false };
        for (const r of dupResults) {
            if (r.hit.kana)  flags.kana  = true;
            if (r.hit.tel)   flags.tel   = true;
            if (r.hit.addr1) flags.addr1 = true;
            if (r.hit.addr2) flags.addr2 = true;
        }
        const values = [];
        if (flags.kana)  values.push(CB.kana);
        if (flags.tel)   values.push(CB.tel);
        if (flags.addr1) values.push(CB.addr1);
        if (flags.addr2) values.push(CB.addr2);
        return values;
    }

    // =============================================================
    // 一覧画面：[重複チェック] ボタン
    // =============================================================

    kintone.events.on('app.record.index.show', (event) => {
        if (document.getElementById('dupCheckBtn')) return event;

        const btn = document.createElement('button');
        btn.id = 'dupCheckBtn';
        btn.textContent = '重複チェック';
        btn.style.cssText = 'margin:4px 8px;padding:8px 20px;background:#007bff;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;';

        const progress = document.createElement('span');
        progress.id = 'dupCheckProgress';
        progress.style.cssText = 'margin-left:12px;font-size:13px;color:#555;vertical-align:middle;';

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            progress.textContent = '準備中…';

            try {
                // Step 1: 処理対象レコード取得（チェックボックスが全部空＝未処理）
                progress.textContent = '対象レコード取得中…';
                const targets = await fetchAllKintoneRecords(
                    // OK も重複系選択肢も何もチェックされていないものが対象
                    `${F.dupCheck} not in ("${CB.ok}","${CB.addr1}","${CB.addr2}","${CB.tel}","${CB.kana}")`,
                    [F.kana, F.bday, F.tel,
                     F.addr1_p1, F.addr1_p2, F.addr1_p3, F.addr1_p4,
                     F.addr2_p1, F.addr2_p2, F.addr2_p3, F.addr2_p4,
                     '$id']
                );

                if (targets.length === 0) {
                    alert('処理対象のレコードがありません。');
                    progress.textContent = '';
                    btn.disabled = false;
                    return;
                }

                // Step 2: 過去CSV・2026R比較レコード（OK済み）を並行取得
                progress.textContent = `データ取得中…（対象 ${targets.length} 件）`;
                const [csv24, csv25, checkedRecs] = await Promise.all([
                    fetchCSV(CSV_URLS['2024R']),
                    fetchCSV(CSV_URLS['2025R']),
                    fetchAllKintoneRecords(
                        `${F.dupCheck} in ("${CB.ok}")`,
                        [F.kana, F.bday, F.tel, F.addr1_normal, F.addr2_normal, '$id']
                    ),
                ]);
                const rows24 = parseCSV(csv24);
                const rows25 = parseCSV(csv25);

// 該当レコード（受付番号70379）を探す
const row = rows25.find(r => r['受付番号'] === '70379');
console.log('生データ:', row);
console.log('ふりがな正規化後:', normalizeKana(row['申請者_ふりがな'] || ''));
console.log('生年月日正規化後:', normalizeBday(row['生年月日'] || ''));
console.log('target.kana:', target.kana);
console.log('target.bday:', target.bday);

                // Step 3: ジオコーディング（GEO_CONCURRENCY 件ずつ並列）
                progress.textContent = `ジオコーディング中… 0 / ${targets.length}`;
                const geoResults = new Array(targets.length);

                for (let i = 0; i < targets.length; i += GEO_CONCURRENCY) {
                    const chunk = targets.slice(i, i + GEO_CONCURRENCY);
                    const chunkGeo = await Promise.all(chunk.map(rec => {
                        const val = v => (rec[v] ? rec[v].value : '') || '';

                        // 位置用住所: ap212 & ap222 & ap232 & ap242 を結合しスペース除去
                        const addr1 = [val(F.addr1_p1), val(F.addr1_p2), val(F.addr1_p3), val(F.addr1_p4)]
                            .join('').replace(/[\s　]/g, '');

                        // 位置用住所2: ap11 & ap12 & ap13 & ap14 を結合しスペース除去
                        const addr2 = [val(F.addr2_p1), val(F.addr2_p2), val(F.addr2_p3), val(F.addr2_p4)]
                            .join('').replace(/[\s　]/g, '');

                        return Promise.all([
                            geocodeAddress(addr1),
                            geocodeAddress(addr2),
                        ]).then(([geo1, geo2]) => ({ geo1, geo2, addr1, addr2 }));
                    }));
                    chunkGeo.forEach((g, j) => { geoResults[i + j] = g; });
                    progress.textContent = `ジオコーディング中… ${Math.min(i + GEO_CONCURRENCY, targets.length)} / ${targets.length}`;
                }

                // Step 4: 重複チェック & 更新データ蓄積（全件処理・重複はまとめて最後に表示）
                progress.textContent = `重複チェック中… 0 / ${targets.length}`;
                let okCount  = 0;
                let dupCount = 0;
                const updates = [];
                const dupMessages = []; // 重複メッセージをまとめる

                for (let i = 0; i < targets.length; i++) {
                    const rec   = targets[i];
                    const val   = v => (rec[v] ? rec[v].value : '') || '';
                    const recId = rec['$id'].value;
                    const { geo1, geo2, addr1: addrInput1, addr2: addrInput2 } = geoResults[i];

                    const addr1Normal = geo1 ? joinFullname(geo1.fullname) : '';
                    const addr2Normal = geo2 ? joinFullname(geo2.fullname) : '';

                    const target = {
                        kana:   normalizeKana(val(F.kana)),
                        family: getFamilyKana(val(F.kana)),
                        bday:   normalizeBday(val(F.bday)),
                        tel:    normalizeTel(val(F.tel)),
                        addr1:  addr1Normal.trim(),
                        addr2:  addr2Normal.trim(),
                    };

                    const dup24   = checkDupInCSV(target, rows24, '2024R');
                    const dup25   = checkDupInCSV(target, rows25, '2025R');
                    const dup2026 = checkDupIn2026R(target, recId, checkedRecs);

                    const dupResults = [dup24, dup25, dup2026].filter(Boolean);

                    progress.textContent = `重複チェック中… ${i + 1} / ${targets.length}`;

                    const record = {};

                    if (dupResults.length > 0) {
                        // 重複あり：チェックボックスに重複項目を書き込み、メッセージを蓄積して処理継続
                        const cbValues = dupResultToCheckboxValues(dupResults);
                        record[F.dupCheck] = { value: cbValues };

                        if (geo1) {
                            record[F.addr1_input]  = { value: addrInput1 };
                            record[F.addr1_normal] = { value: addr1Normal };
                            record[F.addr1_lat]    = { value: String(geo1.latitude) };
                            record[F.addr1_lng]    = { value: String(geo1.longitude) };
                            record[F.addr1_level]  = { value: String(geo1.level) };
                            record[F.addr1_post]   = { value: geo1.postcode };
                            record[F.addr1_map]    = { value: buildGoogleMapUrl(addrInput1) };
                            record[F.addr1_place]  = { value: buildStreetViewUrl(geo1.latitude, geo1.longitude) };
                        }
                        if (geo2) {
                            record[F.addr2_input]  = { value: addrInput2 };
                            record[F.addr2_normal] = { value: addr2Normal };
                            record[F.addr2_lat]    = { value: String(geo2.latitude) };
                            record[F.addr2_lng]    = { value: String(geo2.longitude) };
                            record[F.addr2_level]  = { value: String(geo2.level) };
                            record[F.addr2_post]   = { value: geo2.postcode };
                            record[F.addr2_map]    = { value: buildGoogleMapUrl(addrInput2) };
                            record[F.addr2_place]  = { value: buildStreetViewUrl(geo2.latitude, geo2.longitude) };
                        }
                        // 重複詳細テキストを生成して書き込む
                        // 例: 2024R 受付:1234　電話番号: 09012345678
                        const dupDetailLines = dupResults.map(r => {
                            const parts = [r.label];
                            if (r.hit.kana)  parts.push(`フリガナ: ${val(F.kana)}`);
                            if (r.hit.tel)   parts.push(`電話番号: ${val(F.tel)}`);
                            if (r.hit.addr1) parts.push(`申請住所: ${addr1Normal}`);
                            if (r.hit.addr2) parts.push(`工事場所: ${addr2Normal}`);
                            return parts.join('　');
                        });
                        record[F.dupCheckResult] = { value: dupDetailLines.join(' / ') };

                        updates.push({ id: recId, record });

                        // 重複メッセージ蓄積（例: レコードID 123　電話番号/フリガナ）
                        dupMessages.push(`レコードID ${recId}　${cbValues.join('/')}　${dupDetailLines.join(' / ')}`);
                        dupCount++;

                        // 重複レコードは比較対象に追加しない（OKでないので）
                        continue;
                    }

                    // 重複なし：OK をON ＋ 正規化住所・座標を書き込む
                    record[F.dupCheck] = { value: [CB.ok] };
                    if (geo1) {
                        record[F.addr1_input]  = { value: addrInput1 };
                        record[F.addr1_normal] = { value: addr1Normal };
                        record[F.addr1_lat]    = { value: String(geo1.latitude) };
                        record[F.addr1_lng]    = { value: String(geo1.longitude) };
                        record[F.addr1_level]  = { value: String(geo1.level) };
                        record[F.addr1_post]   = { value: geo1.postcode };
                        record[F.addr1_map]    = { value: buildGoogleMapUrl(addrInput1) };
                        record[F.addr1_place]  = { value: buildStreetViewUrl(geo1.latitude, geo1.longitude) };
                    }
                    if (geo2) {
                        record[F.addr2_input]  = { value: addrInput2 };
                        record[F.addr2_normal] = { value: addr2Normal };
                        record[F.addr2_lat]    = { value: String(geo2.latitude) };
                        record[F.addr2_lng]    = { value: String(geo2.longitude) };
                        record[F.addr2_level]  = { value: String(geo2.level) };
                        record[F.addr2_post]   = { value: geo2.postcode };
                        record[F.addr2_map]    = { value: buildGoogleMapUrl(addrInput2) };
                        record[F.addr2_place]  = { value: buildStreetViewUrl(geo2.latitude, geo2.longitude) };
                    }
                    updates.push({ id: recId, record });

                    // 処理済みを比較対象に動的追加（同バッチ内の重複も検出）
                    checkedRecs.push({
                        '$id':            { value: recId },
                        [F.kana]:         { value: val(F.kana) },
                        [F.bday]:         { value: val(F.bday) },
                        [F.tel]:          { value: val(F.tel) },
                        [F.addr1_normal]: { value: addr1Normal },
                        [F.addr2_normal]: { value: addr2Normal },
                    });

                    okCount++;
                }

                // Step 5: 一括書き込み（100件ずつ）
                progress.textContent = 'kintoneに書き込み中…';
                for (let i = 0; i < updates.length; i += 100) {
                    await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', {
                        app: APP_ID,
                        records: updates.slice(i, i + 100).map(u => ({ id: u.id, record: u.record })),
                    });
                }

                progress.textContent = '';
                if (dupMessages.length > 0) {
                    alert(
                        `完了しました。\nOK: ${okCount} 件　重複あり: ${dupCount} 件\n\n【重複検出一覧】\n` +
                        dupMessages.join('\n')
                    );
                } else {
                    alert(`完了しました。\nOK: ${okCount} 件`);
                }

            } catch (e) {
                alert('エラーが発生しました:\n' + e.message);
                console.error(e);
                progress.textContent = 'エラー発生';
            } finally {
                btn.disabled = false;
            }
        });

        //const header = kintone.app.getHeaderSpaceElement();
        const header = kintone.app.getHeaderMenuSpaceElement()
        header.appendChild(btn);
        header.appendChild(progress);
        return event;
    });

})();
