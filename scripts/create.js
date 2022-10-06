

//Canvas Init
const artwork = document.querySelector('#artwork')
const artworkCtx = artwork.getContext('2d')
//Flags
let brushActive = true
let dropperActive = false
let gridActive = true
let dragging = false
let rtDragging = false
//Canvas Dimentional Vars and Data Array
let highlight //Array of tile coordinates that mouse is currently in
const dims = 24 //width and height of canvas in pixels
const tileScale = artwork.width / dims //Width and height of canvas "pixels" in actual pixels
let data = [] //2d array of pixel colors
for (let col = 0; col < dims; col++) {
  data.push([])
  for (let row = 0; row < dims; row++) {
    data[col].push(null)
  }
}

//Init Draw Becasue Otherwise Everything Breaks
let draw = function () {
  //Step 1: Clear
  artworkCtx.clearRect(0, 0, artwork.width, artwork.height)

  //Step 2: Draw Picture
  for (let col = 0; col < dims; col++) {
    for (let row = 0; row < dims; row++) {
      if (data[col][row] == null) continue
      artworkCtx.fillStyle = data[col][row]
      artworkCtx.fillRect((col * tileScale), (row * tileScale), tileScale, tileScale)
    }
  }

  //Step 3: Draw Grid
  if (gridActive) {
    artworkCtx.strokeStyle = '#919191'
    artworkCtx.lineWidth = 1
    for (let col = 1; col < 24; col++) {
      artworkCtx.beginPath()
      artworkCtx.moveTo(col * tileScale, 0)
      artworkCtx.lineTo(col * tileScale, artwork.width)
      artworkCtx.stroke()
    }
    for (let row = 1; row < 24; row++) {
      artworkCtx.beginPath()
      artworkCtx.moveTo(0, row * tileScale)
      artworkCtx.lineTo(artwork.height, row * tileScale)
      artworkCtx.stroke()
    }
  }

  //Step 4: Highlight Current Tile 
  if (highlight) {
    artworkCtx.strokeStyle = pickr.getColor().toHEXA().toString()
    artworkCtx.lineWidth = 3
    artworkCtx.strokeRect((highlight[0] * tileScale), (highlight[1] * tileScale), tileScale, tileScale)
  }
}

//Picker Init
const pickr = Pickr.create({
  el: '#pickr',
  theme: 'monolith',
  swatches: [
    '#FFFFFF00'
  ],
  showAlways: true,
  inline: true,
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: false,
      rgba: false,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: true,
      clear: false,
      save: true
    }
  },
  default: '#000000'
})
pickr.swatches = 0
pickr.on('save', e => {
  pickr.swatches++
  if (pickr.swatches >= 16) {
    pickr.removeSwatch(0)
  }
  pickr.addSwatch(pickr.getColor().toRGBA().toString())
})

//Switch Listeners
const trashSwitch = document.querySelector('#body #container #sidebar #switches #delete')
trashSwitch.addEventListener('dblclick', e => { e.preventDefault(); clearData() })
const gridSwitch = document.querySelector('#body #container #sidebar #switches #toggle-grid')
gridSwitch.addEventListener('click', () => { gridActive = !gridActive; draw() })
const dropperSwitch = document.querySelector('#body #container #sidebar #switches #dropper')
dropperSwitch.addEventListener('click', () => {
  if (dropperActive) {
    dropperActive = false
    dropperSwitch.style.color = '#FFFFFF'
  }
  else {
    dropperActive = true
    dropperSwitch.style.color = 'rgb(42, 253, 253)'
  }
})
document.addEventListener('keydown', e => {
  if (e.key == 'Escape') {
    dropperActive = false
    dropperSwitch.style.color = '#FFFFFF'
  }
})

//Button Listeners
const saveBtn = document.querySelector('#body #container #sidebar #buttons #save')
saveBtn.addEventListener('click', e => { save() })
const mintBtn = document.querySelector('#body #container #sidebar #buttons #mint')
mintBtn.addEventListener('click', e => { submit() })

//Canvas Listeners
artwork.addEventListener('mousedown', e => {
  if (e.button == 0) dragging = true
  else if (e.button == 2) rtDragging = true

})
artwork.addEventListener('mouseup', e => {
  dragging = false
  rtDragging = false
})
artwork.addEventListener('mousemove', e => {
  highlight = [(Math.floor(e.offsetX / tileScale)), (Math.floor(e.offsetY / tileScale))]
  if (dragging) data[Math.floor(e.offsetX / tileScale)][Math.floor(e.offsetY / tileScale)] = pickr.getColor().toHEXA().toString()
  else if (rtDragging) data[Math.floor(e.offsetX / tileScale)][Math.floor(e.offsetY / tileScale)] = null
  requestAnimationFrame(draw)
})
artwork.addEventListener('mouseleave', e => {
  dragging = false
  highlight = null
  requestAnimationFrame(draw)
})
artwork.addEventListener('click', e => {
  if (dropperActive) {
    pickr.setColor(data[Math.floor(e.offsetX / tileScale)][Math.floor(e.offsetY / tileScale)], true)
    dropperActive = false
    dropperSwitch.style.color = '#FFFFFF'
  }
  else data[Math.floor(e.offsetX / tileScale)][Math.floor(e.offsetY / tileScale)] = pickr.getColor().toHEXA().toString()
  requestAnimationFrame(draw)
})
artwork.addEventListener('contextmenu', e => {
  e.preventDefault()
  data[Math.floor(e.offsetX / tileScale)][Math.floor(e.offsetY / tileScale)] = null
  requestAnimationFrame(draw)
})

