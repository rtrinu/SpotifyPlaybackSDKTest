const div = document.getElementById("player_data");
let hideTimeout;

function resetHidePlayer(){
    clearTimeout(hideTimeout);
    div.classList.remove("hidden");

    hideTimeout = setTimeout(() => {
        div.classList.add("hidden");
    }, 3000);
}

document.addEventListener("mousemove", resetHidePlayer);
