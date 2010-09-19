document.onreadystatechange = function()
{    
    if(document.readyState=="complete"){
        var savedRoute = System.Gadget.Settings.read("route");
        var savedDirection = System.Gadget.Settings.read("direction");
        var savedStop = System.Gadget.Settings.read("stop");
        
        if(savedRoute != '' && savedDirection != '' && savedStop != ''){
            loadFormRoute(savedRoute);
            loadFormDirection(savedRoute,savedDirection);
            loadFormStop(savedRoute,savedDirection,savedStop);
        }else{
            $('#stop').hide();
            $('#direction').hide();
            loadFormRoute('');
        }
        $('#formRoute').change(function(){
            if($('#formRoute').val()){
                $(this).attr('disabled',true);
                loadFormDirection($('#formRoute').val(),'');
            }
        });
        $('#formDirection').change(function(){
            if($('#formRoute').val() && $('#formDirection').val()){
                $(this).attr('disabled',true);
                loadFormStop($('#formRoute').val(),$('#formDirection').val(),'');
            }
        });
    }        
}
System.Gadget.onSettingsClosing = function(event)
{
    if (event.closeAction == event.Action.commit){
        var route = formRoute.value;
        var direction = formDirection.value;
        var stop = formStop.value;
        if(route != '' && direction != '' && stop != ''){
            System.Gadget.Settings.write("route", route);
            System.Gadget.Settings.write("direction", direction);
            System.Gadget.Settings.write("stop", stop);
        }else{
            event.cancel = true;
        }
    }
}
function loadFormRoute(selectedRoute)
{
    $('#formRoute').after('<img id="spinner" src="images/spinner-black.gif"/>');
    formRoute.options[0] = new Option('Select Route', '', false, false);
    $.get('http://chicago.transitapi.com/bustime/eta/routeDirectionStopAsXML.jsp',null,function(xml){
        $('route',xml).each(function(i){
            formRoute.options[i+1] = new Option($(this).attr('designator')+' - '+$(this).attr('name'),$(this).attr('designator'),false,(selectedRoute==$(this).attr('designator')));
        });
        $('#spinner').remove();
        
    },'xml');
}
function loadFormDirection(route,selectedDirection)
{
    $('#formRoute').after('<img id="spinner" src="images/spinner-black.gif"/>');
    $('#stop').fadeOut('fast',function(){$('#direction').fadeOut('fast',function(){
        $.get('http://chicago.transitapi.com/bustime/eta/routeDirectionStopAsXML.jsp',{route:route},function(xml){
            $(formDirection).find('option').remove();
            formDirection.options[0] = new Option('Select Direction', '', false, false);
            $('direction',xml).each(function(i){
                formDirection.options[i+1] = new Option($(this).attr('name'),$(this).attr('name'),false,(selectedDirection==$(this).attr('name')));
            });
            $('#spinner').remove();
            $('#direction').fadeIn('fast');
            $('#formRoute').removeAttr('disabled');
        },'xml');
    });});
}
function loadFormStop(route,direction,selectedStop)
{
    $('#formDirection').after('<img id="spinner" src="images/spinner-black.gif"/>');
    $('#stop').fadeOut('fast',function(){
        $.get('http://chicago.transitapi.com/bustime/eta/routeDirectionStopAsXML.jsp',{route:route,direction:direction},function(xml){
            $(formStop).find('option').remove();
            formStop.options[0] = new Option('Select Stop', '', false, false);
            $('stop',xml).each(function(i){
                formStop.options[i+1] = new Option($(this).attr('name').replace(/&amp;/g,'&'),$(this).attr('id'),false,(selectedStop==$(this).attr('id')));
            });
            $('#spinner').remove();
            $('#stop').fadeIn('fast');
            $('#formDirection').removeAttr('disabled');
        },'xml');
    });
}