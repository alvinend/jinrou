var io = require('../index').io
var  {ID, Players, playPlayer } = require('./data')
var theChosenOne = []
var killedPlayer;
var kachi;
var day = 0;
var shinin;
ID = 100;

const playerCount = () =>{
    return Players.length
}

const readyCount = () =>{
    var readyCount =0;
    Players.forEach(x => {
        if(x.readyStatus){
            readyCount++
        }
    });
    return readyCount
}

const readyPlay = () =>{
    if(playerCount() == readyCount() && playerCount() == playPlayer){
        return true
    }else{
        return false
    }
}



io.on('connection', socket => {
    
    socket.on('new', payload =>{
        var {Name} = payload
        ID++;
        var newPlayer={
            ID,
            Name,
            Yakuwari : 0,
            Status : "Alive",
            readyStatus: false,
            action: false,
            Vote: 0
        }
        Players.push(newPlayer)
        socket.emit('getData',newPlayer)
    })


    socket.on('ready',payload=>{

        //プレイやが揃うかどうか確認
        Players.forEach(player => player.ID == payload.ID && (player.readyStatus = !player.readyStatus))
        if(readyPlay()){
            theChosenOne = Players
            yakuwariRandom()
            io.emit('goPlay',"GOOO")
        }

        //Main menuでの表示
        var status = {
            ReadyCount : readyCount(),
            playPlayer}
        console.table(status)
        io.emit('readyCount',status)
    })

    socket.on('check',payload=>{
        var x = 0;
        Players.forEach(player => {
            if(player.ID == payload.ID){
                x=1;
            }
        });
        
        if(x == 0){
        Players.push(payload)}
    })
    
    socket.on('disconnect',()=>{
        Players = [];
        io.emit('check','halo');
    })

    //チャット
    socket.on('chat',payload=>{ //payload = msg, ID
        io.emit('chat', payload)
    })


    //ゲーム
    var gameVar ={
        Time : "Night",
        Alive : playPlayer
    }

    const YoruActionTotal = () =>{
        var x = 0;
        theChosenOne.forEach(player =>{
            (player.Yakuwari > 0 && player.Status == "Alive") && x++;
        })
        return x;
    };

    const ActionSuu = () =>{
        var x = 0;
        theChosenOne.forEach(player => {
            player.action == true && x++;
        })
        return x
    }

    const AliveCount = () =>{
        var x =0;
        theChosenOne.forEach(player => player.Status == "Alive" && x++ )
        return x;
    }
    const changeTime = () =>{
        if(gameVar.Time == "Day" && AliveCount() == ActionSuu()){return true}
        if(gameVar.Time == "Night" && YoruActionTotal() == ActionSuu()) {return true}
        return false
    }

    const isOver = () =>  {
        var flag = 0;
        theChosenOne.forEach(player=>{
            if(player.Yakuwari == 2 && player.Status == "Death"){
                kachi = 0;
                io.emit("isOver", kachi);
                flag = 1;
                
            }
            })

        if(gameVar.Alive < 3 && flag == 0){
            kachi = 2;
            io.emit("isOver", kachi);
        }
        }

    const yakuwariRandom = () => {
        // 0 = 村人, 1 = 占い師, 2 = 老人
        //必ず人狼と占い師一人がおる
        var WereRandom = Math.floor(Math.random() * Math.floor(theChosenOne.length));
        var UranaiRandom = Math.floor(Math.random() * Math.floor(theChosenOne.length));
        while(UranaiRandom == WereRandom){
            UranaiRandom = Math.floor(Math.random() * Math.floor(theChosenOne.length));
        }
        theChosenOne[WereRandom].Yakuwari = 2;
        theChosenOne[UranaiRandom].Yakuwari = 1;
    }
        
    

    socket.on("getdata", payload =>{ //payload = ID
        const data = {
            theChosenOne,
            gameVar
        }
        socket.emit("retData", data);
    })

    socket.on("hiruAction",payload => { //payload = ID,ID (voted)
        gameVar.Time = "Day";

        theChosenOne.forEach(player=>{
            player.ID == payload.votedID && player.Vote++
            player.ID == payload.ID && (player.action = true)
        })

        console.log(`Action Suu = ${ActionSuu()}`);
        console.log(`Hiru Action Total = ${AliveCount()}`);
        console.log(`is it time to change? ${changeTime()}`);
        
        
        
        if(changeTime()){
            
            day++;
            var maxVoteCount = 0;
            var shikei = 0;
            theChosenOne.forEach(player =>{
                player.action = false;
                if(maxVoteCount == player.Vote){
                    shikei = 0
                }else if(maxVoteCount < player.Vote){
                    maxVoteCount = player.Vote
                    shikei = player.ID
                }
            })
            
            theChosenOne.forEach(player =>{
                if(player.ID == shikei){
                    player.Status = "Death"
                    shinin = player.Name;
                    console.log(`${player.Name} is Death`);
                    
                }
            })
            gameVar.Time = "Night"
            gameVar.Alive = AliveCount()
            var result = {
                theChosenOne,
                gameVar
            }
            

            console.log(`day${day}`);
            console.table(theChosenOne)

            isOver();
            io.emit("changeTime", result);
            var report ={
                day,
                shinin
            }
            io.emit("report",report)
        }
    })


    socket.on("yoruAction",payload => { //payload = ID,ID (voted)
        gameVar.Time = "Night"
        
        theChosenOne.forEach(player=>{
            player.ID == payload.ID && (player.action = true)
        })

        
        theChosenOne.forEach( player => {
            if(player.ID == payload.ID && player.Yakuwari == 2){
                killedPlayer = payload.spdID
            }
        } )
        console.log(`Action Suu = ${ActionSuu()}`);
        console.log(`Yoru Action Total = ${YoruActionTotal()}`);
        console.log(`is it time to change? ${YoruActionTotal() == ActionSuu()}`);
        console.log(changeTime());
        
        if(changeTime()){
            theChosenOne.forEach(player => player.action = false)

            theChosenOne.forEach(player =>{
                player.ID == killedPlayer && (player.Status = "Death")
                player.ID == killedPlayer && (shinin = player.Name)
            })
            gameVar.Time = "Day"
            var result = {
                theChosenOne,
                gameVar
            }

            day++;
            console.log(`day${day}`);
            console.table(theChosenOne)
            io.emit("changeTime", result);

            var report ={
                day,
                shinin
            }

            isOver();
            io.emit("report",report)
        }
    })

    socket.on('getResult', payload =>{
        if(kachi != null){
        const Finaldata = {
            theChosenOne,
            kachi
        }

        io.emit('getResult', Finaldata)
    }
    })
});
