//============================================
// 名義名　半角カナ
//============================================
formBridge.events.on('form.field.change.名義人', function(context) {
  var ts = context.value;
  if (ts.match(/^[ｰ-ﾟ0-9A-Z ()-.]*$/)) {
    context.setFieldValueError('名義人', null);
  } else {
    // カタカナ以外が含まれる場合はエラー
    context.setFieldValueError('名義人', '半角カタカナで入力してください。');
  }
});
