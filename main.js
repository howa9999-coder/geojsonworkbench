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

 function addColumn() {
    const headerRow = document.querySelector('#headerRow');
    if (!headerRow) return;

    const colIndex = headerRow.cells.length - 1;
    const newHeader = document.createElement('th');
    newHeader.innerHTML = `<input type="text" placeholder="Column ${colIndex + 1}" oninput="renameHeader(this, ${colIndex})"> 
`;
    headerRow.insertBefore(newHeader, headerRow.lastElementChild);

    const rows = document.querySelectorAll('#popupTable tbody tr');
    rows.forEach(row => {
      const newCell = document.createElement('td');
      newCell.contentEditable = "false";
      row.insertBefore(newCell, row.lastElementChild);
    });
  }

  function renameHeader(input, index) {
    input.placeholder = input.value || `Column ${index + 1}`;
  }

  function toggleEdit(button) {
    const row = button.closest('tr');
    const isEditing = row.classList.toggle('edit-mode');
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, i) => {
      if (i < cells.length - 1) {
        cell.contentEditable = isEditing;
      }
    });
    button.textContent = isEditing ? 'Save' : 'Edit';
  }

/* 
function deleteColumn(button) {
  const th = button.closest('th'); // find the column header
  const headerRow = th.parentElement;
  const thIndex = Array.from(headerRow.children).indexOf(th);

  // Remove the header cell
  th.remove();

  // Remove the corresponding cell in each row
  const table = button.closest('table');
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cell = row.children[thIndex];
    if (cell) cell.remove();
  });

  // Optionally: update column indices in header inputs
  const inputs = headerRow.querySelectorAll('input');
  inputs.forEach((input, i) => {
    input.setAttribute('oninput', `renameHeader(this, ${i})`);
  });
} */
