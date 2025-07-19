let songs = []
let audio
let currSection = "music"
let currFolder
let currentVolume = 1

async function getAllSongs() {
    const allSongs = [];

    let a = await fetch(`/songs/${currSection}/`);
    let response = await a.text();

    const div = document.createElement("div");
    div.innerHTML = response;

    const as = div.getElementsByTagName("a");

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        console.log("Found link:", element.href);

        if (element.href.includes(`/songs/${currSection}/`) && !element.href.endsWith(".mp3")) {
            const fullPath = new URL(element.href).pathname; 
            console.log("Folder found:", fullPath);
            const b = await fetch(fullPath);              
            const resp = await b.text();

            const dev = document.createElement("div");
            dev.innerHTML = resp;

            const a_s = dev.getElementsByTagName("a");

            for (let index = 0; index < a_s.length; index++) {
                const item = a_s[index];

                if (item.href.endsWith(".mp3")) {
                    const relPath = item.getAttribute("href");
                    const fullUrl = `${window.location.origin}${relPath}`;
                    console.log(fullUrl);
                    allSongs.push(fullUrl);
                }
            }
        }
    }

    return allSongs;
}


async function getSongs(folder) {
    currFolder = folder
    songs = []
    let a = await fetch(`/songs/${currSection}/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    for (let index = 0; index < as.length; index++) {
        const element = as[index]
        if (element.href.endsWith(".mp3")) {
            let relativePath = element.getAttribute("href")
            let songUrl = relativePath.startsWith("/")
                ? `${window.location.origin}${relativePath}`
                : `${window.location.origin}/songs/${currSection}/${currFolder}/${relativePath}`;

            console.log("Final Song URL:", songUrl); // (Optional) For debugging
            songs.push(songUrl);
        }
    }
    return songs;
}
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, "0")}`
}

const playsong = document.getElementById("playsong")
const prev = document.getElementById("prev")
const next = document.getElementById("next")


async function main() {
    // songs = await getSongs("ncs1")
    console.log("Songs list:", songs)
    playsong.src = "play.svg"

    playsong.addEventListener("click", () => {
        if (!audio) return

        else if (audio.paused) {
            audio.play()
            playsong.src = "pause.svg"
        }
        else {
            audio.pause()
            playsong.src = "play.svg"
        }
    })

    prev.addEventListener("click", () => {
        if (!audio) return
        let index = songs.findIndex(song => audio.src.includes(song));
        if (index - 1 >= 0) {
            play(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        if (!audio) return
        let index = songs.findIndex(song => audio.src.includes(song));
        if (index < songs.length - 1) {
            play(songs[index + 1])
        }
    })

    document.querySelector(".volseekbar").addEventListener("click", (e) => {
        if (!audio) return

        const volseekbar = document.querySelector(".volseekbar")
        const volcircle = document.querySelector(".volcircle")

        const seekbarWidth = volseekbar.getBoundingClientRect().width
        const clickPosition = e.offsetX
        const percent = (clickPosition / seekbarWidth) * 100

        volcircle.style.left = `${percent}%`
        volseekbar.style.background = `linear-gradient(to right, rgb(255, 200, 0) ${percent}%, #ffffff ${percent}%)`

        currentVolume = percent / 100
        audio.volume = currentVolume
    })

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)

            let songUL = document.querySelector(".songlist ul")
            songUL.innerHTML = ""

            for (const song of songs) {
                let songName = decodeURIComponent(song.split(`/${currFolder}/`)[1]).replace(".mp3", "")
                songUL.innerHTML +=
                    `<li data-url="${song}">
                        <img src="music.svg" alt="">
                        <div class="info">
                            <div>${songName}</div>
                            <div>Harsh</div>
                        </div>
                        <div class="playnow">
                            <div id="play_now">
                                <span>Play Now</span>
                            </div>
                            <img src="playnow.svg" alt="">
                        </div>
                    </li>`
            }

            Array.from(document.querySelectorAll(".songlist li img")).forEach(img => {
                img.addEventListener("click", () => {
                    const li = img.closest("li")
                    const url = li.getAttribute("data-url")
                    play(url)
                })
            })

        })
    })

    document.getElementById("music").addEventListener("click", (e) => {
        document.querySelector(".music-section").style.display = "block";
        document.querySelector(".podcasts-section").style.display = "none";
        currSection = e.currentTarget.dataset.folder
        e.currentTarget.style.background = "white"
        e.currentTarget.style.color = "black"
        document.getElementById("podcasts").style.background = "rgb(50,50,50)"
        document.getElementById("podcasts").style.color = "white"
    });

    document.getElementById("podcasts").addEventListener("click", (e) => {
        document.querySelector(".music-section").style.display = "none";
        document.querySelector(".podcasts-section").style.display = "block";
        currSection = e.currentTarget.dataset.folder
        e.currentTarget.style.background = "white"
        e.currentTarget.style.color = "black"
        document.getElementById("music").style.background = "rgb(50,50,50)"
        document.getElementById("music").style.color = "white"
    });

    document.getElementById("myInput").addEventListener("input", async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const All_song = await getAllSongs()
        const songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";

        for (const song of All_song) {
            const fullURL = song
            const result = decodeURIComponent(song.substring(song.lastIndexOf("/") + 1).replace(".mp3", ""))
            const song_name = result.replace("%20", "")
            if (song_name.toLowerCase().includes(searchTerm)) {
                songUL.innerHTML += `
                <li data-url="${fullURL}">
                    <img src="music.svg" alt="">
                    <div class="info">
                        <div>${song_name}</div>
                        <div>Harsh</div>
                    </div>
                    <div class="playnow">
                        <div id="play_now"><span>Play Now</span></div>
                        <img src="playnow.svg" alt="">
                    </div>
                </li>`
            }
        }
        Array.from(document.querySelectorAll(".songlist li img")).forEach(img => {
            img.addEventListener("click", () => {
                const li = img.closest("li");
                const url = li.getAttribute("data-url");
                songs = [url];
                play(url);
            });
        });
    });
}

