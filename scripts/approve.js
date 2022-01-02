let cryptoDiv = document.getElementById('cryptos')
let usersDiv = document.getElementById('users')
let cryptotab = document.getElementById('ctab')
let usertab = document.getElementById('utab')

$.ajax({
  url: '/filter',
  type: 'post',
  data: JSON.stringify({ type: 'crypto' }),
  contentType: 'application/json'
}).then(cryptos => {
  for (let crypto of cryptos) {
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
    cryptoDiv.appendChild(newDiv)
    newDiv.appendChild(newOne)
    newOne.height = 24 * 10
    newOne.width = 24 * 10
    for (let row in crypto.dat) {
      for (let col in crypto.dat[row]) {
        newCtx.beginPath()
        newCtx.fillStyle = crypto.dat[row][col] ? crypto.dat[row][col] : "transparent"
        newCtx.fillRect(row * 10, col * 10, 10, 10)
      }
    }
    newDiv.appendChild(newName)
    newDiv.appendChild(newArtist)
    newDiv.appendChild(newGrade)
    newDiv.appendChild(newApprove)
    newDiv.appendChild(newDeny)
    newName.innerHTML = crypto.name
    newArtist.innerHTML = crypto.artist
    newGrade.innerHTML = "Grade: " + crypto.grade
    newDiv.style.display = "inline-block"
    newDiv.style.margin = "25px"

    newApprove.onclick = () => {
      $.ajax({
        url: '/approve',
        type: "POST",
        data: JSON.stringify({ type: 'crypto', crypto: crypto, approved: true }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      removeAllChildNodes(newDiv)
      removeAllChildNodes(newOne)
    }
    newDeny.onclick = () => {
      $.ajax({
        url: '/approve',
        type: "POST",
        data: JSON.stringify({ type: 'crypto', crypto: crypto, approved: false }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      removeAllChildNodes(newDiv)
      removeAllChildNodes(newOne)
    }
  }
})

$.ajax({
  url: '/filter',
  type: 'post',
  data: JSON.stringify({ type: 'user' }),
  contentType: 'application/json'
}).then(users => {
  for (let user of users) {
    let newDiv = document.createElement("div")
    let newName = document.createElement("div")
    let newGrade = document.createElement("div")
    let newApprove = document.createElement("button")
    let newDeny = document.createElement("button")
    newApprove.innerHTML = "Approve"
    newDeny.innerHTML = "Deny"
    usersDiv.appendChild(newDiv)
    newDiv.appendChild(newName)
    newDiv.appendChild(newGrade)
    newDiv.appendChild(newApprove)
    newDiv.appendChild(newDeny)
    newName.innerHTML = user.username
    newGrade.innerHTML = "Grade: " + user.grade
    newDiv.style.display = "inline-block"
    newDiv.style.margin = "25px"

    newApprove.onclick = () => {
      $.ajax({
        url: '/approve',
        type: "POST",
        data: JSON.stringify({ type: 'user', user: user, approved: true }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      removeAllChildNodes(newDiv)
    }
    newDeny.onclick = () => {
      $.ajax({
        url: '/approve',
        type: "POST",
        data: JSON.stringify({ type: 'user', user: user, approved: false }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      })
      removeAllChildNodes(newDiv)
    }
  }
})

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function ctab(){
  cryptoDiv.style.display = 'block'
  usersDiv.style.display = 'none'
  cryptotab.style.borderBottom = '2px solid rgb(0, 119, 255)'
  usertab.style.borderBottom = '2px solid rgba(255, 255, 255, 0)'
}

function utab(){
  cryptoDiv.style.display = 'none'
  usersDiv.style.display = 'block'
  cryptotab.style.borderBottom = '2px solid rgba(255, 255, 255, 0)'
  usertab.style.borderBottom = '2px solid rgb(0, 119, 255)'
}