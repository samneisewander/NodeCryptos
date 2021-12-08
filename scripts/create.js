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


//Color picker library for future use

const pickr = Pickr.create({
  el: '.color-picker',
  theme: 'classic',
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
  }
})

pickr.swatches = 0

pickr.on('save', (e) => {
  pickr.swatches++
  if (pickr.swatches >= 15) {
    pickr.removeSwatch(0)
  }
  pickr.addSwatch(pickr.getColor().toRGBA().toString())
})

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
  let artist = prompt('Enter your Name.')
  let grade = prompt('Enter your grade. (9, 10, 11, or 12)')
  let valid = ["9", "10", "11", "12"]
  if(!valid.includes(grade)){
    alert('Invalid grade. Please try again.')
    return false
  }
  $.ajax ({
    url: '/submit',
    type: "POST",
    data: JSON.stringify({"name": name, "artist": artist, "grade": grade, "dat": data }),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: function(){
        //
    }
  })
}