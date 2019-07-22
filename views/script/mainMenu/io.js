var socket =io();
var Name = prompt("Please enter your name", "Anonymous");
var newPlayer={
    Name
}
var dataPlayer;

socket.emit('new',newPlayer);
socket.on('getData',payload=>{
    if(dataPlayer == null){
    dataPlayer = payload}   
})

socket.on('readyCount', payload =>{//payload = ReadyCount, playPlayer

    document.getElementById("playerCount").innerHTML = `${payload.ReadyCount}/${payload.playPlayer}`

}) 

function Ready() {
    socket.emit('ready', dataPlayer)
}

document.getElementById("ready").addEventListener("click", function(event){
    event.preventDefault()
    socket.emit('ready', dataPlayer)
    
});

socket.on('goPlay',payload =>{
    window.location.replace("http://localhost:3000/playing.html?ID="+dataPlayer.ID);
})

socket.on('check',payload=>{
    socket.emit('check',dataPlayer)
})