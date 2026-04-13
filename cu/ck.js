(() => {
  'use strict';

  const MASTER_HEIGHT_APP = 2402;
  const MASTER_SCORE_APP = 2231;
  const MASTER_THRESHOLD_APP = 2407;  // 色閾値マスタ
  const TARGET_FIELD_H = 'score';
  const AGE_DISPLAY_FIELD = '測定時年齢';
  const LOT_FIELD = 'LOT'; 
  const CHECK_VALUE_H = '身長';
  const CHECK_VALUE_KAUP = 'カウプ指数';
  const COLOR_KEYS = ['知的', '発達', '育児'];

  // 区コードマッピング（市町村区 → 区コード）
  const KU_CODE_MAP = {
    '新潟市北区':   '1',
    '新潟市東区':   '2',
    '新潟市中央区': '3',
    '新潟市江南区': '4',
    '新潟市秋葉区': '5',
    '新潟市南区':   '6',
    '新潟市西区':   '7',
    '新潟市西蒲区': '8',
  };

  // --- ヘルパー関数群 ---
  const getAgeYM = (birthStr, measureStr) => {
    if (!birthStr || !measureStr) return null;
    const birth = new Date(birthStr);
    const measure = new Date(measureStr);
    let years = measure.getFullYear() - birth.getFullYear();
    let months = measure.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    if (measure.getDate() < birth.getDate()) {
      months--;
      if (months < 0) { years--; months = 11; }
    }
    return { year: String(years), month: String(months), display: `${years}歳${months}ヶ月` };
  };

  const fetchAllRecords = async (appId, query = '') => {
    let allRecords = [];
    let lastId = 0;
    while (true) {
      const q = `${query ? query + ' and ' : ''} $id > ${lastId} order by $id asc limit 500`;
      const resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: appId, query: q });
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length < 500) break;
      lastId = resp.records[resp.records.length - 1].$id.value;
    }
    return allRecords;
  };

  // --- プルダウンダイアログ生成関数 ---
  const showLotSelector = (lotOptions) => {
    return new Promise((resolve) => {
      const bg = document.createElement('div');
      bg.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; display:flex; justify-content:center; align-items:center;';
      
      const dialog = document.createElement('div');
      dialog.style = 'background:#fff; padding:20px; border-radius:8px; width:300px; text-align:center; box-shadow: 0 2px 10px rgba(0,0,0,0.3);';
      dialog.innerHTML = '<div style="margin-bottom:15px; font-weight:bold;">対象のLOTを選択してください</div>';

      const select = document.createElement('select');
      select.style = 'width:100%; padding:8px; margin-bottom:20px;';
      
      lotOptions.sort((a, b) => a > b ? -1 : 1).forEach(lot => {
        const opt = document.createElement('option');
        opt.value = lot;
        opt.text = lot;
        select.appendChild(opt);
      });

      const btnOk = document.createElement('button');
      btnOk.innerHTML = '実行';
      btnOk.className = 'kintoneplugin-button-dialog-ok';
      btnOk.style = 'margin-right:10px;';

      const btnCancel = document.createElement('button');
      btnCancel.innerHTML = 'キャンセル';
      btnCancel.className = 'kintoneplugin-button-dialog-cancel';

      btnOk.onclick = () => { document.body.removeChild(bg); resolve(select.value); };
      btnCancel.onclick = () => { document.body.removeChild(bg); resolve(null); };

      dialog.appendChild(select);
      dialog.appendChild(btnOk);
      dialog.appendChild(btnCancel);
      bg.appendChild(dialog);
      document.body.appendChild(bg);
    });
  };

  kintone.events.on('app.record.index.show', (event) => {
    if (document.getElementById('hm_button')) return event;

    const btn = document.createElement('button');
    btn.id = 'hm_button';
    btn.innerHTML = '更新(LOT選択)';
    btn.className = 'kintoneplugin-button-dialog-ok';
    btn.style.margin = '10px';

    btn.onclick = async () => {
      try {
        btn.disabled = true;

        // 1. LOT一覧の取得
        const allTargetRecords = await fetchAllRecords(kintone.app.getId());
        const lotSet = new Set();
        allTargetRecords.forEach(r => { if (r[LOT_FIELD]?.value) lotSet.add(r[LOT_FIELD].value); });

        if (lotSet.size === 0) {
          alert('処理対象となるLOTが見つかりません。');
          btn.disabled = false;
          return;
        }

        // 2. プルダウンで選択
        const selectedLot = await showLotSelector(Array.from(lotSet));
        if (!selectedLot) { btn.disabled = false; return; }

        btn.innerHTML = '処理中...';

        // 3. マスタ取得（身長・スコア・色閾値）
        const [heightResp, scoreResp, thresholdResp] = await Promise.all([
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: MASTER_HEIGHT_APP, query: 'HW = "height"' }),
          fetchAllRecords(MASTER_SCORE_APP),
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', { app: MASTER_THRESHOLD_APP, query: '$id > 0 limit 1' })
        ]);

        const heightMap = new Map();
        heightResp.records.forEach(r => heightMap.set(`${String(r.year.value).trim()}-${String(r.month.value).trim()}`, r));
        const scoreMap = new Map();
        scoreResp.forEach(r => scoreMap.set(r.fc.value, r));

        // 色閾値の取得（固定1レコード）
        const thresholdRecord = thresholdResp.records[0];
        const colorThresholds = {
          pink:   Number(thresholdRecord?.pink?.value   || 0),
          green:  Number(thresholdRecord?.green?.value  || 0),
          purple: Number(thresholdRecord?.purple?.value || 0),
        };
        // カウプ指数閾値（下限・上限）
        const kaupLower = Number(thresholdRecord?.['下']?.value ?? NaN);
        const kaupUpper = Number(thresholdRecord?.['上']?.value ?? NaN);

        // 4. 計算・更新データ作成
        const updateArray = [];
        allTargetRecords.filter(r => r[LOT_FIELD].value === selectedLot).forEach(rec => {
          let recordUpdate = {};
          let isChanged = false;

          // A: 身長・年齢
          const age = getAgeYM(rec['bd'].value, rec['p07_3'].value);
          if (age) {
            if (rec[AGE_DISPLAY_FIELD].value !== age.display) {
              recordUpdate[AGE_DISPLAY_FIELD] = { value: age.display };
              isChanged = true;
            }
            const hKey = `${age.year}-${age.month}`;
            const genderField = (rec['p04_1'].value === '男児' || rec['p04_1'].value === '男') ? 'male' : 'female';
            if (heightMap.has(hKey)) {
              const hMaster = heightMap.get(hKey);
              const threshold = parseFloat(hMaster[genderField].value);
              const inputHeight = parseFloat(rec['p07_1'].value);
              let checks = rec[TARGET_FIELD_H].value || [];
              const hasH = checks.includes(CHECK_VALUE_H);
              if (inputHeight <= threshold && !hasH) {
                checks.push(CHECK_VALUE_H);
                recordUpdate[TARGET_FIELD_H] = { value: checks };
                isChanged = true;
              } else if (inputHeight > threshold && hasH) {
                recordUpdate[TARGET_FIELD_H] = { value: checks.filter(v => v !== CHECK_VALUE_H) };
                isChanged = true;
              }
            }
          }

          // B: スコア集計
          let s = { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 };
          let colors = { purple: 0, green: 0, pink: 0 };
          let totalSum = 0;
          for (let i = 1; i <= 39; i++) {
            const fc = `q${String(i).padStart(2, '0')}`;
            if (!rec[fc]) continue;
            const master = scoreMap.get(fc);
            if (master) {
              const point = (rec[fc].value === 'はい') ? Number(master.qc1.value || 0) : Number(master.qc2.value || 0);
              if (s[`s${master.cat.value}`] !== undefined) s[`s${master.cat.value}`] += point;
              if (colors[master.color.value] !== undefined) colors[master.color.value] += point;
              totalSum += point;
            }
          }

          // s1〜s6・color合計・sum の数値フィールド更新
          ['s1','s2','s3','s4','s5','s6'].forEach(k => {
            if (Number(rec[k]?.value || 0) !== s[k]) { recordUpdate[k] = { value: s[k] }; isChanged = true; }
          });
          COLOR_KEYS.forEach(k => {
            if (Number(rec[k]?.value || 0) !== colors[k]) { recordUpdate[k] = { value: colors[k] }; isChanged = true; }
          });
          if (Number(rec['sum']?.value || 0) !== totalSum) { recordUpdate['sum'] = { value: totalSum }; isChanged = true; }

          // C: scoreチェックボックスへの pink / green / purple 反映
          // (A処理後の最新checks状態を取得してから加工する)
          let checks = (recordUpdate[TARGET_FIELD_H]?.value) ?? (rec[TARGET_FIELD_H].value || []);
          let checksChanged = false;
          COLOR_KEYS.forEach(colorKey => {
            const meetsThreshold = colors[colorKey] >= colorThresholds[colorKey];
            const hasFlag = checks.includes(colorKey);
            if (meetsThreshold && !hasFlag) {
              checks = [...checks, colorKey];
              checksChanged = true;
            } else if (!meetsThreshold && hasFlag) {
              checks = checks.filter(v => v !== colorKey);
              checksChanged = true;
            }
          });
          if (checksChanged) {
            recordUpdate[TARGET_FIELD_H] = { value: checks };
            isChanged = true;
          }

          // D: カウプ指数の計算・保存・チェックボックス反映
          const heightVal = parseFloat(rec['p07_1'].value);
          const weightVal = parseFloat(rec['p07_2'].value);
          if (!isNaN(heightVal) && !isNaN(weightVal) && heightVal > 0) {
            const kaupIndex = weightVal / Math.pow(heightVal / 100, 2);
            const kaupRounded = Math.round(kaupIndex * 10) / 10; // 小数点1桁に丸め

            // カウプ指数フィールドへの書き込み
            if (Number(rec['カウプ指数']?.value || 0) !== kaupRounded) {
              recordUpdate['カウプ指数'] = { value: kaupRounded };
              isChanged = true;
            }

            // 閾値チェック: 下限〜上限の範囲外なら "カウプ指数" をチェックボックスに追加
            // checks は上記C処理後の最新状態を引き継ぐ
            checks = (recordUpdate[TARGET_FIELD_H]?.value) ?? (rec[TARGET_FIELD_H].value || []);
            const hasKaup = checks.includes(CHECK_VALUE_KAUP);
            const isOutOfRange = (!isNaN(kaupLower) && kaupRounded < kaupLower)
                              || (!isNaN(kaupUpper) && kaupRounded > kaupUpper);
            if (isOutOfRange && !hasKaup) {
              checks = [...checks, CHECK_VALUE_KAUP];
              recordUpdate[TARGET_FIELD_H] = { value: checks };
              isChanged = true;
            } else if (!isOutOfRange && hasKaup) {
              checks = checks.filter(v => v !== CHECK_VALUE_KAUP);
              recordUpdate[TARGET_FIELD_H] = { value: checks };
              isChanged = true;
            }
          }

          // E: 区コードのセット（市町村区 ap12 → 区コード）
          const ap12Val = rec['ap12']?.value ?? '';
          const mappedCode = KU_CODE_MAP[ap12Val] ?? null;
          if (mappedCode !== null && rec['区コード']?.value !== mappedCode) {
            recordUpdate['区コード'] = { value: mappedCode };
            isChanged = true;
          }

          if (isChanged) updateArray.push({ id: rec.$id.value, record: recordUpdate });
        });

        // 5. 更新
        if (updateArray.length > 0) {
          const limit = 100;
          for (let i = 0; i < updateArray.length; i += limit) {
            await kintone.api(kintone.api.url('/k/v1/records.json', true), 'PUT', { app: kintone.app.getId(), records: updateArray.slice(i, i + limit) });
          }
          alert(`LOT: ${selectedLot} を ${updateArray.length} 件更新しました。`);
          location.reload();
        } else {
          alert('更新が必要なレコードはありません。');
        }
      } catch (err) {
        console.error(err);
        alert('エラーが発生しました。');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '更新(LOT選択)';
      }
    };

    kintone.app.getHeaderMenuSpaceElement().appendChild(btn);
    return event;
  });
})();
