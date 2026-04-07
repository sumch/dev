const hiraToKana = text => {
  if (!text) return "";
  return text.replace(/[\u3041-\u3093]/g, 
    m => String.fromCharCode(m.charCodeAt(0) + 96)
  );
};

function kana_ini(context) {
  const rec = context.getRecord();
  const elements = document.querySelectorAll('[data-field-code]');
  const allCodes = Array.from(elements).map(el => el.getAttribute('data-field-code'));
  const targetFields = allCodes.filter(code => code && code.match(/^ap(\d+)7f$/));

  targetFields.forEach(fc => {
    const fieldEl = document.querySelector('[data-field-code=' + fc + ']');
    if (!fieldEl) return;

    const originalInput = fieldEl.querySelector('input');
    if (!originalInput || originalInput.dataset.dummyAdded) return;

    // 1. ダミー作成（余計なStyleは書かない。classだけでデザインは完成する）
    const dummyInput = document.createElement('input');
    dummyInput.type = 'text';
    //dummyInput.className = 'el-input__inner'; 
    dummyInput.className = 'placeholder:text-toyokumo-gray-400 w-full rounded-sm px-4 py-2 focus:outline-hidden focus:ring-0 focus:ring-offset-0 pl-4 pr-4 border border-toyokumo-gray-200 focus:border-role-action';
    dummyInput.placeholder = originalInput.placeholder || '';
    const recValue = rec[fc]?.value ?? '';
    dummyInput.value = hiraToKana(recValue); 
    //dummyInput.value = hiraToKana(originalInput.value); 
    originalInput.dataset.dummyAdded = "true";

    // 2. 表示の制御
    // 本番：これを有効にすれば、元のBOXが消えて見た目は完璧になります
    originalInput.style.display = 'none';

    // デバッグ用：位置ズレを確認するため、元のBOXを最小化して直下に置く
    originalInput.style.cssText = "display:block; width:100%; height:1px; opacity:0; margin:0; padding:0; border:none;";

    // 3. イベント制御
    dummyInput.addEventListener('change', (e) => {
      const converted = hiraToKana(e.target.value);
      dummyInput.value = converted; 
      context.setFieldValue(fc, converted);
    });

    // 4. 【最重要】挿入位置の特定
    // originalInputを包んでいる「青枠が出る枠（.el-input）」の中にダミーを入れます
    originalInput.insertAdjacentElement('beforebegin', dummyInput);
  });
}

// 文法厳守
function formshow_kana(context) {
  kana_ini(context);
  return context;
}
