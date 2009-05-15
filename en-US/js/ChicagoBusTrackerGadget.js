var interval;var updates = 0;document.onreadystatechange = function()
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
    if(event.closeAction == event.Action.commit){          $('#select-stop').remove();        startTimer();
    }
}
function getTimes(route,stop){
    $('.bus').hide();
    $('#buses').append('<img id="spinner" src="images/spinner-black.gif"/>');    $.ajax({
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
                    $('#buses .bus:nth-child('+(i+1)+')')
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
                $('#message').html('As of '+hours+':'+(minutes<10?'0'+minutes:minutes)+' '+tag);
                    tickTimer();
            }else{
                $('#message').html($('stop noPredictionMessage',xml).text());
                stopTimer();
            }
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){           
            $('#message').html('Error '+textStatus);
            stopTimer();
        },
        complete:function(XMLHttpRequest, textStatus){
            $('#spinner').remove();
        }
    });
}
function getPredictionText(prediction){
    var text;
    if(prediction.indexOf('MIN') != -1){
        text = prediction.replace(/ min/i,'<span class="unit">MIN</span>');
    }else if(prediction.indexOf('APPROACHING') != -1){
        text = 'NOW';
    }else{
        text = prediction;
    }
    
    return text;
}function startTimer(){    clearInterval(interval);    getTimes(System.Gadget.Settings.read('route'),System.Gadget.Settings.read('stop'));    $('#timer').html('<img src="images/spinner-white.gif"/>');    interval = setInterval(function(){getTimes(System.Gadget.Settings.read('route'),System.Gadget.Settings.read('stop'));},60000);}function tickTimer(){    if(updates >= 10){        stopTimer();
        $('.bus').hide();        $('#signage #route').fadeTo('fast', .5);        $('#message').html('<a href="#">Refresh</a>').find('a').click(function(e){            e.preventDefault();            $(this).remove();
            $('#signage #route').fadeTo('fast', 100);            startTimer();        });    }else{        updates++;    }}function stopTimer(){    updates=0;    clearInterval(interval);    $('#timer').html('');}