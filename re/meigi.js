//============================================
// 名義名　半角カナ
//============================================
(function() {
"use strict";
    let kin2_error_msg = '工事費総額は交付算定額以上としてください';
    
    fb.addValidators = function(state) {
        return {
            katakana_validation: {
                // エラーメッセージ内容
                getMessage: function(fieldCode, params) {
                    return '半角カタカナで入力してください。';
                },
                // エラー判定条件
                validate: function(value, params) {
                    value = (value == null) ? "" : value;
                    //if (value.match(/^[ァ-ヶー　]+$/)) {
                    //if (value.match(/^[ｦ-ﾟ ]*$/)) {
                    if (value.match(/^[ｰ-ﾟ0-9A-Z ()-.]*$/)) {
                        return true;
                    } else {
                        // カタカナ以外が含まれる場合はエラー
                        return false;
                    }
                }
            },
            kin1_validation: {
                // エラーメッセージ内容
                getMessage: function(fieldCode, params) {
                    return '10000円以上でなければなりません';
                },
                // エラー判定条件
                validate: function(value, params) {
  if(stsconst == '申請') {
                    if (kins2n(state.record.補助金申請額.value) < 10000) {
                        return false;
                    } else {
                        return true;
                    }
  } else {
                        return true;
  }
                }
            },
            kin3_validation: {
                // エラーメッセージ内容
                getMessage: function(fieldCode, params) {
                    return '10000円以上でなければなりません';
                },
                // エラー判定条件
                validate: function(value, params) {
  if(stsconst == '申請') {
                        return true;
  } else {
                    if (kins2n(state.record.交付算定額.value) < 10000) {
                        return false;
                    } else {
                        return true;
                    }
  }
                }
            },


            kin2_validation: {
                
                // エラーメッセージ内容
                getMessage: function(fieldCode, params) {
                    return kin2_error_msg;
                },
                // エラー判定条件
                validate: function(value, params) {
  if(stsconst == '申請') {
                        return true;
  } else {
                    if (kins2n(state.record.交付算定額.value) > kins2n(state.record.工事費総額_実績.value)) {
                        kin2_error_msg = '工事費総額は交付算定額以上としてください';
                        return false;
                    } else {
                        const y1 = Number(kins2n(state.record.工事費総額_実績.value));
                        const y2 = Number(kins2n(state.record.領収金額_実績.value));
                        if (Math.round(y1*1.1) >  y2 ) {
                            kin2_error_msg = '領収金額_実績×1.1以上でなければなりません';
                            return false;
                        } else {
                            return true;
                        }
                        return true;
                    }


  }
                }
            },
            day1s_validation: {
                getMessage: function(fieldCode, params) { return '申請日から２週間後、かつ、申請期間内を設定ください';  },
                validate: function(value, params) {
                    var today = new Date();
                    today.setDate(today.getDate() + 14-1);
                    var day1 = state.record.着手予定日.value;
                    const day2 = new Date('2027/3/15');
                    if (day1 < today ||  day2 < day1 ) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            day1j_validation: {
                getMessage: function(fieldCode, params) { return '申請期間内を設定ください';  },
                validate: function(value, params) {
                    const today = state.record.交付決定日.value;
                    var day1 = state.record.着手日付.value;
                    const day2 = new Date('2027/3/15');
                    if (day1 < today ||  day2 < day1 ) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            day2s_validation: {
                getMessage: function(fieldCode, params) { return '着手予定日以降かつ申請期間内を設定ください';  },
                validate: function(value, params) {
                    const today = new Date();
                    today.setDate(today.getDate() + 14-1);
                    var day0 = state.record.着手予定日.value;
                    var day1 = state.record.完了予定日.value;
                    const day2 = new Date('2027/3/15');
                    if (day1 < today ||  day2 < day1  ||  day1 < day0 ) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            day2j_validation: {
                getMessage: function(fieldCode, params) { return '申請期間内を設定ください';  },
                validate: function(value, params) {
                    const today = state.record.交付決定日.value;
                    var day1 = state.record.完了日付.value;
                    const day2 = new Date('2027/3/15');
                    if (day1 < today ||  day2 < day1 ) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            c02ent_validation: {
                // エラーメッセージ内容
                getMessage: function(fieldCode, params) {
                    return '複数選択できません。';
                },
                // エラー判定条件
                validate: function(value, params) {
                    var m = state.record.C02部屋改修.value;
                    if(m.length > 1) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            yen1_validation: {
                getMessage: function(fieldCode, params) { return '金額を確認ください';  },
                validate: function(value, params) {
                    const y1 = Number(kins2n(state.record.工事費総額_実績.value));
                    const y2 = Number(kins2n(state.record.領収金額_実績.value));
                    if (Math.round(y1*1.1) >  y2 ) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },


        }
    };

    fb.events.form.created = [function(state) {
        // 全フィールドからエラーを出したいフィールドを検索
        state.fields.filter(function(field) {
            // エラーを出したいフィールド
            return field.code === '名義人';
        })[0].validations.push({
            params: [],
            rule: 'katakana_validation'  // fb.addValidatorsで定義した中から適用したいバリデーション名
        });
        
        state.fields.filter(function(field) {
            // エラーを出したいフィールド
            return field.code === '補助金申請額';
        })[0].validations.push({
            params: [],
            rule: 'kin1_validation'
        });
        state.fields.filter(function(field) {
            // エラーを出したいフィールド
            return field.code === '交付算定額';
        })[0].validations.push({
            params: [],
            rule: 'kin3_validation'
        });
        
        state.fields.filter(function(field) {
            // エラーを出したいフィールド
            return field.code === '工事費総額_実績';
        })[0].validations.push({
            params: [],
            rule: 'kin2_validation'
        });
        
        state.fields.filter(function(field) {
            return field.code === '着手予定日';
        })[0].validations.push({
            params: [], rule: 'day1s_validation'
        });
        state.fields.filter(function(field) {
            return field.code === '着手日付';
        })[0].validations.push({
            params: [], rule: 'day1j_validation'
        });
        
        state.fields.filter(function(field) {
            return field.code === '完了予定日';
        })[0].validations.push({
            params: [], rule: 'day2s_validation'
        });
        state.fields.filter(function(field) {
            return field.code === '完了日付';
        })[0].validations.push({
            params: [], rule: 'day2j_validation'
        });
        
        state.fields.filter(function(field) {
            // エラーを出したいフィールド
            return field.code === 'C02部屋改修';
        })[0].validations.push({
            params: [],
            rule: 'c02ent_validation'
        });
        state.fields.filter(function(field) {
            return field.code === '領収金額_実績';
        })[0].validations.push({
            params: [], rule: 'yen1_validation'
        });
        
        return state;
    }];




})();
