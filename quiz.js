/**
 * quiz.js - The quiz engine
 *
 * Author: Steve Kerrison <forename.surname@bristol.ac.uk>
 * Copyright: Steve Kerrison 2015
 * License: MIT, see bundled LICENSE file
 *
**/

function NBQuiz() {
    "use strict";
    
    this.configs = {
        'simple': {
            'questions':    20,
            'bases':        [2, 10],
            'pow':          4, // Unsigned: 0--2^(pow)-1, signed: -2^(pow-1) -- 2^(pow-1)-1
            'signed':       false
        },
        'medium': {
            'questions':    20,
            'bases':        [2, 10, 16],
            'pow':          4,
            'signed':       true
        },
        'hard': {
            'questions':    30,
            'bases':        [2, 10, 16],
            'pow':          6,
            'signed':       true
        },
        'infinite': {
            'questions':    0,
            'bases':        [2, 8, 10, 16, 32, 36],
            'pow':          12,
            'signed':       true
        }
    };
    
    this.choose = function (a) {
        return a[Math.floor(Math.random() * a.length)];
    };
    
    this.toBaseString = function (v, b) {
        var s = '';
        if (b !== 10) {
            var ndigits = (Math.pow(2, this.config.pow) - 1).toString(b).length;
            s = (v >>> 0).toString(b);
            s = String("0".repeat(ndigits) + s).slice(-ndigits);
            
        } else {
            s = v.toString(10);
        }
        return s;
    };
    
    this.answer = function () {
        $('#conversion').prop('disabled', true);
        $('form#quiz').off('submit').submit($.proxy(this.nextq, this));
        
        this.total += 1;
        
        /* Ensure guess is formatted as requested */
        var guess = $('#conversion').val().trim();
        var answer = this.toBaseString(this.value, this.to);
        if (guess === answer) {
            $('#anscorrect').show();
            this.score += 1;
        } else {
            $('#ansincorrect').show().find('.answer span').text(answer);
        }
        $('#correct').text(this.score);
        $('#total').text(this.total);
        $('#progress').show();
        
        /* Deal with quiz end or continuous quizzing */
        if (this.total === this.config.questions || this.config.questions === 0) {
            this.perct = (this.score / this.total * 100.0).toFixed(2);
            $('#percentage span').text(this.perct);
            $('#percentage').show();
        }
        if (this.total === this.config.questions) {
            $('form#quiz input[type=submit]').val('Restart').focus();
            $('form#quiz').off('submit').submit($.proxy(this.init, this));
            $('#end').show();
        } else {
            $('form#quiz input[type=submit]').val('Continue').focus();
        }
        return false;
    };
    
    this.nextq = function () {
        /* Calculate the value we want to use from the quiz mode */
        this.base = this.choose(this.config.bases);
        this.value = Math.floor(Math.random() * Math.pow(2, this.config.pow));
        this.signed = false;
        this.currq += 1;
        if (this.config.signed === true && Math.random() > 0.5) {
            this.signed = true;
            this.value -= Math.pow(2, this.config.pow - 1);
        }
        this.to = this.base;
        do {
            this.to = this.choose( this.config.bases );
        } while (this.to === this.base); //Ugh
        if (this.to == 10) {
            this.ndigits = this.toBaseString(this.value, this.to).length;
        } else {
            this.ndigits = (Math.pow(2, this.config.pow) - 1).toString(this.to).length;
        }
        
        /* Setup the content */
        $('#orig').text(this.base);
        $('#val').text(this.toBaseString(this.value, this.base));
        $('#base').text(this.to);
        $('#ndigit').text(this.ndigits);
        $('#qno').text(this.currq);
        $('#qof').text(this.config.questions > 0 ? ' of ' + this.config.questions : '');
        if (this.to === 10) {
            $('#sign').text( this.signed ? 'signed (negative symbol where needed)' : 'unsigned');
        } else {
            $('#sign').text( this.signed ? "2's complement signed" : 'unsigned');
        }
        
        /* Switch the submit handler */
        $('form#quiz input[type=submit]').val('Check');
        $('#conversion').prop('disabled', false).val('').focus();
        $('#anscorrect, #ansincorrect').hide();
        $('form#quiz').off('submit').submit($.proxy(this.answer, this));
        return false;
    };

    this.init = function () {
        $('#nojs').hide();
        $('form#quiz').trigger('reset');
        $('#start').show();
        
        this.score = 0;
        this.currq = 0;
        this.total = 0;
        this.perct = 0;
        this.config = null;
        $('#anscorrect, #ansincorrect, #end, #percentage, #progress, #question').hide();
        return false;
    };
    
    this.start = function (difficulty) {
        this.config = this.configs[difficulty];
        $('#start').hide();
        $('#question').show();
        this.score = 0;
        this.currq = 0;
        this.total = 0;
        this.perct = 0;
        this.nextq();
    };
    
    $('form#quiz input[name=difficulty]').change( $.proxy(function () {
        this.start($('form#quiz input[name=difficulty]:checked').val());
        return false;
    }, this));
    
}

$(function(){
    "use strict";
    
    var Q = new NBQuiz();
    Q.init();

});
