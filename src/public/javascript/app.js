
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';
const cdImg = document.querySelector('.music-cd-img');
const player = $('.app__music');
const progress = document.querySelector('#progress');
const cd = $('.music__dashboard-cd');
const musicHeading = $('.music__dashboard-heading h2');
  
const btnNext = document.querySelector('.btn-next');
const btnPrev = document.querySelector('.btn-back');
const btnRandom = document.querySelector('.btn-random');
const btnRepeat = $('.btn-repeat');
const playList = $('.music__playlist');

const favouriteSongList=$('.favouriteList');
let r = $(':root');
let favouriteArray= [];

const volumeInput = document.getElementById('volumeInput');
const gainInput = document.getElementById('gainInput');
const stereoInput = document.getElementById('stereoInput'); 
const speedInput = document.getElementById('speedInput');
const btnInputMusics = document.querySelectorAll('.btnInputMusic');
const sliderInputs = document.querySelectorAll('.sliderInput');

// Khai bao biến sóng chứa danh sách các bài hát
const songs = [
    {
      name:'Em của ngày hôm qua',
      singer :'Sơn Tùng MTP',
      audio : 'music/song1.mp3',
      image: 'img/song1.jpg',
    },
    {
      name:'Nắng ấm xa dần',
      singer :'Sơn Tùng MTP',
      audio : 'music/song2.mp3',
      image: 'img/song2.jpg',
    },
    {
      name:'Tháng tư là lời nói dối',
      singer :'Hà Anh Tuấn',
      audio : 'music/song3.m4a',
      image: 'img/song3.jpg',
    },
    {
      name:'Một bước yêu vạn dặm đau',
      singer :'Mr Siro',
      audio : 'music/song4.m4a',
      image: 'img/song4.jpg',
    },
    {
      name:'Sai người sai thời điểm',
      singer :'Thanh Hưng',
      audio : 'music/song5.m4a',
      image: 'img/song5.jpg',
      },
    {
        name:'Dối lừa',
        singer :'Nguyễn Đình Vũ',
        audio : 'music/song10.mp3',
        image: 'img/song10.jpg',
    },
  ];
  
let currentSongIndex = 0;
let isPlaying = false;
let isRandom =  false;
let isRepeat =  false;
let isDrawing = false;
let config = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {};

const CVS = document.querySelector('#spectrogramCanvas');
const CTX = CVS.getContext('2d');
const W = CVS.width = window.innerWidth;
const H = CVS.height = window.innerHeight;

// khai báo biến sound thuộc thư viện howler.js
const sound = new Howl({
  src: [songs[currentSongIndex].audio],
  // html5: true, // giúp tăng tốc độ load() của thư viện howler.js nhưng sẽ ko sử dụng được chức năng khuếch đại âm thanh 
  preload: true, //giúp tăng tốc độ load() của thư viện howler.js     
  onplay: function() {
    isPlaying = true;
    // renderSong(songs[currentSongIndex]);
    cdImgAnimate.play();
  },
  onpause: function() {
    isPlaying = false;
    cdImgAnimate.pause();
  },
  onend: function() {
    if(isRepeat === true){
      sound.play();
  }
    else{
      btnNext.click();
  };
  // a=a;
  }
});

function setConfig (key, value){
  config[key] = value;
  localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(config));
}

// Render ra giao diện bài hát
function renderSong(song) {
  const htmls = songs.map((song, index) => {
    return `
    <div class="music__song ${(index == currentSongIndex) ?'active' : ''}" data-index=${index}>
        <div class="music__song-img" style="background-image: url('${song.image}');">
        </div>

        <div class="music__song-body">
            <div class="music__song-name">${song.name}</div>
            <div class="music__song-singer">${song.singer}</div>
        </div>

        <div class="music__song-option">
            <i data-index=${index} class="favourite fas fa-heart" ></i>
        </div> 
    </div>
    `});
    $('.music__playlist').innerHTML = htmls.join('');

}
  


