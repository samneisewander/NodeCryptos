let cryptos

$.get('/filter', (data) => {
  cryptos = JSON.parse(data)
  for (let i = 0; i < cryptos.length; i++) {
    let newOne = document.createElement("canvas")
    let newCtx = newOne.getContext('2d')
    let newDiv = document.createElement("div")
    let newName = document.createElement("div")
    let newArtist = document.createElement("div")
    let newGrade = document.createElement("div")
    let newApprove = document.createElement("button")
    let newDeny = document.createElement("button")
    newApprove.innerHTML = "Approve"
    newDeny.innerHTML = "Deny"
    document.body.appendChild(newDiv)
    newDiv.appendChild(newOne)
    newOne.height = 24 * 10
    newOne.width = 24 * 10
    for (let row in cryptos[i].dat) {
      for (let col in cryptos[i].dat[row]) {
        newCtx.beginPath()
        newCtx.fillStyle = cryptos[i].dat[row][col] ? cryptos[i].dat[row][col] : "transparent"
        newCtx.fillRect(row * 10, col * 10, 10, 10)
      }
    }
    newDiv.appendChild(newName)
    newDiv.appendChild(newArtist)
    newDiv.appendChild(newGrade)
    newDiv.appendChild(newApprove)
    newDiv.appendChild(newDeny)
    newName.innerHTML = cryptos[i].name
    newArtist.innerHTML = cryptos[i].artist
    newGrade.innerHTML = "grade: " + cryptos[i].grade
    newDiv.style.display = "inline-block"
    newDiv.style.margin = "25px"

    newApprove.onclick = () => {
      $.ajax({
        url: '/approve',
        type: "POST",
        data: JSON.stringify({ data: cryptos, approved: true, item: (cryptos.splice(i, 1))[0] }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function() {
          //
        }
      })
      removeAllChildNodes(newDiv)
      removeAllChildNodes(newOne)
    }
    newDeny.onclick = () => {
      $.ajax({
        url: '/approve',
        type: "POST",
        data: JSON.stringify({ data: cryptos, approved: false, item: (cryptos.splice(i, 1))[0] }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      removeAllChildNodes(newDiv)
      removeAllChildNodes(newOne)
    }
  }
})

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}