let url_string = window.location.href
let url = new URL(url_string);
let ID = url.searchParams.get("ID");
let socket =io();
var result;

console.log(ID);

const playAgain = () => {
    window.location.replace("http://localhost:3000/");
}

window.onload = socket.emit('getResult');

socket.on("getResult", payload => { //payload theChosenOne, kachi
    Players = payload.theChosenOne
    data  = Players.filter( player => player.ID == ID )[0];
    gameData = payload.gameVar
    var kachi = payload.kachi; 
    console.log(kachi);
    
    if(kachi == 0){
        if(data.Yakuwari == 2){
            result = "村人の勝ちあなたの負け"
        }else if(data.Status == "Death"){
            result = "死んだから負け"
        }else{
            result = "おめでとうございます、あなたの勝ちです"
        }
    }else{
        if(data.Yakuwari == 2){
            result = "おめでとうございます！一人勝ちです"
        }else{
            result = "残念、負けました　:("
        }
    }


    document.getElementById('result').innerHTML = result;
})