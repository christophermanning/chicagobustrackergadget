﻿var numUpdatesBeforeSleep = 10;
var updateFrequencyInSeconds = 60;
var interval;
var currentUpdate = 0;
var currentSecond = 0;
var cbt = $.ctabustracker(CBTAPIKEY);
document.onreadystatechange = function()
{
    if(document.readyState=='complete'){
        System.Gadget.settingsUI = 'settings.html';
        System.Gadget.onSettingsClosed = settingsClosed;
        $('.bus').hide();
        $('#direction').html('<span id="select-stop">Select Stop &rarr;</span>');
        $('#buses .bus:last').css('border','none');
    }        
}
function settingsClosed(event)
{
    if(event.closeAction == event.Action.commit){  
        $('#select-stop').remove();
        startTimer();
    }
}
function getTimes(route,stop){
    $('.bus').hide();
    $('#buses').append('<img id="spinner" src="images/spinner-black.gif"/>');
    cbt.getpredictions({rt:route, stpid:stop, top:4}, function(r){
        if (r.length > 0 ) {
            $('#route')
            .find('#direction').html(r[0].rtdir).end()
            .find('#number').html(r[0].rt).end()
            .find('#name').html(r[0].des);
            
            $.each(r, function(index, value){
                $('#buses .bus:nth-child('+(index+1)+')')
                .find('.eta').html(getPredictionText(value.prdtm)).end()
                .find('.stop').html(value.stpnm).end()
                .find('.bus-number').html(value.vid).end()
                .fadeIn();
            });
            now = new Date();
            $('#message').html('Last Update: '+now.toLocaleTimeString());
        } else {
            $('#message').html('No Predictions Available');
            stopTimer();
        }
        $('#spinner').remove();
    });
}
function getPredictionText(prediction){
    var now = new Date();
    return Math.ceil((prediction.getTime() - now.getTime()) / 1000 / 60 ) + "MIN";
}
function startTimer(){
    clearInterval(interval);
    currentUpdate=0;
    currentSecond=updateFrequencyInSeconds;
    $('#timer').html('<img src="images/spinner-white.gif"/>').click(function(){currentUpdate=numUpdatesBeforeSleep;currentSecond=updateFrequencyInSeconds});
    interval = setInterval(function(){tickTimer();},1000);
}
function tickTimer(){
    if(currentSecond >= updateFrequencyInSeconds){
        if(currentUpdate >= numUpdatesBeforeSleep){
            stopTimer();
            $('.bus').hide();
            $('#message').html('<a href="#">Start</a>').find('a').click(function(e){
                e.preventDefault();
                $(this).remove();
                startTimer();
            });
        }else{
            currentUpdate++;
            getTimes(System.Gadget.Settings.read('route'),System.Gadget.Settings.read('stop'));
            currentSecond=0;
        }
    }else{
        var nextUpdateMessage = '';
        if(currentUpdate != numUpdatesBeforeSleep){
            nextUpdateMessage = 'next update';
        }else{
            nextUpdateMessage = 'sleeping'
        }
        $('#signage *').attr('title','Update '+currentUpdate+' of '+numUpdatesBeforeSleep+'; '+nextUpdateMessage+' in '+(updateFrequencyInSeconds-currentSecond)+' seconds.');
    }
    currentSecond++;
}
function stopTimer(){
    clearInterval(interval);
    $('#signage *').removeAttr('title');
    $('#timer').empty();
}
