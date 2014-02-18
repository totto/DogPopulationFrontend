var testdog = {
                name: 'Fido',
                breed: 'Grand Danois',
                id: 1,
                inbreedingcoefficient: 0,
                ancestry: {
                  father: {
                    name: 'Father',
                    id: 2,
                    breed: {},
                    inbreedingcoefficient: 0,
                    ancestry: {
                      father: {
                        name: 'FatherFather',
                        id: 3,
                        breed: {},
                        inbreedingcoefficient: 0,
                        ancestry: {
                          father: {
                            name: 'test',
                            ancestry: {
                              mother: {
                                name: 'testmother',
                                ancestry: {
                                  father: {
                                    name: 'ladeio'
                                  }
                                }
                              }
                            }
                          },
                          mother: {
                            name: 'laksjdljasd',
                            ancestry: {}
                          }
                        }
                      },
                      mother: {
                        name: 'FatherMother',
                        id: 3,
                        breed: {},
                        inbreedingcoefficient: 0,
                        ancestry: {
                          father: {
                            name: 'test',
                            ancestry: {
                              mother: {
                                name: 'testmother',
                                ancestry: {
                                  father: {
                                    name: 'ladeio'
                                  }
                                }
                              }
                            }
                          },
                          mother: {
                            name: 'laksjdljasd',
                            ancestry: {}
                          }
                        }
                      }
                    }
                  },
                  mother: {
                    name: 'Mother',
                    id: 2,
                    breed: {},
                    inbreedingcoefficient: 0,
                    ancestry: {
                      father: {
                        name: 'MotherFather',
                        id: 3,
                        breed: {},
                        inbreedingcoefficient: 0,
                        ancestry: {
                          father: {
                            name: 'MotherFatherFather',
                            id: 3,
                            breed: {},
                            inbreedingcoefficient: 0
                          },
                          mother: {
                            name: 'MotherFatherMother',
                            id: 3
                          }
                        }
                      },
                      mother: {
                        name: 'MotherMother',
                        id: 3,
                        ancestry: {
                          mother: {
                            name: 'lol',
                            ancestry: {
                              father: {
                                name: 'lloa',
                                ancestry: null
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                offspring: [
                  {
                    born: '2012-04-07',
                    count: 2,
                    id: '123267',
                    puppies: [
                      {
                        breed: {},
                        id: '123',
                        name: 'Offspring 1'
                      },
                      {
                        breed: {},
                        id: '1234',
                        name: 'Offspring 2'
                      }
                    ]
                  },
                  {
                    born: '2011-04-07',
                    count: 1,
                    id: '123266',
                    puppies: [
                      {
                        breed: {},
                        id: '123',
                        name: 'Offspring 0'
                      }
                    ]
                  }
                ]
              };

var NEO = (function($){
  
  var graphUrl = '/dogpopulation/pedigree/';
  var mapperUrl = '/test/dogid/find';

  var maxstep = 5;
  var currentstep = 1;
  var fullAncestorCount = 0;
  var ancestorCount = 0;
  var ancestorids = [];

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
  }

  function showFailMsg(msg) {
    msg = msg || 'Fikk ikke kontakt med serveren.';
    var html = document.createElement('p');
    html.innerHTML = msg;
    target.innerHTML = '';
    target.appendChild(html);
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
      'Rase', data.breed.name,
      'Født', data.born, 
      'RegNo', data.ids.RegNo,
      'Innavlsgrad 3 ledd', data.inbreedingCoefficient3/100+'%',
      'Innavlsgrad 6 ledd', data.inbreedingCoefficient6/100+'%'
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
        ul.appendChild( createListItem(data.father, 'male') );
      } else {
        ul.appendChild( createMissingListItem('male') );
      }
      if( typeof data.mother !== 'undefined' && data.mother != null ) {
        ul.appendChild( createListItem(data.mother, 'female') );
      } else {
        ul.appendChild( createMissingListItem('female') );
      }
    } else {
      var ul = document.createElement('span');
    }
    currentstep--;
    return ul;
  }

  function createListItem(data, className) {
    
    ancestorCount++;
    
    var li = document.createElement('li');
    
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

  function callServer() {

    console.log('Calling server...');
    var queryId = $('#query').val();
    $.get( mapperUrl, { query: queryId }, function(data){
      console.log('Get UUID returned:', data);
      if( typeof data.error !== 'undefined' ) {
        console.log('Get UUID failed...');
        showFailMsg('Fant ingen hund med denne id-en.');
      } else {
        if( typeof data.dogids[0].uuid !== 'undefined' ) {
          console.log('Looking up UUID returned:', data.dogids[0].uuid);
          getGraph( data.dogids[0].uuid );
        } else {
          getGraph( queryId );
        }
      }
    }).fail( function() {
      getGraph( queryId );
    });

  }

  function getGraph(uuid) {
    $.get( graphUrl+uuid, function(data){
      renderData( data );
    })
    .fail( function() {
      showFailMsg();
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
    }
    callServer();
  }

  function bindEvents() {

    $('#searchBtn').click( function(e) {
      callServer();
      e.preventDefault();
    });

    $g = $('#generations')
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

  function updateUrl() {
    console.log('Updated url and pushed state');
    if( window.history.replaceState ) {
      var newurl = location.origin + location.pathname;

      var urlData = [];
      urlData.push( 'query=' + $('#query').val() );

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
    renderData: renderData
  };

}($));

NEO.init();

// NEO.renderData(testdog);