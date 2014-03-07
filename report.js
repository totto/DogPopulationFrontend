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
  	sendReport();
  });

  $('#missingAncestorForm').submit(function(e){
  	e.preventDefault();
  	console.log('Missing Ancestor Error!');
  	sendReport();
  });

  return {
    send: sendReport
  }

}($));