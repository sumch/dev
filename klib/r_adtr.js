const addressFields = ['ap11', 'ap12', 'ap13', 'ap14'];

//addressFields.forEach(fieldCode => {
//  formBridge.events.on(`form.field.change.${fieldCode}`, async (context) => {

formBridge.events.on(`form.submit`, async (context) => {
  addressFields.forEach(fieldCode => {

    var rec = context.getRecord();
    
    // addressFieldsの各要素について、変更されたものはcontext.valueから、
    // それ以外はrecから取得してオブジェクトに格納
    const currentValues = {};
    addressFields.forEach(code => {
      currentValues[code] = (fieldCode === code) ? context.value : (rec[code].value || '');
    });

    // 1. 結合して「位置用住所」を作成
    const combinedAddr = addressFields.map(code => currentValues[code]).join('');
    context.setFieldValue('位置用住所', combinedAddr);

    if (!combinedAddr) return context;

    try {
      // 2. API呼び出し（ap11の値をエリアとして使用）
      const url = `https://cityniigata.com/geo/tr.php/geocode?area=${encodeURIComponent(currentValues['ap11'])}&opts=all&addr=${encodeURIComponent(combinedAddr)}`;
      const response = await fetch(url);
      
      if (!response.ok) return context;
      const data = await response.json();

      if (data && data.length > 0 && data[0].node) {
        const node = data[0].node;

        // 正規化住所 (fullname配列を結合)
        const normalizedAddr = Array.isArray(node.fullname) ? node.fullname.join('') : '';

        // 3. 各フィールドに値をセット
        context.setFieldValue('正規化住所', normalizedAddr);
        context.setFieldValue('lat', node.y ? String(node.y) : '');
        context.setFieldValue('lng', node.x ? String(node.x) : '');
        context.setFieldValue('level', node.level ? String(node.level) : '');
        context.setFieldValue('postcode', node.postcode ? String(node.postcode) : '');
      }
    } catch (error) {
      console.error('住所正規化処理中にエラーが発生しました:', error);
    }

    return context;
  });
});
