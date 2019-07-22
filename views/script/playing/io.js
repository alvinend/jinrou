let url_string = window.location.href
let url = new URL(url_string);
let ID = url.searchParams.get("ID");
let socket =io();
let data;
let Players;
let gameData;
let textYakuwari;


//チャット
socket.on("chat", payload =>{//payload = msg,ID
    const add = document.createElement('div');
    if(payload.ID == data.ID){
        add.innerHTML = '<div class="sentChat"><div class="name">'+data.Name+'</div><div class="msg">'+payload.msg+'</div></div>'
    }else{
        Players.forEach(player =>{
            if(player.ID == payload.ID){
                add.innerHTML = '<div class="receiveChat"><div class="name">'+player.Name+'</div><div class="msg">'+payload.msg+'</div></div>'
            }
            })
    }
    const chatBox = document.getElementById("chatBody")
    chatBox.appendChild(add);
    chatBox.scrollTo(0, chatBox.scrollHeight)
}) 

document.querySelector('#sendo').addEventListener('click', (e) =>{
    e.preventDefault();
    let msg = {
        ID : data.ID,
        msg : document.getElementById("myText").value
    }
    document.getElementById("myText").value = '';
    msg.msg != '' && socket.emit('chat',msg)
})

//ゲーム

//functionいろいろ
const inGameLog = (msg) => {
    const nodeInGameLog = document.getElementById("ingameLog");
    var addInGameLog = document.createElement('span');
    addInGameLog.innerHTML = "<br>" + msg
    nodeInGameLog.appendChild(addInGameLog)
    nodeInGameLog.scrollBy(0, nodeInGameLog.scrollHeight)
    }

const setData = () => {
    //Yakuwari
    document.getElementById("Yakuwari").innerHTML = data.Yakuwari == 0 ? "村人" : data.Yakuwari == 1 ? "占い師" : "人狼";

    //Time
    document.getElementById("Time").innerHTML = gameData.Time;
    inGameLog(`今は${gameData.Time}です`)

    //Alive List
    const nodeAlive = document.getElementById("aliveList");
    while (nodeAlive.firstChild) {
        nodeAlive.removeChild(nodeAlive.firstChild);
    }

    Players.forEach(player => {
        if(player.Status == "Alive"){
            var addAlive = document.createElement('span');
            addAlive.innerHTML = player.Name +" "
            nodeAlive.appendChild(addAlive)
        };
        
    })

    //Vote List
    const nodeVote = document.getElementById("voteList");
    while (nodeVote.firstChild) {
        nodeVote.removeChild(nodeVote.firstChild);
    }

    Players.forEach(player => {
        if(player.Status == "Alive"){
            if(player.ID != data.ID){
                var addAlive = document.createElement('span');
                addAlive.innerHTML = `<button id="vote${player.ID}" onClick="voteClick(${player.ID})">${player.Name}</button>`
                nodeVote.appendChild(addAlive)
            }
        };
        
    })

    //Special Ability
    const nodeSp = document.getElementById("SpList");
    const nodeSpTitle = document.getElementById("spAbility");

    nodeSpTitle.innerHTML = data.Yakuwari == 2 ? "殺す" : data.Yakuwari == 1 ? "占う" : "無能";

    while (nodeSp.firstChild) {
        nodeSp.removeChild(nodeSp.firstChild);
    }

    if(data.Yakuwari != 0 ){
        Players.forEach(player => {
            if(player.Status == "Alive"){
                if(player.ID != data.ID){
                    var addAlive = document.createElement('span');
                    addAlive.innerHTML = `<button id="sp${player.ID}" onClick="spClick(${player.ID})">${player.Name}</button>`
                    nodeSp.appendChild(addAlive)
                }
            };
        })
    }else{
        nodeSp.innerHTML = "頑張れ無能ども"
    }
    
}

const voteClick = (votedID) =>{
    window.event.preventDefault;
    Players.forEach( player => player.ID == votedID && inGameLog(`${player.Name}を投票しました`))
    var IDs = {
        ID :  data.ID,
        votedID
    }
    socket.emit('hiruAction', IDs)
        Players.forEach( player =>{ 
            if(player.Status == "Alive"){
                player.ID != data.ID && (document.getElementById(`vote${player.ID}`).disabled =true) 
            }
        })
    
    
}

const spClick = (spdID) =>{
    Players.forEach( player => (data.Yakuwari == 2 && spdID == player.ID) && inGameLog(`${player.Name}が明日までに殺す`))
    Players.forEach( player => (data.Yakuwari == 1 && spdID == player.ID) && inGameLog(`${player.Name}は${player.Yakuwari == 0 ? "村人" : player.Yakuwari == 1 ? "占い師" : "人狼"}です`))
    window.event.preventDefault;
    var IDs = {
        ID :  data.ID,
        spdID
    }
    socket.emit('yoruAction', IDs)
    Players.forEach( player =>{ 
        if(player.Status == "Alive"){
            player.ID != data.ID && (document.getElementById(`sp${player.ID}`).disabled =true) 
        }
    })
    
}

//Socket.io操作

socket.emit("getdata",ID)

socket.on("retData", payload => { //payload Players, gameVar
    Players = payload.theChosenOne
    data  = Players.filter( player => player.ID == ID )[0];
    gameData = payload.gameVar
    setData();
    Players.forEach( player => player.ID != data.ID && (document.getElementById(`vote${player.ID}`).disabled =true) ) 
    textYakuwari = data.Yakuwari == 0 ? "村人" : data.Yakuwari == 1 ? "占い師" : "人狼";
    inGameLog("君は"+ textYakuwari　+"だよ")
})

socket.on('changeTime', payload=>{
    Players = payload.theChosenOne
    data  = Players.filter( player => player.ID == ID )[0];
    gameData = payload.gameVar


    if(data.Status != "Alive"){
        window.location.replace("http://localhost:3000/gameOver.html?ID="+data.ID);
    }

    setData();
    
        if(gameData.Time == "Day"){
            Players.forEach(player=>{
                if(player.Status == "Alive"){
                    if(player.ID != data.ID){
                        document.getElementById(`vote${player.ID}`).disabled = false;
                        if(data.Yakuwari > 0){
                            document.getElementById(`sp${player.ID}`).disabled = true;
                        }
                        
                    }
                    
                }
            })
        }
    
        if(gameData.Time == "Night"){
            Players.forEach(player=>{
                if(player.Status == "Alive"){
                    if(player.ID != data.ID){
                        document.getElementById(`vote${player.ID}`).disabled = true;
                        if(data.Yakuwari > 0){
                            document.getElementById(`sp${player.ID}`).disabled = false;
                        }
                    }
                    
                }
            })
        }
    
    
})

socket.on('report',payload =>{
    inGameLog(`${payload.day}がおわりました`)
    inGameLog(`${payload.shinin}が死にました`)
})

socket.on('isOver',payload => {
    window.location.replace("http://localhost:3000/gameOver.html?ID="+data.ID);
})
