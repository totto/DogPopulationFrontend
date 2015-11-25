var NEO = (function($){
  
  var graphUrl = '/dogpopulation/pedigree/';
  var fictitiousGraphUrl = '/dogpopulation/pedigree/fictitious';
  var mapperUrl = '/dogid/find';
  var dogSearchUrl = 'http://dogsearch.nkk.no/dogservice/dogs/select';
  $.ajaxSetup({timeout: 30000});

  var maxstep = 5;
  var currentstep = 1;
  var fullAncestorCount = 0;
  var ancestorCount = 0;
  var ancestorids = [];

  var currentDog = {};

  var ajaxConf = {
    type:'GET',
    url: '',
    data: ''
  }

  var target = document.getElementById('graphcontainer');
  var $target = $('#graphcontainer');

  function renderData(data) {
    var html = createAncestry(data);
    $target.empty();
    target.appendChild(html);
    markReocurringAncestors();
    if(data.ids.RegNo) {
      $('#query').val(data.ids.RegNo);
    }
    getIdsFromDogSearch(data.uuid);
    $('#blanket').hide(350);
  }

  function showMsg(msg) {
    msg = msg || 'Fikk ikke kontakt med serveren.';
    var html = document.createElement('p');
    html.innerHTML = msg;
    target.innerHTML = '';
    target.appendChild(html);
    $('#blanket').hide(350);
  }

  function getFullAncestorCount(steps){
    var count = 0;
    for( var i = 1; i < steps; i ++) {
      count += Math.pow(2,i);
    }
    return count;
  }

  function createAncestry(data) {
    currentstep = 1;
    ancestorCount = 0;
    ancestorids = [];
    fullAncestorCount = getFullAncestorCount( maxstep );

    var div = document.createElement('div');

    var heading = document.createElement('h2');
    var a = document.createElement('a');
    a.innerHTML = data.name;
    a.href = "http://dogsearch.nkk.no/DogFrontend/?q=ids:" + data.uuid;
    heading.appendChild(a);
    
    var table = document.createElement('table');
    var details = [
      'Rase', (data.breed) ? '<a href="http://dogpopulation.nkk.no/ras/?breed='+data.breed.name+'&generations=6&minYear=2003&maxYear=2013">'+data.breed.name+'</a>' : 'ukjent',
      'Kjønn', (data.gender == 'female') ? 'Tispe' : (data.gender == 'male') ? 'Hannhund' : 'ukjent',
      'Født', data.born, 
      'ID-registreringer', '<span id="idlist">RegNo: ' + data.ids.RegNo + '</span>',
      'Innavlsgrad 3 ledd', data.inbreedingCoefficient3+'%',
      'Innavlsgrad 6 ledd', data.inbreedingCoefficient6+'%'
      //'UUID', data.uuid, 
      ];
    for( var d = 0; d < details.length; d++ ) {
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.innerHTML = details[d];
      var td = document.createElement('td');
      td.innerHTML = details[++d];
      tr.appendChild(th);
      tr.appendChild(td);
      table.appendChild(tr);
    }

    var img = document.createElement('img');
    img.className='dogpic';

    if( data.breed ) {
      testImage('http://web2.nkk.no/wp-content/uploads/2012/02/'+data.breed.name.replace(/\s+/g,'-')+'.jpg',function(url, status){
        if( status === 'success') {
          img.src=url;
        } else {
          testImage('http://web2.nkk.no/wp-content/uploads/2012/02/'+data.breed.name.replace(/\s+/g,'-')+'-'+data.breed.id+'.jpg',function(url, status){
            if( status === 'success') {
              img.src=url;
            } else {
              img.src='http://dogsearch.nkk.no/DogFrontend/img/NKK-logo.png';
            }
          });
        }
      });
    }

    div.appendChild(heading);
    div.appendChild(img);
    div.appendChild(table);
    div.className = 'dogcontainer';

    if( typeof data.ancestry !== 'undefined' && data.ancestry != null ) {
      div.appendChild( createAncestors(data.ancestry) )
    }

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'Slektstreets kompletthet'
    var td = document.createElement('td');
    var ancestryPercent = Math.round(1000*ancestorCount/fullAncestorCount)/10 + '%';
    td.innerHTML = ancestryPercent + ' komplett - ' 
      + ancestorCount + ' av ' + fullAncestorCount
      + '<div class="percentagecontainer"><div class="percentage" style="width:'+ancestryPercent+'"></div></div>';

    tr.appendChild(th);
    tr.appendChild(td);
    table.appendChild(tr);

    if( typeof data.offspring !== 'undefined' && data.offspring != null ) {
      div.appendChild( createOffspring(data.offspring) )
    }

    $('div.dog').popover();

    return div;
  }

  function createAncestors(data) {
    currentstep++;
    if( currentstep <= maxstep ) {
      var ul = document.createElement('ul');
      ul.className = 'pedigreelist';
      if( typeof data.father !== 'undefined' && data.father != null ) {
        var listclass = '';
        if (currentstep==2) listclass = 'father';
        ul.appendChild( createListItem(data.father, 'male', listclass) );
      } else {
        ul.appendChild( createMissingListItem('male') );
      }
      if( typeof data.mother !== 'undefined' && data.mother != null ) {
        var listclass = '';
        if (currentstep==2) listclass += ' mother';
        ul.appendChild( createListItem(data.mother, 'female', listclass) );
      } else {
        ul.appendChild( createMissingListItem('female') );
      }
    } else {
      var ul = document.createElement('span');
    }
    currentstep--;
    return ul;
  }

  function createListItem(data, className, liClassName) {
    
    ancestorCount++;
    
    var li = document.createElement('li');
    li.className = liClassName;
    
    var div = document.createElement('div');
    div.className = className + ' dog ' + data.uuid;
    div.title = data.uuid;

    if( data.ownAncestor ) {
      div.className += ' ownancestor';
    }

    var a = document.createElement('a');
    a.className = 'locallink';
    a.innerHTML = data.name;
    a.title = data.uuid;
    a.href = "#";
    div.appendChild(a);

    if(typeof data.ids.RegNo !== 'undefined') {
      div.innerHTML += '<br>'+data.ids.RegNo;
    }
    if(typeof data.born !== 'undefined' && data.born != null) {
      div.innerHTML += '<br>'+data.born;
    }
    if(typeof data.health !== 'undefined' && data.health != null) {
      div.innerHTML += '<br>HD: '+data.health.hdDiag+' ('+data.health.hdYear+')';
    }
    if(typeof data.inbreedingCoefficient3 !== 'undefined' && data.inbreedingCoefficient3 != null) {
      div.innerHTML += '<br>Innavl (3 ledd): '+data.inbreedingCoefficient3+'%';
    }
    if(typeof data.inbreedingCoefficient6 !== 'undefined' && data.inbreedingCoefficient6 != null) {
      div.innerHTML += '<br>Innavl (6 ledd): '+data.inbreedingCoefficient6+'%';
    }

      'Innavlsgrad 3 ledd', data.inbreedingCoefficient3+'%',
      'Innavlsgrad 6 ledd', data.inbreedingCoefficient6+'%'

    // TODO: Move this to a separate element and append it to the hovered item, to reduce DOM?
    var divpop = document.createElement('div');
    divpop.className = 'divpop';
    divpop.innerHTML = '<button data-toggle="modal" data-target="#dataErrorModal">Rapporter feil</button>';
    if( data.ownAncestor ) {
      divpop.innerHTML += '<br>Registrert som egen stamfar.';
    }
    div.appendChild(divpop);

    li.appendChild(div);
    
    if( typeof data.ancestry !== 'undefined' && data.ancestry != null ) {
      li.appendChild( createAncestors(data.ancestry) );
    } else {
      li.appendChild( createAncestors({}) );
    }

    // Checking for reoccurring ancestors
    if(ancestorids.indexOf(data.uuid)<0){
      ancestorids.push( data.uuid );
      ancestorids.push( 1 );
    } else {
      ancestorids[ancestorids.indexOf(data.uuid)+1]++;
    }

    return li;
  }

  function createMissingListItem(className) {
    
    var li = document.createElement('li');

    var div = document.createElement('div');
    div.innerHTML = 'Info mangler';

    var divpop = document.createElement('div');
    divpop.className = 'divpop';
    div.appendChild(divpop);

    divpop.innerHTML = '<button data-toggle="modal" data-target="#dataMissingModal">Legg til info</button>';
    
    div.className = className + ' dog missing';
    li.appendChild(div);
    return li;
  }

  function markReocurringAncestors() {
    var reoccurringNumber = 0;
    var palette = [
      'hsla(0, 90%, 40%, 1)',
      'hsla(30, 90%, 40%, 1)',
      'hsla(60, 90%, 40%, 1)',
      'hsla(90, 90%, 40%, 1)',
      'hsla(120, 90%, 40%, 1)',
      'hsla(150, 90%, 40%, 1)',
      'hsla(180, 90%, 40%, 1)',
      'hsla(210, 90%, 40%, 1)',
      'hsla(240, 90%, 40%, 1)',
      'hsla(270, 90%, 40%, 1)',
      'hsla(300, 90%, 40%, 1)',
      'hsla(330, 90%, 40%, 1)',
      'hsla(15, 60%, 60%, 1)',
      'hsla(45, 60%, 60%, 1)',
      'hsla(75, 60%, 60%, 1)',
      'hsla(105, 60%, 60%, 1)',
      'hsla(135, 60%, 60%, 1)',
      'hsla(165, 60%, 60%, 1)',
      'hsla(195, 60%, 60%, 1)',
      'hsla(225, 60%, 60%, 1)',
      'hsla(255, 60%, 60%, 1)',
      'hsla(285, 60%, 60%, 1)',
      'hsla(315, 60%, 60%, 1)',
      'hsla(345, 60%, 60%, 1)'
      ];
    console.log('Checking for reoccurring ancestors...');
    for(var i = ancestorids.length; i >= 0; i--) {
      if( typeof ancestorids[i] == 'number' && ancestorids[i] > 1 ) {
        reoccurringNumber++;
        var classref = 'div.'+ancestorids[i-1];
        var color = palette[palette.length-1];
        if(reoccurringNumber<palette.length) {
          color = palette[reoccurringNumber];
        }
        $(classref).addClass('duplicate').append('<span style="background-color:'+color+'">'+ancestorids[i]+'</span>');
      }
    }
    console.log('Found '+reoccurringNumber+' reoccuring ancestors.');
  }

  function createOffspring(offspring) {
    
    console.log('Creating offspring...', offspring);
    
    var div = document.createElement('div');
    var h3 = document.createElement('h3');
    h3.innerHTML = 'Avkom';
    div.appendChild(h3);

    for (var i = 0; i < offspring.length; i++) {
      var p = document.createElement('p');
      p.innerHTML = offspring[i].count + ' født: ' + offspring[i].born;
      div.appendChild(p);

      var ul = document.createElement('ul');
      for (var j = 0; j < offspring[i].puppies.length; j ++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.className = 'locallink';
        a.href = '#';
        a.title = offspring[i].puppies[j].id;
        a.innerHTML = offspring[i].puppies[j].name;
        li.appendChild(a);
        ul.appendChild(li);
      }
      div.appendChild(ul);
    }
    return div;
  }

  function isUuid(id) {
    var uuidRegex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    var result = uuidRegex.test(id);
    var statement = (result) ? '' : ' NOT';
    console.log('Testing UUID: '+id+' is'+statement+' a valid UUID.');
    return result;
  }

  function callServer() {
    $('#blanket').show(350);
    console.log('Calling server...');
    var queryId = $('#query').val();
    if( isUuid(queryId) ) {
      getGraph( queryId, {
        failure: function(graphLessId){
          getUuidFromMapper(graphLessId, {
            success: function(foundId){
              getGraph(foundId, {
                failure: function() {
                  getUuidFromDogSearch(mapperLessId, {
                    success: function(foundSearchId){
                      getGraph(foundSearchId, {
                        failure: function() {
                          console.log('Not found in Graph. Found new ID in Mapper. Not found in Graph. Found new ID in DogSearch. Not found in Graph.');
                          NEOREPORT.send('{error: "Could not find this id anywhere."}');
                        }
                      });
                    },
                    failure: function(searchLessId) {
                      console.log('Not found in Graph. Found new ID in Mapper. Not found in Graph. Not found in DogSearch.');
                      NEOREPORT.send('{error: "Could not find this id anywhere."}');
                    }
                  });
                }
              });
            }, 
            failure: function(mapperLessId) {
              getUuidFromDogSearch(mapperLessId, {
                success: getGraph,
                failure: function(searchLessId) {
                  console.log('Not found in Graph. Not found in Mapper. Not found in DogSearch.');
                  NEOREPORT.send('{error: "Could not find this id anywhere."}');
                }
              });
            }
          });
        }
      });
    } else {
      getUuidFromMapper( queryId, {
        success: function(foundId){
          getGraph(foundId,{
            failure: function(graphLessId){
              getUuidFromDogSearch(graphLessId, {
                failure: function(searchLessId) {
                  console.log('Found new ID in Mapper. Not found in Graph. Not found in DogSearch.');
                  NEOREPORT.send('{error: "Could not find this id anywhere."}');
                },
                success: function(foundId){
                  getGraph(foundId, {
                    failure: function(searchLessId) {
                      console.log('Found new ID in Mapper. Not found in Graph. Found new ID in DogSearch. Not found in Graph');
                      NEOREPORT.send('{error: "Could not find this id anywhere."}');
                    }
                  });
                }
              });
            }
          })
        },
        failure: function(mapperLessId){
          getUuidFromDogSearch(mapperLessId, {
            failure: function(searchLessId) {
              console.log('Not found in Mapper. Not found in DogSearch.');
              NEOREPORT.send('{error: "Not found (idNotFoundError)"}');
            },
            success: function(foundId){
              getGraph(foundId, {
                failure: function(searchLessId) {
                  console.log('Not found in Mapper. Found new ID in DogSearch. Not found in Graph.');
                  NEOREPORT.send('{error: "Not found (uuidNotFoundError)"}');
                }
              });
            }
          });
        }
      });
    }
  }

  function getUuidFromMapper(queryId, callbacks) {
    console.log('Getting UUID from DogIdMapper for id: ' + queryId);
    $.get( mapperUrl, { id: queryId }, function(data){
      if( typeof data.error == 'undefined' && data.dogids.length > 0 ) {
        var foundId = data.dogids[0].uuid;
        console.log('Looking up UUID returned: ' + foundId + '. Original ID was: ' + queryId);
        if(foundId != queryId) {
          callbacks.success( foundId );
        } else {
          console.log('Found UUID was the same as original ID.');
          callbacks.failure( foundId );
        }
      } else {
        console.log('Get UUID failed...');
        showMsg('Fant ingen hund med denne id-en.');
        callbacks.failure( queryId );
      }
    }).fail( function() {
      console.log('Lookup to DogIdMapper failed.');
      callbacks.failure( queryId );
    });
  }

  function getUuidFromDogSearch(queryId, callbacks) {
    console.log('Getting UUID from DogSearch for id: ' + queryId);
    $.ajax({
      type: 'get',
      url: dogSearchUrl,
      dataType: 'jsonp',
      jsonp: 'json.wrf',
      context: this,
      data: {
        'q':'ids:'+queryId,
        'wt':'json',
        'rows':1,
        'fl': 'id'
      }
    }).done(function( data ) {
      var docs = data.response.docs;
      try {
        var foundId = docs[0].id;
        if( foundId != queryId ) {
          callbacks.success( foundId );
        } else {
          callbacks.failure( queryId );
        }
      } catch(e) {
        callbacks.failure( queryId );
      }
    }).fail(function(){
      callbacks.failure( queryId );
    });
  }

  function getIdsFromDogSearch(queryId) {
    console.log('Getting ids with sources from DogSearch for id: ' + queryId);
    $.ajax({
      type: 'get',
      url: dogSearchUrl,
      dataType: 'jsonp',
      jsonp: 'json.wrf',
      context: this,
      data: {
        'q':'ids:'+queryId,
        'wt':'json',
        'rows':1,
        'fl': 'json_detailed'
      }
    }).done(function( data ) {
      if( data.response.docs.length > 0 ) {
        var dog = JSON.parse( data.response.docs[0].json_detailed );
        var html = '<table>';
        for( var i = 0; i<dog.ids.length; i++) {
          var type = dog.ids[i].type || '';
          var value = dog.ids[i].value || '';
          var source = (typeof dog.ids[i].source !== 'undefined') ? '('+dog.ids[i].source+')' : '';
          html += '<tr><td>'+type+'</td><td>'+value+'</td><td>'+source+'</td></tr>';
        }
        html += '</table>';
        $('#idlist').html( html );
      } else {
        console.log('DogSearch did not return any dogs when searching for id: ' + queryId);
      }
    });
  }

  function getGraph(uuid, callbacks) {
    console.log('Getting graph for UUID '+uuid);
    $.get( graphUrl+uuid, function(data){
      currentDog = data;
      renderData( data );
    }).fail( function() {
      console.log('No graph for ' + uuid);
      callbacks.failure( uuid );
    });
  }

  function callFictitiousServer() {
    
    console.log('Call server for fictitious pedigree...');
    
    $('#blanket').show(350);

    var queryId = $('#query').val();
    var queryIdChecked = false;

    $.get( mapperUrl, { id: queryId }).always( function(data){
      if( typeof data.error == 'undefined' && data.dogids.length>0 ) {
        if( typeof data.dogids[0].uuid !== 'undefined' ) {
          queryId = data.dogids[0].uuid;
        }
      }
      queryIdChecked = true;
      if(mateIdsChecked.indexOf(false)<0 && queryIdChecked){
        getFictitiousGraph( queryId, mateIds );
      }
    })

    var mateIds = $('#mateIds').val().split(';');
    var mateIdsChecked = [];
    
    for(var i=0;i<mateIds.length;i++){
      mateIdsChecked.push(false);
    }
    
    for(var j=0;j<mateIds.length;j++){
      $.ajax( mapperUrl, {
        index: j,
        data: { id: mateIds[j] }
      }).always( function(data){
        if( typeof data.error == 'undefined' && data.dogids.length>0 ) {
          if( typeof data.dogids[0].uuid !== 'undefined' ) {
            mateIds[this.index] = data.dogids[0].uuid;
          }
        }
        mateIdsChecked[this.index] = true;
        if(mateIdsChecked.indexOf(false)<0 && queryIdChecked){
          getFictitiousGraph( queryId, mateIds );
        }
      });
    }

  }

  function getFictitiousGraph(queryId, mateIds) {
    
    var data = {};
    var dogParentType = (currentDog.gender=='male') ? 'father' : 'mother';
    var dogParentTypeOpposite = (currentDog.gender=='male') ? 'mother' : 'father';
    data[dogParentType] = queryId;
    data[dogParentTypeOpposite] = mateIds;

    var settings = {
      traditional: true,
      data: data
    };
    $.ajax( fictitiousGraphUrl, settings)
    .success( function(data){
      data.name = 'Fiktiv hund';
      renderData(data);
    })
    .fail( function() {
      showMsg();
    })
  }

  function init() {
    bindEvents();
    initData();
  }

  function initData() {
    var urlVars = getUrlVars();
    if( urlVars ) {
      if( typeof urlVars['query'] !== 'undefined' ) {
        $('#query').val(urlVars['query']);
      }
      if( typeof urlVars['mateIds'] !== 'undefined' ) {
        $('#mateIds').val(urlVars['mateIds']);
      }
    }
    if( urlVars.mateIds ) {
      callFictitiousServer();
    } else {
      callServer(); 
    }
  }

  function bindEvents() {

    $('#searchForm').submit( function(e) {
      e.preventDefault();
      callServer();
      updateUrl();
    });

    $('#fictitiousForm').submit( function(e) {
      e.preventDefault();
      callFictitiousServer();
      updateUrl( {fictitious: true} );
    });

    $g = $('#generations');
    maxstep = $g.val();
    $g.change( function() {
      maxstep = $(this).val();
    });

    $(document).on('click', '.locallink', function(e) {
      $('#query').val(this.title);
      callServer();
      updateUrl();
      e.preventDefault();
    });

    $(document).on('mouseenter', '.male, .female', function(e) {
      if( this.title ) $('.'+this.title).addClass('hover');
    });
    $(document).on('mouseleave', '.male, .female', function(e) {
      if( this.title ) $('.'+this.title).removeClass('hover');
    });

    window.onpopstate = function(event) {
      console.log('State popped');
      initData();
    };

  }

  function updateUrl(options) {
    options = options || {};
    console.log('Updated url and pushed state');
    if( window.history.replaceState ) {
      var newurl = location.origin + location.pathname;

      var urlData = [];
      urlData.push( 'query=' + $('#query').val() );

      if(options.fictitious){
        urlData.push( 'mateIds=' + $('#mateIds').val() );
      }

      newurl += "?" + urlData.join('&'); //+ urlData.join("&");
      window.history.pushState({}, "title", newurl);
    } else {
      console.log('IE9 does not support history-manipulation through replaceState().');
    }
  }


  function getUrlVars() {
    if(location.href.indexOf('?')>-1) {
      var vars = {}, hash;
      var hashes = location.href.slice(location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        if( vars[hash[0]] ) {
          vars[hash[0]].push(hash[1]);
        } else {
          vars[hash[0]] = [hash[1]];
        }
      }
      return vars;
    }
    return false;
  }


  function testImage(url, callback, timeout) {
      timeout = timeout || 5000;
      var timedOut = false, timer;
      var img = new Image();
      img.onerror = img.onabort = function() {
          if (!timedOut) {
              clearTimeout(timer);
              callback(url, "error");
          }
      };
      img.onload = function() {
          if (!timedOut) {
              clearTimeout(timer);
              callback(url, "success");
          }
      };
      img.src = url;
      timer = setTimeout(function() {
          timedOut = true;
          callback(url, "timeout");
      }, timeout); 
  }

  return {
    init: init,
    callServer: callServer,
    renderData: renderData,
    isUuid: isUuid
  };

}($));

NEO.init();