//play/pause/seek bài hát
function playPauseSeek() {
  const togglePlayBtn = document.querySelector('.btn-toggle-play');

  togglePlayBtn.addEventListener('click', function () {
    if (isPlaying) {
         
      sound.pause();
    } else {
      sound.play();
    }

  });

  var updateProgress;
  sound.on('play', function() {
    isPlaying = true;
    player.classList.add('playing');
    updateProgress = setInterval(function() {
    const currentTime = sound.seek();
    const duration = sound.duration();
    const progressPercent = (currentTime / duration) * 100;
    progress.value = progressPercent.toFixed(2); // câp nhật giá trị thanh progress khi tiến độ bài hát thay đổi
    }, 100);

    startAnimation();
  });
 
   
  sound.on('pause', function() {
    isPlaying = false;
    player.classList.remove('playing');
    stopAnimation();

  });
  // Clear the interval when the song ends or is manually stopped
  sound.on('end', function() {
    clearInterval(updateProgress);
    // a=a;
  });
  sound.on('stop', function() {
    clearInterval(updateProgress);
  });

  progress.addEventListener('input', function () {
    const seekTime = (sound.duration() / 100) * progress.value;
    sound.seek(seekTime);

  });
}


//Xử lý phóng to thu nhỏ CD
const cdWidth = cd.offsetWidth;
document.onscroll = function(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const newCdWidth = cdWidth - scrollTop;
    
    cd.style.width = (newCdWidth > 0) ? newCdWidth + 'px' : 0;
    cd.style.opacity = (newCdWidth > 0) ? newCdWidth/cdWidth : 0;
}


// làm CD quay 
const cdImgAnimate = cdImg.animate([{
  transform : 'rotate(360deg)'
}], {
  duration: 17000, //17s(thời gian quay 1 vòng là 17s)
  iterations: Infinity //Lặp lại vô hạn lần
});
cdImgAnimate.pause();

let currentAnalyser = null;
let animationId = null;

// hàm tải lên bài hát hiện tai khi vào trang website
function loadCurrentSong(song){     
  musicHeading.textContent = song.name;
  cdImg.style.backgroundImage = `url('${song.image}')`;
  sound.unload();
  sound._src = [song.audio];
  sound.load();
  sound.play();
//them để tích hợp với để lấy âm thanh để vẽ spectrogram
  currentAnalyser = sound._sounds[0]._node.context.createAnalyser();
  currentAnalyser.fftSize = 1024;

  sound._sounds[0]._node.connect(currentAnalyser);

  CTX.fillStyle = 'hsl(280, 100%, 10%)';
  CTX.fillRect(0, 0, W, H);
  startAnimation();  
}

function updateProgressBar() {
  progress.value = 0;
}


// hàm next bài hát
function playNext() {
  currentSongIndex = (currentSongIndex + 1 + songs.length) % songs.length;
  sound.unload();
  updateProgressBar(); // Update progress bar after loading the new song
  loadAndSave();
}


// hàm previous bài hát
function playPrevious() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  sound.unload();
  // loadCurrentSong(songs[currentSongIndex])
  updateProgressBar(); // Update progress bar after loading the new song
  loadAndSave();
}

// Hàm random bài hát
function playRandom(){
  let randomIndex ;
  do{
    randomIndex = Math.floor(Math.random() * songs.length);
  }while(randomIndex === currentSongIndex)
  currentSongIndex = randomIndex;
  sound.unload();
  // loadCurrentSong(songs[currentSongIndex]);
  loadAndSave();

}

$('.icon-setting').onclick = function() {
$('.music__menu-amplification').classList.remove('none');
}

$('.music__menu-exit').onclick = function() {
$('.music__menu-amplification').classList.add('none');
}

//Khi click vào nút random
btnRandom.onclick = function(){
  isRandom = !isRandom;
  setConfig('isRandom', isRandom);
  btnRandom.classList.toggle("active", isRandom);
};

