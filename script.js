let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder=folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    songs = [];
    for(let i = 0; i<anchor.length;i++) {
        let e = anchor[i];
        if (e.href.endsWith(".mp3")) {
            songs.push(e.href.split(`/${folder}/`)[1]);
        }
    }
    // show songs in the library
    let songList = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songList.innerHTML="";
    for(const song of songs) {
        songList.innerHTML = songList.innerHTML + `<li><div>${song.replaceAll("%20"," ").replace(".mp3","")}</div><img src="images/play.svg" alt="Play button"></li>`;
    }
    //event listener to your library songs
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e=> {
        e.addEventListener("click", ()=>{
            playMusic(e.firstElementChild.innerHTML+".mp3")
        })
    })
    return songs;
}

function playMusic(track, pause=false) {
    currentSong.src = `/${currentFolder}/`+track;
    if (!pause) {
        currentSong.play();
        play.src="images/pause.svg";
    }
    document.querySelector(".info").innerHTML=track.replace(".mp3", "").replaceAll("%20"," ");
}
//cards
async function displayMusic() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let rightSection = document.querySelector(".right-section")
    let arr = Array.from(anchors)
    for (let i=0;i<arr.length;i++) {
        const e = arr[i]
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            rightSection.innerHTML = rightSection.innerHTML + `<div data-folder="${folder}" class="card">
            <img src="songs/${folder}/cover.jpg" alt="">
            <div class="play-button">
                <img src="images/play2.svg" alt="Play button">
            </div>
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=> {
        e.addEventListener("click", async (e1) => {
            songs = await getSongs(`songs/${e1.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {
    // await getSongs();
    await displayMusic();

    //event listener to play bar's play button
    play.addEventListener("click", ()=> {
        if(currentSong.paused) {
            currentSong.play();
            play.src="images/pause.svg";
        } else {
            currentSong.pause();
            play.src="images/play.svg";
        }
    })
    //event listener for time update
    currentSong.addEventListener("timeupdate", ()=> {
        document.querySelector(".duration").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".seek-circle").style.width=(currentSong.currentTime/currentSong.duration)*100+"%";
    })
    //event listener for seek bar
    document.querySelector(".seek").addEventListener("click",(e)=>{
        let percentage = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".seek-circle").style.width=percentage+"%";
        currentSong.currentTime=(currentSong.duration*percentage)/100;
    })
    //event listener for hamburger menu
    document.querySelector(".ham-menu").addEventListener("click", ()=> {
        document.querySelector(".left").style.left="0";
    })
    //event listener for close button
    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left="-100%";
    })
    //event listener for previous button
    previous.addEventListener("click", ()=>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index-1 >= 0) {
            playMusic(songs[index-1]);
        }
    })
    //event listener for next button
    next.addEventListener("click", ()=> {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index+1 < songs.length) {
            playMusic(songs[index+1]);
        }
    })
  
}

main()
