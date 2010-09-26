var numUpdatesBeforeSleep = 10;
var updateFrequencyInSeconds = 60;
var interval;
var currentUpdate = 0;
var currentSecond = 0;
var cbt = $.ctabustracker(CBTAPIKEY);
$(function(){
    System.Gadget.settingsUI = 'settings.html';
    System.Gadget.onSettingsClosed = settingsClosed;
    $('.bus').hide();
    $('#direction').html('<span id="select-stop">Select Stop &rarr;</span>');
    $('#buses .bus:last').css('border','none');
    $('.start').click(function(e){
        e.preventDefault();
        startTimer();
    });
});
function settingsClosed(event)
{
    if(event.closeAction == event.Action.commit){  
        $('#select-stop').remove();
        startTimer();
    }
}
function getTimes(route, stop, stname, rtdir, rtnum){
    $('.bus').hide();
    $('#buses').append('<img id="spinner" src="images/spinner-black.gif"/>');
    cbt.getpredictions({rt:route, stpid:stop, top:4}, function(r, error){
        $('#route')
            .find('#direction').html(rtdir).end()
            .find('#number').html(rtnum).end()
            .find('#name').html(stname);
            
        if (error == false && r.length > 0 ) {
            $.each(r, function(index, value){
                $('#buses .bus:nth-child('+(index+1)+')')
                .find('.eta').html(getPredictionText(value.prdtm)).end()
                .find('.stop').html(value.des).end()
                .find('.bus-number').html(value.vid).end()
                .fadeIn();
            });
        } else {
            $('#buses .bus:first')
                .find('.eta').html('?').end()
                .find('.stop').html('No Predictions Available').end()
                .find('.bus-number').html(error).end()
                .fadeIn();
        }
        now = new Date();
        $('#message').html('As of '+now.toLocaleTimeString());
        $('#spinner').remove();
    });
}
function getPredictionText(prediction){
    var now = new Date();
    result = Math.floor((prediction.getTime() - now.getTime()) / 1000 / 60 );
    return result <= 0 ? 'NOW' : result + '<span class="unit">MIN</span>';
}
function startTimer(){
    clearInterval(interval);
    currentUpdate=0;
    currentSecond=updateFrequencyInSeconds;
    $('#paused').fadeOut();
    $('#timer').html('<img src="images/spinner-white.gif"/>').click(function(){stopTimer()});
    interval = setInterval(function(){tickTimer();},1000);
}
function tickTimer(){
    if(currentSecond >= updateFrequencyInSeconds){
        if(currentUpdate >= numUpdatesBeforeSleep){
            stopTimer();
        }else{
            currentUpdate++;
            getTimes(
                System.Gadget.Settings.read('route'),
                System.Gadget.Settings.read('stop'), 
                System.Gadget.Settings.read('stname'), 
                System.Gadget.Settings.read('direction'), 
                System.Gadget.Settings.read('rtnum')
            );
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
    $('.bus').hide();
    $('#paused').fadeIn();
    $('#signage *').removeAttr('title');
    $('#timer').empty();
    $('#message').html('');
}
