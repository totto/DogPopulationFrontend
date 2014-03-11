var NEOREPORT = (function($){
  
	var url = '/problemsolver';

	var testdata = {
		uuid: "blabla",
		type: "Missing ancestor",
		details: {
			parent: ''
		},
		comment: "Something is wrong",
		sender: {
			name: "Bla bla",
			email: "bla@bla.no"
		}
	};

  testdata = JSON.stringify(testdata);

  $.fn.serializeObject = function(){

      var self = this,
          json = {},
          push_counters = {},
          patterns = {
              "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
              "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
              "push":     /^$/,
              "fixed":    /^\d+$/,
              "named":    /^[a-zA-Z0-9_]+$/
          };


      this.build = function(base, key, value){
          base[key] = value;
          return base;
      };

      this.push_counter = function(key){
          if(push_counters[key] === undefined){
              push_counters[key] = 0;
          }
          return push_counters[key]++;
      };

      $.each($(this).serializeArray(), function(){

          // skip invalid keys
          if(!patterns.validate.test(this.name)){
              return;
          }

          var k,
              keys = this.name.match(patterns.key),
              merge = this.value,
              reverse_key = this.name;

          while((k = keys.pop()) !== undefined){

              // adjust reverse_key
              reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

              // push
              if(k.match(patterns.push)){
                  merge = self.build([], self.push_counter(reverse_key), merge);
              }

              // fixed
              else if(k.match(patterns.fixed)){
                  merge = self.build([], k, merge);
              }

              // named
              else if(k.match(patterns.named)){
                  merge = self.build({}, k, merge);
              }
          }

          json = $.extend(true, json, merge);
      });

      return json;
  };

  function sendReport(data) {
    data = data || testdata;
  	$.ajax({
  		type: 'post',
  		url: url,
  		data: data,
      contentType: "application/json; charset=utf-8",
  		success: sendSuccess(),
  		dataType: 'json'
  	});
  }

  function sendSuccess() {
  	console.log('Send was successful!');
  }

  function sendFailure() {
  	console.log('Sending failed!');
  }

  $('#dogErrorForm').submit(function(e){
  	e.preventDefault();
  	console.log('Reporting Error!');
    console.log( JSON.stringify( $('#dogErrorForm').serializeObject() ) );
    sendReport( JSON.stringify( $('#dogErrorForm').serializeObject() ) );
  });

  $('#missingAncestorForm').submit(function(e){
  	e.preventDefault();
  	console.log('Missing Ancestor Error!');
  	sendReport( JSON.stringify( $('#missingAncestorForm').serializeObject() ) );
  });

  return {
    send: sendReport
  }

}($));