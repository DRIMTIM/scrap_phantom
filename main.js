var fs = require('fs');
var page = require('webpage').create();
var system = require('system');

var jsession;

page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'

page.onResourceReceived = function(response){
    response.headers.forEach(function(header){
        if(header.name === 'Set-Cookie') {
            jsession = header.value;
        }
    });
};

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};

page.open('URL ACA: secreta :O', function (status) {


    if(status !== 'success') {
        console.log('Get page failed');
        return;
    }
    //Foto de la pagina
    page.render('manco.png')
    var keyCaptcha = page.evaluate(function () {
        //Id del iframe que contiene todo el form
        var frame = document.getElementById('gxpea000889000001').contentWindow.document;
        //Id del input hidden que tiene el key para el captcha
        var captcha = frame.getElementById('recaptcha_challenge_field').value;
        console.log('captcha key: ' + captcha);
        return captcha;
    });
    phantom.exit();
});

