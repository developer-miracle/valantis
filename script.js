const API_URI = 'http://api.valantis.store:40000/'
const PASSWORD = 'Valantis'
const ITEMS_PER_PAGE = 50

const idList = []
let currengPage = 1

function getIds(callback) {
    const xAuthValue = generateXAuth(PASSWORD)

    fetch(API_URI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': xAuthValue
        },
        body: JSON.stringify({
            "action": "get_ids"
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        })
        .then(data => {
            if (!data.result) throw new Error('Data is empty')
            callback(data.result)
        })
        .catch(error => {
            console.error('Error: ', error)
        })
}

async function fetchItemsById(ids, callback) {
    const xAuthValue = generateXAuth(PASSWORD)

    await fetch(API_URI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth': xAuthValue
        },
        body: JSON.stringify({
            "action": "get_items",
            "params": { "ids": ids }
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        })
        .then(data => {
            if (!data.result) throw new Error('Data is empty')
            callback(data.result)
        })
        .catch(error => {
            console.error('Error: ', error)
        })
}

function generateXAuth(password) {
    const timestamp = getCurrentDate()
    const xAuthString = password + '_' + timestamp
    const xAuth = CryptoJS.MD5(xAuthString).toString()
    return xAuth
}

function getCurrentDate() {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = now.getUTCDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
}

function displayPagination(idList) {
    let elementPagination = document.getElementById('pagination')
    if (!elementPagination) return

    let pages = Math.ceil(idList.length / ITEMS_PER_PAGE)

    for (let i = 1; i < pages; i++) {
        let buttonPage = document.createElement('button')
        buttonPage.textContent = i
        buttonPage.addEventListener('click', () => displayPage(i))
        elementPagination.appendChild(buttonPage)
    }
}

function displayPage(numberPage) {
    let elementItemList = document.getElementById('item-list')
    if (!elementItemList) return

    currengPage = numberPage

    let offset = (numberPage - 1) * ITEMS_PER_PAGE
    let ids = idList.slice(offset, offset + ITEMS_PER_PAGE)

    fetchItemsById(ids, data => {
        // Приводим к уникальному массиву
        let uniqueIds = {}
        data.forEach(function (obj) {
            if (!uniqueIds[obj.id]) uniqueIds[obj.id] = obj
        })
        let uniqueArray = Object.values(uniqueIds)

        // Вставка в разметку
        elementItemList.innerHTML = ''
        for (let index = 0; index < uniqueArray.length; index++) {
            const element = uniqueArray[index]
            let murkup = `<div class="item-container">
            <div class="">Id: ${element?.id}</div>
            <div class="">Title: ${element?.product}</div>
            <div class="">Price: ${element?.price}</div>
            <div class="">Brand: ${element?.brand}</div>
            </div>`
            elementItemList.innerHTML += murkup
        }
    })
}

document.addEventListener("DOMContentLoaded", () => {
    getIds(ids => {
        idList.push(...ids)
        displayPagination(idList)
        console.log(idList)
        displayPage(1)
    })


})