(function() {
    'use strict';

    // 区名とコードの対応表
    const WARD_MAP = {
        '北区': '1',
        '東区': '2',
        '中央区': '3',
        '江南区': '4',
        '秋葉区': '5',
        '南区': '6',
        '西区': '7',
        '西蒲区': '8'
    };

    /**
     * 組織名から区コードを判定する関数
     * @param {Array} soshikiValue - kintoneの組織選択フィールドのvalue
     * @returns {string} 区コード
     */
    function getKcode(soshikiValue) {
        if (!soshikiValue || soshikiValue.length === 0) return "2"; // 組織未選択時のデフォルト値
        
        // 最初の組織名を取得
        //const soshikiName = soshikiValue[0].name || "";
        const soshikiName = soshikiValue;
        
        // 対応表に一致する区名があるか確認
        for (const key in WARD_MAP) {
            if (soshikiName.indexOf(key) >= 0) {
                return WARD_MAP[key];
            }
        }
        return "2"; // 該当なしの場合のデフォルト
    }

    // レコード一覧画面で実行
    kintone.events.on(['app.record.index.show'], function(event) {
        if (document.getElementById('calc_run_button') !== null) return;

        const button = document.createElement('button');
        button.id = 'calc_run_button';
        button.textContent = '区コードを一括更新';
        button.style.margin = '10px';
        button.className = 'kintoneplugin-button-dialog-ok'; // kintone風のスタイル

        button.onclick = async function() {
            if (confirm('表示中の全レコードの区コードを更新します。よろしいですか？')) {
                await updateAllKcodes(kintone.app.getId());
            }
        };

        kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    });

    /**
     * 全レコードを取得し、区コードを更新する
     */
    async function updateAllKcodes(appId) {
        try {
            let allRecords = [];
            let offset = 0;
            const limit = 500;

            // 1. 全レコード取得
            while (true) {
                const params = {
                    app: appId,
                    query: `limit ${limit} offset ${offset}`,
                    fields: ['$id', '所属組織', '区コード']
                };
                const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params);
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length < limit) break;
                offset += limit;
            }

            if (allRecords.length === 0) {
                alert('レコードが見つかりません。');
                return;
            }

            // 2. 更新用データ作成
            const updateRecords = allRecords.map(record => {
                return {
                    id: record.$id.value,
                    record: {
                        '区コード': { value: getKcode(record['所属組織'].value) }
                    }
                };
            });

            // 3. 100件ずつ分割して更新 (kintone APIの制限対策)
            for (let i = 0; i < updateRecords.length; i += 100) {
                const chunk = updateRecords.slice(i, i + 100);
                await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', {
                    app: appId,
                    records: chunk
                });
            }

            alert(`更新完了: ${updateRecords.length}件のレコードを更新しました。`);
            location.reload(); // 画面をリロードして反映を確認

        } catch (error) {
            console.error(error);
            alert('エラーが発生しました。詳細はコンソールを確認してください。');
        }
    }

    // レコード追加・編集時の自動判定
    kintone.events.on([
        'app.record.create.submit', 
        'app.record.edit.submit',
        'app.record.create.change.所属組織', // 組織を選んだ瞬間に変えたい場合
        'app.record.edit.change.所属組織'
    ], function(event) {
        const record = event.record;
        record['区コード'].value = getKcode(record['所属組織'].value);
        return event;
    });

})();