function clearData() {
  for (let col = 0; col < dims; col++) {
    for (let row = 0; row < dims; row++) {
      data[col][row] = null
    }
  }
  draw()
}

function download() {
  gridActive = false
  draw()
  window.open(artwork.toDataURL('image/png'))
    var a  = document.createElement('a');
    a.href = artwork.toDataURL('png');
    a.download = 'image.png';
    a.click()
}

function submit(){
  let gridState = gridActive
  gridActive = false
  draw()
  let name = prompt('Enter the name of your cryptoCOMET')
  $.ajax ({
    url: '/submit',
    type: "POST",
    data: JSON.stringify({"name": name, "dat": data , "png": artwork.toDataURL('image/png')}),
    dataType: "json",
    contentType: "application/json; charset=utf-8"
  })
  clearData()
  save()
  gridActive = gridState
  draw()
}

function save(){
  $.ajax({
    url: '/artwork',
    type: "POST",
    data: JSON.stringify({ data: data }),
    dataType: "json",
    contentType: "application/json; charset=utf-8"
  }).then(result => {
    console.log('Saved')
  })
}

//Initial Draw to Canvas
$.get('/artwork').then((result) => {
  if(result == null) return
  data = result
  draw()
})

draw()
/*

let can = document.querySelector("#artwork")
c  = can.getContext('2d')
let cellSize = 20 
let dims = 24
let color = "#000000"
let painting = false
let erasing = false
let on = false
let bars = document.querySelectorAll(".bar")
let [hue,sat,light] = [0,100,50]
let colorBank = []
let grabbing = false

let chue = bars[0].getContext('2d')
let csat = bars[1].getContext('2d')
let clight = bars[2].getContext('2d')

for(let h = 0; h < 360; h++){
  chue.beginPath()
  chue.rect(h*300/360,0,300/360,40)
  chue.fillStyle = "hsl("+h+","+sat+"%,"+light+"%)"
  chue.fill()
}
function drawBars(){
  for(let s = 0; s < 100; s++){
    csat.beginPath()
    csat.rect(s*300/100,0,300/100,40)
    csat.fillStyle = "hsl("+hue+","+s+"%,"+light+"%)"
    csat.fill()
  }
  for(let l = 0; l < 100; l++){
    clight.beginPath()
    clight.rect(l*300/100,0,300/100,40)
    clight.fillStyle = "hsl("+hue+","+sat+"%,"+l+"%)"
    clight.fill()
  }
}

drawBars()

let data = []
for(let i = 0; i<=dims;i++){
  let row = []
  for(let j = 0; j<=dims;j++){
    row.push(null)
  }
  data.push(row)
}


let [mx,my] = [-10,-10]

function draw(grid=true){
  c.clearRect(0,0,can.width,can.height)
  for(let i = 0; i<=dims;i++){
    for(let j = 0; j<=dims;j++){
      if(data[i][j]){
        c.beginPath()
        c.fillStyle = data[i][j]
        c.rect(i*cellSize,j*cellSize,cellSize,cellSize)
        c.fill()
      }
    }
  }
  if(grid){
    for(let j = 0; j<=dims;j++){
      c.beginPath()
      c.moveTo(j*cellSize,0)
      c.lineTo(j*cellSize,dims*cellSize)
      c.strokeStyle = "#666"
      c.stroke()
    } 
    for(let j = 0; j<=dims;j++){
      c.beginPath()
      c.moveTo(0,j*cellSize)
      c.lineTo(dims*cellSize,j*cellSize)
      c.strokeStyle = "#666"
      c.stroke()
    }
  }
  
  if(on) {
    c.beginPath()
    c.rect(mx*cellSize,my*cellSize,cellSize,cellSize)
    c.fillStyle = "#fc08"
    c.fill()
  }
}


draw()
window.onmousemove = (e) =>
{
  mx = e.pageX - can.offsetLeft
  my = e.pageY - can.offsetTop
  mx = Math.floor(mx/cellSize)
  my = Math.floor(my/cellSize)
  on = mx>-1 && mx< 24 && my>-1 && my <24
  draw()
  if(on && painting && !grabbing) if(typeof data[mx][my] != 'undefined' ) data[mx][my]=color
  if(on && erasing && !grabbing) if(typeof data[mx][my] != 'undefined' ) data[mx][my]=null
  document.body.style.background = "radial-gradient(circle at "+e.pageX+"px "+e.pageY+"px, white, #999)"
  document.querySelectorAll(".sideBar").forEach((item)=>item.style.background = "hsl(225,"+(100-Math.abs((400-e.pageY)/4))+"%,85%)")
}

function save2() {
    draw(false)
    window.open(can.toDataURL('image/png'));
    var gh = can.toDataURL('png');

    var a  = document.createElement('a');
    a.href = gh;
    a.download = 'image.png';

    a.click()
    draw()
}
window.onmousedown = (e) =>
{
  e.preventDefault()
  if(!grabbing && on && typeof data[mx][my] != 'undefined') 
  {
    if(e.button==0) 
    {
      painting = true;
      data[mx][my]=color
      addColor(color)
    }
    else if(e.button==2) 
    {
      erasing = true;
      data[mx][my]=null
    }
  }
  draw()
}
window.onmouseup = (e) =>
{
  e.preventDefault()
  painting = false;
  erasing = false
  if(grabbing && on){
    mx = e.pageX - can.offsetLeft
    my = e.pageY - can.offsetTop
    mx = Math.floor(mx/cellSize)
    my = Math.floor(my/cellSize)
    setColor( data[mx][my] )
    grabbing = false
    can.style.cursor = "auto"
  }
}
window.oncontextmenu = (e)=>{e.preventDefault()}

bars[0].onclick = (e)=>{
  hue = Math.round((e.pageX-e.target.offsetLeft)/480*360)
  drawBars()
  setColor("hsl("+hue+","+sat+"%,"+light+"%)")
}
bars[1].onclick = (e)=>{
  sat = Math.round((e.pageX-e.target.offsetLeft)/480*100)
  setColor("hsl("+hue+","+sat+"%,"+light+"%)")
}
bars[2].onclick = (e)=>{
  light = Math.round((e.pageX-e.target.offsetLeft)/480*100)
  setColor("hsl("+hue+","+sat+"%,"+light+"%)")
}

document.querySelectorAll('.color').forEach((item)=>{
  item.style.backgroundColor = "hsl(0,0%,0%)"
  item.onclick = (e)=>{
    setColor(item.style.backgroundColor)
  }
})
document.querySelector('#saveimage').onclick = (e)=>
{
  save2()
}
document.querySelector('#savevector').onclick = (e)=>
{
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS(null,"id","svgDoc");
  svg.setAttributeNS(null,"height",24*cellSize);
  svg.setAttributeNS(null,"width",24*cellSize);
	
  for(ri in data){
    for(ci in data[ri])
    {
      if(data[ri][ci]) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x',ri*cellSize);
        rect.setAttribute('y',ci*cellSize);
        rect.setAttribute('width',cellSize);
        rect.setAttribute('height',cellSize);
        rect.setAttribute('fill',data[ri][ci]);
        svg.appendChild(rect);
      }
    }
  }

  var a  = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([svg.outerHTML], {type:"image/svg+xml;charset=utf-8"}))
  a.download = 'image.svg'

  a.click()
  
}
document.querySelector('#clear').onclick = (e)=>
{
  data = []
  for(let i = 0; i<=dims;i++){
    let row = []
    for(let j = 0; j<=dims;j++){
      row.push(null)
    }
    data.push(row)
  }
  draw()
}
document.querySelector('#save').onclick = (e)=>
{
  navigator.clipboard.writeText(JSON.stringify({dat:data}));
  let output = document.querySelector("#output")
  output.innerHTML = JSON.stringify({dat:data})
  console.log(JSON.stringify({dat:data}))
  alert("data copied!")
}
document.querySelector('#load').onclick = (e)=>
{
  let code = prompt("enter saved data string")
  data = JSON.parse(code).dat
  draw()
}

function addColor(col){
  let temp = []
  for (ci in colorBank){
    if(col == colorBank[ci]) {
      dup = true
    }
    else{
      temp.push(colorBank[ci])
    }
  }
  temp.unshift(col)
  colorBank = temp
  fillInColors()
}

function fillInColors(){
  let boxes = document.querySelectorAll(".color")
  for (col in colorBank){
    if(col < 24) boxes[col].style.background = colorBank[col]
  }
}



document.querySelector("#paintbrush").onclick = (e)=>{
  grabbing = false
  can.style.cursor = "auto"
}

document.querySelector("#dropper").onclick = (e)=>{
  grabbing = true
  can.style.cursor = "pointer"
}
function setColor(col){
  document.querySelector("#previewColor").style.background = col
  color = col
}

function submit(){
  let name = prompt('Enter the name of your cryptoCOMET')
  draw(false)
  $.ajax ({
    url: '/submit',
    type: "POST",
    data: JSON.stringify({"name": name, "dat": data , "png": can.toDataURL('image/png')}),
    dataType: "json",
    contentType: "application/json; charset=utf-8"
  })
}
*/