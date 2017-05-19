var captchaSolver = require('./captcha_solver.js'),
    moment = require('moment'),
    utils = require('./utils.js'),
    config = require('./config.json'),
    fs = require('fs'),
    casper = require('casper').create({
        pageSettings : {
            userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
        verbose: true,
        logLevel: 'info'
    });
var link_pdf;

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

//Poner la url en el config.json
var formDataFields = {
    rut           : { name : 'W0023vRUTPRINCIPAL',         value :  '217667300012'},
                                                                    //Key del input con el captcha
    captchaKey    : { name : 'recaptcha_challenge_field' , value : 'adee60f5-b2eb-4019-b9bb-0015859fd527'},
                                                                    //solucion al captcha
    captchaSolved : { name : 'recaptcha_response_field',   value : 'fatled'},
    toRequest: function () {
        var result = {};
        result[this.rut.name] = this.rut.value;
        result[this.captchaKey.name] = this.captchaKey.value;
        result[this.captchaSolved.name] = this.captchaSolved.value;
        return result;
    }

};

casper.start(config.url, function () {
    this.log('Loading site, wait', 'info');
    //Esperamos que se cargue el frame del captcha
    this.waitForSelector('iframe');
});

//Task a ejecutar
casper.then(function () {
    //Cambia el contexto al frame del formulario
    casper.withFrame('gxpea000889000001', function () {
                                            //evaluate se mete dentro del contexto del dom del navegador (lo de afuera deja de existir hasta que salga)
        formDataFields.captchaKey.value = this.evaluate(function (formDataFields) {
            var captcha = document.getElementById('recaptcha_challenge_field');
            //cambio el key para poder submitear el form (usen uno cualquiera y solucionen el input a mano y lo colocan en formData)
            captcha.value = formDataFields.captchaKey.value;
            return captcha.value;
        }, formDataFields);
    });

});

casper.then(function () {
    casper.withFrame('gxpea000889000001', function () {
        //Llena el form, false para que no submitee
        this.fill('form#MAINFORM', formDataFields.toRequest(), false)
        this.click('input[type="button"][name="W0023BOTON"]');
        this.wait(5000);
    });
});

casper.then(function () {
    this.wait(2000);
    this.withFrame('gxpea000889000001', function () {
        //Saca foto!
        this.capture('manco1.jpg');
        link_pdf = this.evaluate(function () {
            /* TODO: aca quede, hay que ver de como hacer para sacar el src del PDF, cuando saca foto
                por alguna razon no renderea el <embed> que tiene el pdf dentro
              */
            var iframe = document.querySelector('iframe');
            return iframe.src;
        });
        this.capture('manco1.jpg');
    });
});

casper.then(function () {
    if(link_pdf != null) {
        this.download(link_pdf, formDataFields.rut.value + '.pdf');
    }
});

casper.run();

