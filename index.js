var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
module.exports.io = io;

require('./ioAction/start')




app.get('/*', (req, res) => 
{
    var n = req.url.indexOf("?")
    if(n != -1){
        req.url = req.url.slice(0,n)
    }
    res.sendFile(__dirname + "/views/"+req.url,
        (err) =>{
    
    if(err){
    }
    res.sendFile(__dirname + "/views/mainMenu.html",
            (err) =>{

        if(err){
        }
            
        }) 
    })
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});