// Khi click vào nút repeat
btnRepeat.onclick= function(){
  isRepeat = !isRepeat;
  setConfig('isRepeat', isRepeat);
  btnRepeat.classList.toggle("active", isRepeat);
}

//khi click vào bai hat trong playlistvà click vào nút trái tim 
playList.onclick = function(e){
  const songNode = e.target.closest('.music__song:not(.active)');
  const option=e.target.closest('.music__song-option');
  const favouriteIndex=Number(e.target.closest('.music__song').getAttribute('data-index'));          


  if(songNode||option){

    if(songNode && !option){
      index = songNode.getAttribute('data-index');
      currentSongIndex=Number(index);
      // $('.music-song').classList.add('active');
      // loadCurrentSong(songs[currentSongIndex]);
      loadAndSave()

    }
//khi click vào nút trái tim thì sẽ đổi màu và thêm/xóa bài hát vào danh sách bài hát yêu thích 
    if(option){
        if(favouriteArray){
          const addFavourite = favouriteArray.includes(favouriteIndex)     
          if(!addFavourite) favouriteArray.unshift(favouriteIndex)          
          else {
              deleteIndex=favouriteArray.indexOf(favouriteIndex)
              favouriteArray.splice(deleteIndex,1)  
          }
              setConfig('favouriteList',favouriteArray)
              favouriteSave();
              favouriteHandle();
        }
    }
  }
}

function loadAndSave(){
  setConfig("currentSongIndex",currentSongIndex);
  loadCurrentSong(songs[currentSongIndex]);
  renderSong(songs[currentSongIndex]);
  favouriteSave();
}

function loadConfig(){ 
  //First load
  if(config.currentSongIndex ===undefined) {
      currentSongIndex =0;
  }
  else {
      currentSongIndex = config.currentSongIndex ;
      musicHeading.textContent = songs[currentSongIndex].name;
      cdImg.style.backgroundImage = `url('${songs[currentSongIndex].image}')`
      sound._src = [songs[currentSongIndex].audio];
      isRandom=config.isRandom;
      isRepeat=config.isRepeat;     
  }

  if(favouriteArray===undefined) {
      config.favouriteList =[];
      favouriteArray =config.favouriteList;
  }
  else 
  {
      favouriteArray= config.favouriteList;
  }   
      
  btnRandom.classList.toggle('active',isRandom);
  btnRepeat.classList.toggle('active',isRepeat);
}

function favouriteSave(){ 
  if(favouriteArray!=undefined)
  {
      favouriteArray= config.favouriteList;
      const tempIndexArray=[];
       songs.map((song,index)=>{ 
          tempIndexArray.push(index)
      });

              const difference = tempIndexArray.filter(x => !favouriteArray.includes(x));
              favouriteArray.map((favIndex) =>{
          
                          const favouriteSong=$(`[data-index=\'${favIndex}\'] .favourite`)
                          favouriteSong.classList.add('active');    

              });
              difference.map(favIndex=>{
          
                  const favouriteSong=$(`[data-index=\'${favIndex}\'] .favourite`)
                  favouriteSong.classList.remove('active');  
          
  });}
}

function favouriteHandle(){
 if(favouriteArray!=undefined){
  const favHtmls=favouriteArray.map((index)=>{
    return `<div class='fav' index=${index}>
    <img src='img/img_heart2.jpg'>  
    ${songs[index].name} - ${songs[index].singer}
    </div>`
});
  favouriteSongList.innerHTML=favHtmls.join('');
}
  const favChoosen=$$('.fav');
  favChoosen.forEach(favSong=>{
      const favSongIndex=Number(favSong.getAttribute('index'))
      favSong.onclick=function(){
          currentSongIndex =favSongIndex;
          loadAndSave();
      }
  })
  // console.log(favouriteArray)
}

