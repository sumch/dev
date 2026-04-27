(function () {
    'use strict';

    // encoding.js を動的ロード（SJIS変換に使用）
    function loadEncodingJs() {
        return new Promise((resolve, reject) => {
            if (window.Encoding) { resolve(); return; }
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/encoding-japanese@2/encoding.min.js';
            s.onload  = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // カーソルAPIで全件取得
    async function fetchAllRecords(appId) {
        const cursorRes = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', {
            app:  appId,
            size: 500,
        });
        const cursorId = cursorRes.id;
        let allRecs = [];
        let hasMore = true;
        while (hasMore) {
            const res = await kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', {
                id: cursorId,
            });
            allRecs = allRecs.concat(res.records);
            hasMore = res.next;
        }
        return allRecs;
    }

    // CSVをSJIS・BOMなしでダウンロード
    function downloadCSV(records, filename) {
        if (!records || records.length === 0) {
            alert(filename + ': レコードなし');
            return;
        }
        const keys = Object.keys(records[0]);
        const escape = v => {
            const s = v === null || v === undefined ? '' : String(v);
            return (s.includes(',') || s.includes('"') || s.includes('\n'))
                ? '"' + s.replace(/"/g, '""') + '"'
                : s;
        };
        const rows = [keys.join(',')];
        records.forEach(rec => {
            const row = keys.map(k => {
                const f = rec[k];
                if (!f) return '';
                if (typeof f.value === 'object' && f.value !== null) {
                    return escape(JSON.stringify(f.value));
                }
                return escape(f.value);
            });
            rows.push(row.join(','));
        });

        const csvStr = rows.join('\r\n');

        // SJIS変換（BOMなし）
        const sjisArray = Encoding.convert(
            Encoding.stringToCode(csvStr),
            { to: 'SJIS', from: 'UNICODE' }
        );
        const uint8 = new Uint8Array(sjisArray);
        const blob  = new Blob([uint8], { type: 'text/csv;charset=shift_jis;' });
        const a     = document.createElement('a');
        a.href      = URL.createObjectURL(blob);
        a.download  = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    kintone.events.on('app.record.index.show', (event) => {
        if (document.getElementById('csvDownloadBtn')) return event;

        const csvBtn = document.createElement('button');
        csvBtn.id          = 'csvDownloadBtn';
        csvBtn.textContent = 'CSV出力';
        csvBtn.style.cssText =
            'margin:4px 8px;padding:8px 20px;background:#007bff;color:white;' +
            'border:none;border-radius:4px;font-size:14px;cursor:pointer;';

        const csvProgress = document.createElement('span');
        csvProgress.id            = 'csvProgress';
        csvProgress.style.cssText = 'margin-left:12px;font-size:13px;color:#555;vertical-align:middle;';

        csvBtn.addEventListener('click', async () => {
            csvBtn.disabled         = true;
            csvProgress.textContent = 'encoding.js 読み込み中…';

            try {
                await loadEncodingJs();

                // アプリ2230
                csvProgress.textContent = 'アプリ2230 取得中…';
                const recs2230 = await fetchAllRecords(2230);
                downloadCSV(recs2230, 'app2230.csv');

                // アプリ2418
                csvProgress.textContent = 'アプリ2418 取得中…';
                const recs2418 = await fetchAllRecords(2418);
                downloadCSV(recs2418, 'app2418.csv');

                csvProgress.textContent = '';
                alert(`完了 2230:${recs2230.length}件 / 2418:${recs2418.length}件`);

            } catch (e) {
                alert('CSVエラー: ' + e.message);
                console.error(e);
                csvProgress.textContent = 'エラー発生';
            } finally {
                csvBtn.disabled = false;
            }
        });

        const header = kintone.app.getHeaderMenuSpaceElement();
        if (header) {
            header.appendChild(csvBtn);
            header.appendChild(csvProgress);
        }

        return event;
    });

})();
