window.onbeforeunload = function() {
websocket.close()
};
var connectionList = {},autoCon = true,conInterval;
var port1 = 1024;
function socketConnect(clientid){
    clearInterval(conInterval);
    var tm = 0;
    if(connectionList[clientid]){
    connectionList[clientid].close()
    tm = 100;}
    setTimeout(function(){
      autoCon = true;
      window.WebSocket = window.WebSocket || window.MozWebSocket;
      var connection = new WebSocket('ws://127.0.0.1:'+port1+'/'+clientid);
      connectionList[clientid] = connection;
      connection.onopen = function () {
          // connection is opened and ready to use
      };
      connection.onerror = function (error) {
          // an error occurred when sending/receiving data
      };
      connection.onmessage = function (message) {
          // try to decode json (I assume that each message from server is json)
          var res = JSON.parse(message.data);
          try {
            //message.path is clientid
  			      console.log(message.data,".socketBoxes .socketBox."+res.path+" .inputContents")
            $(".socketBoxes .socketBox."+res.path+" .inputContents").append("<br/>"+res.data)
          } catch (e) {
              console.log('This doesn\'t look like a valid JSON: ', JSON.stringify(message),e);
              return;
          }
          // handle incoming message
      };
      connection.onclose = function () {
        reconnect(clientid)
      };
      setTimeout(function(){
      //  console.log($(".socketBoxes .socketBox."+clientid+" sendTextBtn"),".socketBoxes .socketBox."+clientid+" .sendTextBtn")
        $(".socketBoxes .socketBox."+clientid+" .sendTextBtn").on("click",function(){
          console.log("sending to ",clientid)
          connection.send($(".socketBoxes .socketBox."+clientid+" .sendText").val())
          $(".socketBoxes .socketBox."+clientid+" .sendText").val("")
        })
      },100)
    },tm)

}

$("#connection1 .closeSockets").on('click',function(){
  autoCon =  false;
  for(var i in connectionList){
    connectionList[i].close()
  }
  $(".socketBoxes").html("")
})
function reconnect(id){
    if(autoCon){
      autoCon = false;
      conInterval = setInterval(function(){$("#connection1 .getSockets").click();},1000*Math.floor(Math.random() * 10) + 1  )
    }
}
function sendNPM(data){
	console.log(data)
	// execute/set-listeners
	$.ajax({
    url: "http://localhost:"+port1+"/execute/set-listeners",
	type:"POST",
	crossDomain: true,
	contentType: 'application/json; charset=utf-8',
    dataType: "json",
    data: JSON.stringify(data),
    success: function( response ) {
        for(var i in response){
          socketConnect(response[i]);
        }
    }
  })
}

var obOriginal = $(".socketBox").clone();
$(".socketBoxes").html("");

var createSocketDivs = function(arrVal){
  $(".socketBoxes").html("")
  if(arrVal.length > 0){
    for(var i in arrVal){
      txtValue = arrVal[i]
      var obTmp = obOriginal.clone();
      obTmp.removeClass("remove")
      obTmp.addClass(txtValue)
      obTmp.html(obTmp.html().replace("socketname",txtValue))
      $(".socketBoxes").append(obTmp);
      socketConnect(txtValue)
    }
  }
}

$("#connection1 .setArr").on("click",function(){
  var arr = [];
  $(".socketBoxes").html("");
  $("#connection1 .clientName").each(function(){
    var txtValue = $(this).val();
    if(txtValue != undefined && txtValue!=""){
      arr.push(txtValue)
    }
  })
  createSocketDivs(arr)
  sendNPM(arr)
})
$("#connection1 .getSockets").on("click",function(){
  autoCon = false;
  $.ajax({
    url: "http://localhost:"+port1+"/get/socketlist",
  	type:"GET",
  	crossDomain: true,
  	contentType: 'application/json; charset=utf-8',
    dataType: "json",
    success: function( response ) {
        console.log(response)
        createSocketDivs(response)
    }
  })
})