$('.icon-bar').onclick = function() {
  $('.music__menu-bar').classList.remove('none');
}
  
  $('.music__menu-out').onclick = function() {
  $('.music__menu-bar').classList.add('none');
}
// Scroll to the top of the page
function scrollToActiveSong(){
  setTimeout(() =>{
    $('.music__song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    })
  },1000)
};  


////phần khuếch đại âm thanh

//gắn sự kiện thay đổi nút kéo thì thay đổi giá trị của sliderInput
btnInputMusics.forEach(function(btnInputMusic, index) {
  const sliderInput = sliderInputs[index];
  btnInputMusic.oninput = function() {
  sliderInput.innerHTML = this.value;
}
});



// Gắn sự kiện input vào thay đổi âm lượng
volumeInput.addEventListener('input', function() {
  var volume = ((volumeInput.value) /100);
  sound.volume(volume);
});


function updateGain(gain) {
  audioCtx = Howler.ctx;
  var gainNode = audioCtx.createGain();
  gainNode.gain.value = gain;
  analyser.disconnect();
  analyser.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  analyser.connect(audioCtx.destination);
}

// Gắn sự kiện input vào mức độ khuếch đại
  gainInput.addEventListener('input', function() {
    // audioCtx = Howler.ctx;
    // var gainNode = audioCtx.createGain();
    var gain = parseFloat(gainInput.value);
    // gainNode.gain.value = gain;
    // sound._sounds[0]._node.disconnect(0);
    // sound._sounds[0]._node.connect(gainNode);
    // gainNode.connect(audioCtx.destination);
    updateGain(gain);
    // biquadFilterNode.gain.value = gain;

  });

// găn sự kiện input vào thay đổi âm thanh nổi giữa 2 bên trái,  phải
stereoInput.addEventListener('input', function(){
  var stereo = parseFloat(stereoInput.value);
  sound.stereo(stereo);
});

//thay doi toc do bai hat
speedInput.addEventListener('input', function(){
  var speed = parseFloat(speedInput.value);
  sound.rate(speed);
});


//tạo dải tần số dạng sóng
const waveformCanvas = document.getElementById('waveformCanvas');
var ctxx = waveformCanvas.getContext('2d');
// Khởi tạo Analyser và cấu hình
var analyser = Howler.ctx.createAnalyser();
Howler.masterGain.connect(analyser);
analyser.connect(Howler.ctx.destination);
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
  // Vẽ dải tần số dạng sóng
  function drawWaveform() {
    requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    ctxx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    ctxx.lineWidth = 2;
    ctxx.strokeStyle = 'rgb(255, 255, 255)';
    ctxx.beginPath();

    var sliceWidth = waveformCanvas.width * 1.0 / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * waveformCanvas.height / 2;

      if (i === 0) {
        ctxx.moveTo(x, y);
      } else {
        ctxx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctxx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
    ctxx.stroke();
  }

drawWaveform();

//vẽ spectrogram

console.clear();

  // let animationId = null;
  // let currentAnalyser = null;
  currentAnalyser = sound._sounds[0]._node.context.createAnalyser();//tạo một đối tượng Analyser cho việc phân tích âm thanh
  currentAnalyser.fftSize = 1024;// đặt kích thước FFT (Fast Fourier Transform) của đối tượng Analyser là 1024. Kích thước FFT ảnh hưởng đến độ phân giải của phân tích tần số.

  sound._sounds[0]._node.connect(currentAnalyser);//kết nối nút âm thanh trong đối tượng sound với đối tượng Analyser

  CTX.fillStyle = 'hsl(280, 100%, 10%)';// đặt giá trị màu nền cho ngữ cảnh vẽ Canvas
  CTX.fillRect(0, 0, W, H);// vẽ một hình chữ nhật bằng cách sử dụng màu nền đã đặt

  startAnimation();


  function startAnimation() {
    if (!animationId) {
      updateCanvas();
  }
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
  }
  }

  function updateCanvas() {
    let imgData = CTX.getImageData(1, 0, W - 1, H);// lấy dữ liệu hình ảnh từ canvas,lấy dữ liệu từ phần tử thứ 2 của hàng đầu tiên đến phần tử cuối cùng của hàng cuối cùng.
    CTX.fillRect(0, 0, W, H);
    CTX.putImageData(imgData, 0, 0);// vẽ lại dữ liệu hình ảnh (imgData) lên canvas từ vị trí (0, 0). Điều này đảm bảo rằng dữ liệu hình ảnh từ các cột (1 đến W - 1) sẽ được dịch chuyển về bên trái một cột và vẽ lại trên canvas.
    const DATA = new Uint8Array(currentAnalyser.frequencyBinCount);//đặt dữ liệu là một mảng dữ liệu âm thanh đại diện cho số lượng bin tần số trong phân tích. Mảng này sẽ chứa dữ liệu tần số từ phân tích.
    const LEN = DATA.length;
    const h = H / LEN;//tính toán chiều cao của mỗi bin tần số trên canvas 
                      // chiều cao của canvas (H) , LEN (số lượng bin tần số).
    const x = W - 1; //W: chiều rộng của canvas
    currentAnalyser.getByteFrequencyData(DATA);//lấy dữ liệu tần số từ đối tượng Analyser (ANALYSER) và lưu trữ nó trong mảng DATA
    for (let i = 0; i < LEN; i++) {//duyệt qua các phần tử trong mảng DATA để vẽ các đường kẻ trên canvas.
        let rat = DATA[i] / 255;//tính toán tỷ lệ (rat) của giá trị tần số hiện tại (DATA[i]) trên tổng giá trị tối đa (255). Điều này chuyển đổi giá trị tần số từ khoảng 0-255 sang một phạm vi từ 0-1.
        let hue = Math.round((rat * 120) + 280 % 360);// tính toán giá trị màu sắc (hue) dựa trên tỷ lệ tần số (rat)
                                                      //Nó sử dụng một phép tính để đưa giá trị tần số về khoảng màu hsl từ 280-400, và sau đó áp dụng phép chia lấy dư với 360 để đảm bảo giá trị hue nằm trong khoảng từ 0-359.
        let sat = '100%'; //đặt độ bão hòa của màu sắc là 100%
        let lit = 10 + (70 * rat) + '%'; //tính toán giá trị độ sáng (lightness) của màu sắc dựa trên tỷ lệ tần số (rat). Nó áp dụng một công thức để đưa giá trị lit từ 10% đến 80% dựa trên tỷ lệ tần số.
        CTX.beginPath();//bắt đầu một đường path mới trên canvas.=>đảm bảo rằng mỗi đường kẻ sẽ được vẽ như một path riêng biệt.
        CTX.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;//đặt màu vẽ cho mỗi bin
        CTX.moveTo(x, H - (i * h));// di chuyển đến một điểm trên canvas 
        CTX.lineTo(x, H - (i * h + h));//tạo một đường thẳng từ điểm hiện tại đến một điểm mới trên canvas. Điểm mới có tọa độ (x, H - (i * h + h)), trong đó x là giá trị cố định đã được định nghĩa trước và (i * h + h) đại diện cho vị trí dọc tiếp theo trên canvas dựa trên giá trị i và h.
        CTX.stroke();//vẽ đường kẻ trên canvas 
    }
    animationId = requestAnimationFrame(updateCanvas);
}

// Initialize the music sound
function initMusicSound() {

  loadConfig();

  renderSong(songs[currentSongIndex]);  
  favouriteSave();
  favouriteHandle();
  // loadAndSave();
  playPauseSeek();


  btnNext.addEventListener('click', function() {
    if(isRandom == true){
      playRandom();
    }else{
      playNext();
    }
    scrollToActiveSong();
  });

  btnPrev.addEventListener('click', function(){
    if(isRandom == true){
      playRandom();
    }else{
      playPrevious();
    }
    scrollToActiveSong();      
  });
}

// Initialize the music sound when the DOM is ready
document.addEventListener('DOMContentLoaded', initMusicSound);
  