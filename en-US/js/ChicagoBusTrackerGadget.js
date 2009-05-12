var interval;var updates = 0;document.onreadystatechange = function()
{    
    if(document.readyState=='complete'){
        System.Gadget.settingsUI = 'settings.html';
        System.Gadget.onSettingsClosed = settingsClosed;
        System.Gadget.onUndock = resizeGadget;
        System.Gadget.onDock = resizeGadget;
        $('.bus').hide();
        $('#message').html('Select A Route');
        $('#buses .bus:last').css('border','none');
    }        
}
function resizeGadget()
{
    mainBody.style.height = 210;
    mainBody.style.width = 200;
}
function settingsClosed(event)
{
    if(event.closeAction == event.Action.commit){          startTimer();
    }
}
function getTimes(route,stop){
    $('.bus').hide();
    $('#buses').append('<img id="spinner" src="images/spinner-black.gif"/>');
    $.ajax({
        url:'http://chicago.transitapi.com/bustime/map/getStopPredictions.jsp',
        data:{stop:stop,route:route},
        cache:false,
        dataType:'xml',
        success:function(xml){
            $('#route')
            .find('#direction').html($('stop sri d',xml).text()).end()
            .find('#number').html($('stop sri rt',xml).text()).end()
            .find('#name').html($('stop nm',xml).text());
            if($('noPredictionMessage',xml).length == 0){
                $('pre',xml).each(function(i){
                    $('#buses .bus:nth-child('+i+')')
                    .find('.eta').html(getPredictionText($(this).find('pt').text())).end()
                    .find('.stop').html($(this).find('fd').text()).end()
                    .find('.bus-number').html($(this).find('v').text()).end()
                    .fadeIn();
                });
                var curtime = new Date();
                var hours = curtime.getHours();
                var minutes = curtime.getMinutes();
                if (hours > 12) {
                    hours = hours - 12;
                    tag = 'PM';
                }else{
                    tag = 'AM'
                }
                $('#message').html('As of '+(hours<10?'0'+hours:hours)+':'+(minutes<10?'0'+minutes:minutes)+' '+tag);
                    tickTimer();
            }else{
                $('#message').html('Unable To Predict Stops');
                stopTimer();
            }
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){           
            $('#message').html('Error '+textStatus);
            stopTimer();
        }
    });
    $('#spinner').remove();
}
function getPredictionText(prediction){
    var text;
    if(prediction.indexOf('MIN')){
        text = prediction.replace(/ min/i,'<span class="unit">MIN</span>');
    }else if(prediction.indexOf('APPROACHING')){
        text = 'NOW';
    }else{
        text = 'UNKNOWN';
    }
    
    return text;
}function startTimer(){    clearInterval(interval);    getTimes(System.Gadget.Settings.read('route'),System.Gadget.Settings.read('stop'));    $('#timer').html('<img src="images/spinner-white.gif"/>');    interval = setInterval(function(){getTimes(System.Gadget.Settings.read('route'),System.Gadget.Settings.read('stop'));},90000);}function tickTimer(){    if(updates > 10){        stopTimer();        $('#signage *:not(a)').fadeTo('slow', .5, function(){$(this).removeAttr('filter');});        $('#message').html('<a href="#">Refresh</a>').find('a').click(function(e){            e.preventDefault();            $(this).remove();
            $('#signage *').fadeTo('slow', 100, function(){$(this).removeAttr('filter');});            startTimer();        });    }else{        updates++;    }}function stopTimer(){    updates=0;    clearInterval(interval);    $('#timer').html('');}