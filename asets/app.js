const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_MUSIC_APP = 'Music-app'

const heading = $('header h2');
const cdThum = $('.cd-thumb');
const audio = $('#audio');
const playlist = $('.playlist');
const cd = $('.cd');
const btnPlay = $('.btn-toggle-play');
const Player = $('.player');
const progress = $('#progress');
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    setting: JSON.parse(localStorage.getItem(PLAYER_MUSIC_APP)) || {},

    songs : [
        {
            name: "THERE'S NO ONE AT ALL",
            singer: "Sơn Tùng MTP",
            path: "./asets/sound/SƠN TÙNG M-TP - THERE'S NO ONE AT ALL - OFFICIAL MUSIC VIDEO.mp3",
            img: "./asets/img/SonTung.jpeg"
        },
        {
            name: "Far Out",
            singer: "Chains (feat. Alina Renae) [NCS Release]",
            path: "./asets/sound/Far Out - Chains (feat. Alina Renae) [NCS Release].mp3",
            img: "./asets/img/NCS.jpg"
        },
        {
            name: "Everything",
            singer: "Diamond Eyes",
            path: "./asets/sound/Diamond Eyes - Everything [NCS Release].mp3",
            img: "./asets/img/NCS2.jpg"
        },
        {
            name: "Self Care",
            singer: "Mac Miller",
            path: "./asets/sound/Mac Miller - Self Care.mp3",
            img: "./asets/img/MacMiller.jpg"
        },
        {
            name: "Stay",
            singer: "Mac Miller",
            path: "./asets/sound/Mac Miller - Stay.mp3",
            img: "./asets/img/MacMiller.jpg"
        },
        {
            name: " SICKO MODE",
            singer: "Travis Scott",
            path: "./asets/sound/Travis Scott - SICKO MODE ft. Drake.mp3",
            img: "./asets/img/Travis-Scott.jpg"
        },
    ],

    configSetting: function(key,value) {
        this.setting[key] = value;
        localStorage.setItem(PLAYER_MUSIC_APP,JSON.stringify(this.setting));
    },

    defineProperties : function() {
        Object.defineProperty(this,'currentSong', {
            get : function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    render : function() {
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" 
                    style="background-image: url('${song.img}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    handleEvent : function() {
        const _this = this;
        const cdWidth = cd.offsetWidth
        // xoay CD
        const RotateCd = cdThum.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 second
            iteration: Infinity,
        })
        RotateCd.pause()

        // Xử lý scroll
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth;
        }     
        // Xử lý play 
        btnPlay.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            
            audio.onplay = function() {
                _this.isPlaying = true;
                Player.classList.add('playing');
                RotateCd.play();
            }
            audio.onpause = function() {
                _this.isPlaying = false;
                Player.classList.remove('playing')
                RotateCd.pause();
            }
        }

        // Time update
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const Percent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = Percent;
            }
        }

        // tua song (Bug)
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // Next song 
        btnNext.onclick = function() {
            if(_this.isRandom) {
                _this.RandomSong()
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        btnPrev.onclick = function() {
            if(_this.isRandom) {
                _this.RandomSong()
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Random
        btnRandom.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.configSetting('isRandom',_this.isRandom)
            btnRandom.classList.toggle('active',_this.isRandom);

        }
        // Repeat 
        btnRepeat.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.configSetting('isRepeat',_this.isRepeat)
            btnRepeat.classList.toggle('active',_this.isRepeat);
        }
        // end bai hat 
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }
        }
        // Click list de phat nhac
        playlist.onclick = function(e) {
            // Active hoac thang option
            const songNode =  e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }

    },

    scrollToActiveSong: function() {
        setTimeout(()=> {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        },300)
    },

    loadCurrentSong : function() {
        heading.textContent = this.currentSong.name;
        cdThum.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path;
    },
    loadConfig : function() {
        this.isRandom = this.setting.isRandom
        this.isRepeat = this.setting.isRepeat
    },

    nextSong : function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong : function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    RandomSong : function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start : function() {
        // Gan cau hinh 
        this.loadConfig();
        // định nghĩa các thuộc tính cho obj
        this.defineProperties();
        // lắng nghe / xử lý  DOM
        this.handleEvent();


        this.loadCurrentSong(); 

        // render
        this.render();
        // hiển thị trạng thái ban đầu 
        btnRandom.classList.toggle('active',this.isRandom);
        btnRepeat.classList.toggle('active',this.isRepeat);
    }
}
app.start()


