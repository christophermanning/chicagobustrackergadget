var cbt = $.ctabustracker(CBTAPIKEY);
$(function(){    
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
});

System.Gadget.onSettingsClosing = function(event)
{
    if (event.closeAction == event.Action.commit){
        var formRoute = $('#formRoute');
        var direction = formDirection.value;
        var formStop = $('#formStop');
        if(formRoute.val() != '' && direction != '' && formStop.val() != ''){
            System.Gadget.Settings.write("route", formRoute.val());
            System.Gadget.Settings.write("direction", direction);
            System.Gadget.Settings.write("stop", formStop.val());

            routeDescription = $(':selected', formRoute).text().split(' - ');
            System.Gadget.Settings.write("rtnum", routeDescription[0]);
            System.Gadget.Settings.write("stname", $(':selected', formStop).text());
        }else{
            event.cancel = true;
        }
    }
}
function loadFormRoute(selectedRoute)
{
    $('#formRoute').after('<img id="spinner" src="images/spinner-black.gif"/>');
    formRoute.options[0] = new Option('Select Route', '', false, false);
    cbt.getroutes({}, function(routes){
        $.each(routes, function(index, value) { 
          formRoute.options[index+1] = new Option(value.rt+' - '+value.rtnm,value.rt,false,(selectedRoute==value.rt));
        });
        $('#spinner').remove();
    });
}
function loadFormDirection(route,selectedDirection)
{
    $('#formRoute').after('<img id="spinner" src="images/spinner-black.gif"/>');
    
    $('#stop').fadeOut('fast',function(){
        $('#direction').fadeOut('fast',function(){
        cbt.getdirections({rt:route}, function(directions){
            $(formDirection).find('option').remove();
            formDirection.options[0] = new Option('Select Direction', '', false, false);
            $.each(directions, function(index, value) { 
                formDirection.options[index+1] = new Option(value,value,false,(selectedDirection==value));
            });
            $('#spinner').remove();
            $('#direction').fadeIn('fast');
            $('#formRoute').removeAttr('disabled');
        });
    });});
}
function loadFormStop(route,direction,selectedStop)
{
    $('#formDirection').after('<img id="spinner" src="images/spinner-black.gif"/>');
    $('#stop').fadeOut('fast',function(){
        cbt.getstops({rt:route, dir:direction}, function(stops){
            $(formStop).find('option').remove();
            formStop.options[0] = new Option('Select Stop', '', false, false);
            $.each(stops, function(index, value) { 
                formStop.options[index+1] = new Option(value.stpnm.replace(/&amp;/g,'&'),value.stpid,false,(selectedStop==value.stpid));
            });
            $('#spinner').remove();
            $('#stop').fadeIn('fast');
            $('#formDirection').removeAttr('disabled');
        });
    });
}