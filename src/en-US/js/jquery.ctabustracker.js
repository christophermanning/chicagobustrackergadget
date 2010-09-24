/*!
* jQuery CTA BusTracker API Plugin v1.0
* http://christophermanning.org/projects/chicago-bus-tracker-gadget
* 
* Javascript wrapper for:
* http://www.transitchicago.com/developers/bustracker.aspx
*
* Copyright (c) 2010 Christopher Manning.  All rights reserved.
* 
* Licensed under the University of Illinois/NCSA Open Source License
* http://www.christophermanning.org/license.txt
*/

(function( $ ){
    $.ctabustracker = function( apiKey ) {
        //{}
        this.gettime = function( params, callback ) {
            fetch("gettime", params, function(xml) {
                $('bustime-response tm', xml).each(function(i) {
                    callback(toDate($(this).text()));
                });
            });
        }
        
        //{vid:vehicleIds, rt:routeDesignators}
        this.getvehicles = function( params, callback ) {
            fetch("getvehicles", params, function(xml) {
                var result = new Array();
                $('bustime-response vehicle', xml).each(function(i) {
                    result[i] = {
                        vid    : $('vid', this).text(),
                        tmstmp : toDate($('tmstmp', this).text()),
                        lat    : $('lat', this).text(),
                        lon    : $('lon', this).text(),
                        hdg    : $('hdg', this).text(),
                        pid    : $('pid', this).text(),
                        pdist  : $('pdist', this).text(),
                        rt     : $('rt', this).text(),
                        des    : $('des', this).text()
                    }
                });
                
                callback(result);
            });
        }
        
        //{}
        this.getroutes = function( params, callback ) {
            fetch("getroutes", params, function(xml) {
                var result = new Array();
                $('bustime-response route', xml).each(function(i) {
                    result[i] = {
                        rt   : $('rt', this).text(),
                        rtnm : $('rtnm', this).text()
                    }
                });
                
                callback(result);
            }); 
        }
        
        //{rt:routeDesignator}
        this.getdirections = function( params, callback ) {
            fetch("getdirections", params, function(xml) {
                callback(
                    $('bustime-response dir', xml).map(function() {
                        return $(this).text();
                    }).get()
                )
            }); 
        }
        
        //{rt:routeDesignator, dir:direction}
        this.getstops = function( params, callback ) {
            fetch("getstops", params, function(xml) {
                var result = new Array();
                $('bustime-response stop', xml).each(function(i) {
                    result[i] = {
                        stpid : $('stpid', this).text(), 
                        stpnm : $('stpnm', this).text(),
                        lat   : $('lat', this).text(),
                        lon   : $('lon', this).text()
                    }
                });
                
                callback(result);
            }); 
        }
        
        //{pid:paramspatternIds, rt:routeDesignator}
        this.getpatterns = function( params, callback ) {
            fetch("getpatterns", params, function(xml) {
                var result = new Array();
                $('bustime-response ptr', xml).each(function(i) {
                    result[i] = {
                        pid   : $('pid', this).text(),
                        ln    : $('ln', this).text(),
                        rtdir : $('rtdir', this).text(),
                        pt    : {
                            seq   : $('seq', this).text(),
                            typ   : $('typ', this).text(),
                            stpid : $('stpid', this).text(),
                            stpnm : $('stpnm', this).text(),
                            pdist : $('pdist', this).text(),
                            lat   : $('lat', this).text(),
                            lon   : $('lon', this).text()
                        }
                    }
                });
                
                callback(result);
            });
        }
        
        //{stpid:stopIds, rt:routeDesignators, vid:vehicleIds, top:maxResults}
        this.getpredictions = function( params, callback ) {
            fetch("getpredictions", params, function(xml) {
                var result = new Array();
                $('bustime-response prd', xml).each(function(i) {
                    result[i] = {
                        tmstmp : toDate($('tmstmp', this).text()),
                        typ    : $('typ', this).text(),
                        stpid  : $('stpid', this).text(),
                        stpnm  : $('stpnm', this).text(),
                        vid    : $('vid', this).text(),
                        dstp   : $('dstp', this).text(),
                        rt     : $('rt', this).text(),
                        rtdir  : $('rtdir', this).text(),
                        des    : $('des', this).text(),
                        prdtm  : toDate($('prdtm', this).text()),
                        dly    : $('dly', this).text()
                    }
                });
                
                callback(result);
            });
        }
        
        //{rt:routeDesignators, rtdir:direction, stpid:stopIds}
        this.getservicebulletins = function( params, callback ) {
            fetch("getservicebulletins", params, function(xml) {
                var result = new Array();
                $('bustime-response sb', xml).each(function(i) {
                    result[i] = {
                        nm   : $('nm', this).text(),
                        sbj  : $('sbj', this).text(),
                        dtl  : $('dtl', this).text(),
                        brf  : $('brf', this).text(),
                        prty : $('prty', this).text(),
                        srvc : {
                            rt    : $('srvc rt', this).text(),
                            rtdir : $('srvc rtdir', this).text(),
                            stpid : $('srvc stpid', this).text(),
                            stpnm : $('srvc stpnm', this).text()
                        }
                    }
                });
                
                callback(result);
            });
        }
        
        var apiKey = apiKey;
        
        var fetch = function(endpoint, params, callback) {
            $.get('http://www.ctabustracker.com/bustime/api/v1/' + endpoint, $.extend({key:apiKey}, params), function(xml) {
                var pass = true;
                $('bustime-response error msg', xml).each(function(i) {
                    alert(endpoint+':'+$(this).text());
                    pass = false;
                });
                if (pass) {
                    callback(xml);
                }
            }, 'xml');
        }
        
        var toDate = function(timestamp) {
            d = timestamp;
            return new Date(d.substr(0,4), (d.substr(4,2)-1), d.substr(6,2), d.substr(9,2), d.substr(12,2), d.substr(15,2));
        }
        
        return this;
    };
})( jQuery );