main()

function play(url) {
    if (audio) {
        audio.pause()
        audio.src = ""
    }
    audio = new Audio(url)
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
        console.log("Podcast Duration:", audio.duration);
        const total = formatTime(audio.duration);
        document.querySelector("#songduration").innerText = `0:00 / ${total}`;
        seekbar.style.background = `linear-gradient(to right, rgb(0, 203, 0) 0%, #ccc 0%)`;
        document.querySelector(".circle").style.left = "0%";
    });

    audio.volume = currentVolume
    audio.play()
    playsong.src = "pause.svg"
    const songInfo = document.querySelector("#songinfo")
    if (songInfo) {
        const name = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1).replace(".mp3", ""));
        songInfo.innerHTML = name;

    }

    audio.ontimeupdate = () => {
        if (isNaN(audio.duration)) return;
        const current = formatTime(audio.currentTime)
        const total = formatTime(audio.duration || 0)
        document.querySelector("#songduration").innerText = `${current} / ${total}`
        const percent = (audio.currentTime / audio.duration) * 100
        document.querySelector(".circle").style.left = `${percent}%`
        seekbar.style.background = `linear-gradient(to right, rgb(0, 203, 0) ${percent}%, #ccc ${percent}%)`
    }
    audio.onended = () => {
        let index = songs.findIndex(song => audio.src.includes(song))
        if (index < songs.length - 1) {
            play(songs[index + 1])
        }
        else {
            playsong.src = "play.svg"
        }
    }
}

const seekbar = document.querySelector(".seekbar")

document.querySelector(".seekbar").addEventListener("click", e => {
    if (!audio || isNaN(audio.duration)) return
    const circle = document.querySelector(".circle")

    const rect = seekbar.getBoundingClientRect()
    const clickPosition = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickPosition / rect.width, 0), 1);


    circle.style.left = `${percent * 100}%`
    audio.currentTime = audio.duration * percent;
});

document.getElementById("library").addEventListener("click", () => {
    const songlist = document.querySelector(".songlist")
    songlist.style.opacity = "1"
    songlist.style.pointerEvents = "all"
    songlist.style.transform = "translateX(0)"
})

const full = document.getElementById("full");

document.querySelector(".volume img").addEventListener("click", () => {
    if (!audio || !full) return
    if (audio.volume > 0) {
        currentVolume = 0
        audio.volume = 0
        full.src = "mute.svg"
        document.querySelector(".volcircle").style.left = 0 + "%"
        document.querySelector(".volseekbar").style.background = `linear-gradient(to right, rgb(255, 200, 0) 0%, #ffffff 0%)`
    }
    else {
        currentVolume = 1
        audio.volume = 1
        full.src = "volume.svg"
        document.querySelector(".volcircle").style.left = 100 + "%"
        document.querySelector(".volseekbar").style.background = `linear-gradient(to right, rgb(255, 200, 0) 100%, #ffffff 0%)`
    }
})
