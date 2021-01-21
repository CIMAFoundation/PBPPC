/* A polyfill for browsers that don't support ligatures. */
/* The script tag referring to this file must be placed before the ending body tag. */

/* To provide support for elements dynamically added, this script adds
   method 'icomoonLiga' to the window object. You can pass element references to this method.
*/
(function () {
    'use strict';
    function supportsProperty(p) {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
            i,
            div = document.createElement('div'),
            ret = p in div.style;
        if (!ret) {
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (i = 0; i < prefixes.length; i += 1) {
                ret = prefixes[i] + p in div.style;
                if (ret) {
                    break;
                }
            }
        }
        return ret;
    }
    var icons;
    if (!supportsProperty('fontFeatureSettings')) {
        icons = {
            'accoglienza': '&#xe900;',
            'aziendeagricole': '&#xe901;',
            'enogastronomia2': '&#xe902;',
            'fauna2': '&#xe903;',
            'flora2': '&#xe904;',
            'geologiatematica2': '&#xe905;',
            'manifestazionioni2': '&#xe906;',
            'prodottiTipici': '&#xe907;',
            'sportout2': '&#xe908;',
            'storia': '&#xe909;',
            'bnb3': '&#xe90a;',
            'tradizionireligiose2': '&#xe90b;',
            'accoglienza_altro2': '&#xe90c;',
            'accoglienzaP2': '&#xe90d;',
            'agriturismi': '&#xe90e;',
            'alberghi': '&#xe90f;',
            'albericentenari': '&#xe910;',
            'alberimonumentali2': '&#xe911;',
            'altrevoce_artimestieri': '&#xe912;',
            'altrevoce_tradculturali': '&#xe913;',
            'altrevoce_tradrurali': '&#xe914;',
            'altrevociP': '&#xe915;',
            'avifauna': '&#xe916;',
            'aziendeagricole_olivicole': '&#xe917;',
            'aziendeagricole_orto': '&#xe918;',
            'aziendeagricole_zootecniche': '&#xe919;',
            'aziendeagricoleP': '&#xe91a;',
            'bnb2': '&#xe91b;',
            'campeggi2': '&#xe91c;',
            'endemismivegetali2': '&#xe91d;',
            'falesie': '&#xe91e;',
            'fauna_mamiferi': '&#xe91f;',
            'faunaminore2': '&#xe920;',
            'faunaP2': '&#xe921;',
            'floraP2': '&#xe922;',
            'formazioniarboree2': '&#xe923;',
            'formazioniarbustive': '&#xe924;',
            'funghitartufi2': '&#xe925;',
            'geologia_formparticolari2': '&#xe926;',
            'geologiaP2': '&#xe927;',
            'grotta2': '&#xe928;',
            'manifestazioniculturali2': '&#xe929;',
            'manifestazioniP': '&#xe92a;',
            'pesci': '&#xe92b;',
            'piantearomatiche2': '&#xe92c;',
            'prodottisottobosco': '&#xe92d;',
            'prodottitipici': '&#xe92e;',
            'prodtipici_antichecultivar': '&#xe92f;',
            'restaurant2': '&#xe930;',
            'rettili': '&#xe931;',
            'sport_aerolmodellismo2': '&#xe932;',
            'sport_bike2': '&#xe933;',
            'sport_canoing2': '&#xe934;',
            'sport_climbing': '&#xe935;',
            'sport_deltaplano': '&#xe936;',
            'sport_horsetrek': '&#xe937;',
            'sport_pesca': '&#xe938;',
            'sport_treking2': '&#xe939;',
            'sport_vela2': '&#xe93a;',
            'sportdimenticati2': '&#xe93b;',
            'spotoutdoorP2': '&#xe93c;',
            'storiaP2': '&#xe93d;',
            'tradizionienogastronomiche': '&#xe93e;',
            'tradizionimusicali': '&#xe93f;',
            'tradizionisportive': '&#xe940;',
          '0': 0
        };
        delete icons['0'];
        window.icomoonLiga = function (els) {
            var classes,
                el,
                i,
                innerHTML,
                key;
            els = els || document.getElementsByTagName('*');
            if (!els.length) {
                els = [els];
            }
            for (i = 0; ; i += 1) {
                el = els[i];
                if (!el) {
                    break;
                }
                classes = el.className;
                if (/gal-icons-/.test(classes)) {
                    innerHTML = el.innerHTML;
                    if (innerHTML && innerHTML.length > 1) {
                        for (key in icons) {
                            if (icons.hasOwnProperty(key)) {
                                innerHTML = innerHTML.replace(new RegExp(key, 'g'), icons[key]);
                            }
                        }
                        el.innerHTML = innerHTML;
                    }
                }
            }
        };
        window.icomoonLiga();
    }
}());
