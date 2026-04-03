
function try2yyyy(ds) {
  var s1 = ds.charAt(0);
  var s2 = ds.charAt(1);
  var s3 = ds.charAt(2);
  var s4 = ds.charAt(3);
  var s5 = ds.charAt(4);
  var s6 = ds.charAt(5);
  var s7 = ds.charAt(6);
  var yy = parseInt(s2 + s3);
  var mm = parseInt(s4 + s5);
  var dd = parseInt(s6 + s7);
  var y;
  if(s1 == 'r' || s1 == 'R' || s1 == '5') {
    y = yy + 2018;
  } else if(s1 == 'h' || s1 == 'H' || s1 == '4') {
    y = yy + 1988;
  } else if(s1 == 's' || s1 == 'S' || s1 == '3') {
    y = yy + 1925;
  } else if(s1 == 't' || s1 == 'T' || s1 == '2') {
    y = yy + 1911;
  } else if(s1 == 'm' || s1 == 'M' || s1 == '1') {
    y = yy + 1867;
  } else {
    y = yy;
  }
  var bddata = new Date(y, mm-1, dd);
  return(bddata);
}


function tryyyy2yyyy(ds) {
  var s1 = ds.charAt(0);
  var s2 = ds.charAt(1);
  var s3 = ds.charAt(2);
  var s4 = ds.charAt(3);
  var s5 = ds.charAt(4);
  var s6 = ds.charAt(5);
  var s7 = ds.charAt(6);
  var s8 = ds.charAt(7);
  var yy = parseInt(s1 + s2 + s3 + s4);
  var mm = parseInt(s5 + s6);
  var dd = parseInt(s7 + s8);
  var bddata = new Date(yy, mm-1, dd);
  return(bddata);
}


formBridge.events.on('form.field.change.bdtext', function(context) {
  var bdtext = context.value;
  if(bdtext.length ==8) {
    var bd = tryyyy2yyyy(bdtext);
    context.setFieldValue('bd1', bd);
  } else if(bdtext.length ==7) {
    var bd = try2yyyy(bdtext);
    context.setFieldValue('bd1', bd);
  }
});


