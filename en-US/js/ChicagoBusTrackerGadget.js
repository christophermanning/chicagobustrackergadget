var numUpdatesBeforeSleep = 10;
var updateFrequencyInSeconds = 60;
var interval;
var currentUpdate = 0;
var currentSecond = 0;
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
        text = prediction.replace(/ min/i,'<span class="unit">MIN</span>').replace(/less than /i,'<');
    }else if(prediction.indexOf('APPROACHING') != -1){
        text = 'NOW';
    }else{
        text = prediction;
    }
    return text;
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
