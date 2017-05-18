var captchaSolver = require('./captcha_solver.js'),
    utils = require('./utils.js'),
    config = require('./config.json'),
    casper = require('casper').create({
        pageSettings : {
            userAgent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
        verbose: true
    });

//Poner la url en el config.json

var formDataFields = {
    rut           : { name : 'W0023vRUTPRINCIPAL',         value :  '217667300012'},
                                                                    //Key del input con el captcha
    captchaKey    : { name : 'recaptcha_challenge_field' , value : 'bd4dae81-28d7-44a2-8994-9e6be8a6b295'},
                                                                    //solucion al captcha
    captchaSolved : { name : 'recaptcha_response_field',   value : 'armetly'},
    toRequest: function () {
        var result = {};
        result[this.rut.name] = this.rut.value;
        result[this.captchaKey.name] = this.captchaKey.value;
        result[this.captchaSolved.name] = this.captchaSolved.value;
        return result;
    }

};
//document.querySelector('iframe').contentWindow.document.querySelector('iframe').contentWindow.document.querySelector('embed');
casper.on('remote.message', function(message) {
    this.echo(message);
});

casper.start(config.url, function () {
    this.echo('Loading site, wait');
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
    var link_pdf;
    this.wait(2000);
    this.withFrame('gxpea000889000001', function () {
        //Saca foto!
        this.capture('manco1.jpg');
        link_pdf = this.evaluate(function () {
            /* TODO: aca quede, hay que ver de como hacer para sacar el src del PDF, cuando saca foto
                por alguna razon no renderea el <embed> que tiene el pdf dentro
              */
            var iframe = document.querySelector('iframe');
            console.log(iframe.name);
            var frameDocument = iframe.contentWindow.document;
            //trae vacio! :<
            var container_pdf = frameDocument.querySelector('embed');
            console.log(container_pdf);
            return container_pdf.src;
        });
        this.capture('manco1.jpg');
    });


});

casper.run();

