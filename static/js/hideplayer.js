const player = document.getElementById("player_data");
const customise = document.getElementById("customise");
let hideTimeout;

function resetHidePlayer(){
    clearTimeout(hideTimeout);
    player.classList.remove("hidden");
    //customise.classList.remove("hidden");

    hideTimeout = setTimeout(() => {
        player.classList.add("hidden");
        //customise.classList.add("hidden");
    }, 3000);
}



document.addEventListener("mousemove", resetHidePlayer);
