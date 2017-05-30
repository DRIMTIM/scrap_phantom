var captchaSolver = require('./captcha_solver.js'),
    anticaptcha = require('anti-captcha'),
    moment = require('moment'),
    utils = require('./utils.js'),
    config = require('./config.json'),
    fs = require('fs'),
    casper = require('casper').create({
        pageSettings : {
            userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
        verbose: true,
        logLevel: 'debug'
    });

casper.on('remote.message', function(message) {
    this.log(message, 'info');
});
//TODO: hacer andar el log
// casper.on('log', function (entry) {
//     var file = fs.open('log.txt', 'w');
//     var fecha = moment.format('YYYY-MM-DD hh:mm:ss a');
//     fs.writeFile(file, '['+fecha +']' + entry.message, function (error) {
//         console.log(error);
//     });
//     file.close();
// });
var link_pdf = null;
var captchaField = null;
var formDataFields = {
    rut           : { name : 'W0023vRUTPRINCIPAL',         value :  ''},
                                                           //Key del input con el captcha
    captchaKey    : { name : 'recaptcha_challenge_field' , value : ''},
                                                           //solucion al captcha
    captchaSolved : { name : 'recaptcha_response_field',   value : ''},
    toRequest: function () {
        var result = {};
        result[this.rut.name] = this.rut.value;
        //result[this.captchaKey.name] = this.captchaKey.value;
        result[this.captchaSolved.name] = this.captchaSolved.value;
        return result;
    }
};

casper.start(config.url, function () {
    this.log('Loading site, wait', 'info');
    //Esperamos que se cargue el frame del captcha

});

//Task a ejecutar
casper.then(function () {
    //Cambia el contexto al frame del formulario
    this.wait(5000);
    this.withFrame('gxpea000889000001', function () {
        //evaluate se mete dentro del contexto del dom del navegador (lo de afuera deja de existir hasta que salga)
        captchaField = this.evaluate(function () {
            var inputCaptcha = document.getElementById('recaptcha_challenge_field');
            var captcha = document.querySelector('#captchaTable2.captchaImg');
            return {
                image : captcha.src,
                key : inputCaptcha.value
            };
        });
    });
});

casper.then(function () {
    casper.withFrame('gxpea000889000001', function () {
        //Llena el form, false para que no submitee
        this.fill('form#MAINFORM', formDataFields.toRequest(), false);
        this.click('input[type="button"][name="W0023BOTON"]');
    });
});

casper.then(function () {
    this.wait(7000)
        .withFrame('gxpea000889000001', function () {
            link_pdf = this.evaluate(function () {
                var iframe = document.querySelector('iframe');
                return iframe.src;
            });
        });
});

casper.then(function () {
    if(link_pdf != null) {
        this.download(link_pdf, formDataFields.rut.value + '.pdf');
    }
});

casper.run();

