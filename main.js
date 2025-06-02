//Function to toggle icons
const arrowBtn = document.getElementById('arrowBtn');
const rightArrow = document.querySelector('.icon-right');
const leftArrow = document.querySelector('.icon-left');
const screenState = document.querySelector('.screen')
const full = document.querySelector('.full')
const windowed = document.querySelector('.windowed')
arrowBtn.addEventListener('click', () => togglebtn(leftArrow, rightArrow));
screenState.addEventListener('click', () => togglebtn(full, windowed));

function togglebtn(svg1, svg2){
    if (svg1.style.display === 'none') {
        svg1.style.display = 'inline';
        svg2.style.display = 'none';
    } else {
        svg1.style.display = 'none';
        svg2.style.display = 'inline';
    }
}

//Full screen
const body = document.querySelector('body')
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    // If not in fullscreen, enter fullscreen
    document.body.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    // If already in fullscreen, exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

//Close&Open Menu
const aside = document.querySelector('aside')
let sideBar = true
function toggleMenu(){
    if(sideBar){
        aside.style.display = "none";
        sideBar = false
    }else{
        aside.style.display = "block";
        sideBar = true
    }
}
//Header btns
const btns = document.querySelectorAll('.header-btn')
const jsonBtn = document.querySelector('.json-btn')
const helpBtn = document.querySelector('.help-btn')
const jsonContent = document.querySelector('.json')
const helpContent = document.querySelector('.help')

btns.forEach(btn => {
  btn.addEventListener('click', () => {
    const currentActive = document.querySelector('.header-btn.active');
    if (currentActive) {
      currentActive.classList.remove('active');
    }
    btn.classList.add('active');
  });
});

jsonBtn.addEventListener('click', ()=>{asideContent(jsonContent, helpContent)})
helpBtn.addEventListener('click', ()=>{asideContent(helpContent, jsonContent)})
function asideContent(block, none){
      block.style.display = 'block';
      none.style.display = 'none';
}

