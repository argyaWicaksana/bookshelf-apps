const bookList = []
const RENDER_EVENT = 'render-book'
const RENDER_SEARCH = 'render-search-book'
const RENDER_EDIT = 'render-edit-book'
const STORAGE_KEY = 'BOOKSHELF_APPS'

document.addEventListener('DOMContentLoaded', ()=> {
    const submitForm = document.querySelector('#inputBook')
    const searchForm = document.querySelector('#searchBook')
    const checkbox = document.querySelector("#inputBookIsComplete")
    
    checkbox.addEventListener('change', ()=>{
        if (checkbox.checked) {
            document.querySelector('span').innerText = 'Selesai dibaca'
        } else {
            document.querySelector('span').innerText = 'Belum selesai dibaca'
        }
    })

    submitForm.addEventListener('submit', (event)=> {
        event.preventDefault()
        addBook()
    })

    searchForm.addEventListener('submit', (event)=>{
        event.preventDefault()
        document.dispatchEvent(new Event(RENDER_SEARCH))
    })

    if (isStorageExist()) loadDataFromStorage()
})

function isStorageExist(){
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage')
    return false
  }
  return true
}

function addBook() {
    const bookTitle = document.querySelector('#inputBookTitle').value
    const bookAuthor = document.querySelector('#inputBookAuthor').value
    const bookYear = document.querySelector('#inputBookYear').value
    const isComplete = document.querySelector('#inputBookIsComplete').checked
    
    const idBook = () => +new Date()
    const bookObject = generateBookObject(idBook(), bookTitle, bookAuthor, bookYear, isComplete)
    bookList.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function generateBookObject(id, title, author, year, isComplete) {
    return { id, title, author, year, isComplete}
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookList)
        localStorage.setItem(STORAGE_KEY, parsed)
    }    
}

document.addEventListener(RENDER_EVENT, ()=>{
    const uncompletedBookList = document.querySelector('#incompleteBookshelfList')
    uncompletedBookList.innerHTML = ''

    const completedBookList = document.querySelector('#completeBookshelfList')
    completedBookList.innerHTML = ''
 
    for (const book of bookList) {
        const bookElement = makeBook(book)
        if (!book.isComplete) uncompletedBookList.append(bookElement)
        else completedBookList.append(bookElement)
    }
})

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3')
    bookTitle.innerText = bookObject.title

    const bookAuthor = document.createElement('p')
    bookAuthor.innerText = `Penulis: ${bookObject.author}`

    const bookYear = document.createElement('p')
    bookYear.innerText = `Tahun: ${bookObject.year}`

    const btnGreen = document.createElement('button')
    btnGreen.classList.add('green')

    const btnRed = document.createElement('button') 
    btnRed.classList.add('red')
    btnRed.innerText = 'Hapus buku'
    btnRed.addEventListener('click', ()=> removeBook(bookObject.id))

    const btnBlue = document.createElement('button')
    btnBlue.classList.add('blue')
    btnBlue.innerText = 'Edit'
    btnBlue.addEventListener('click', ()=> renderEdit(bookObject.id))

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('action')
    btnContainer.append(btnGreen, btnRed, btnBlue)

    const article = document.createElement('article')
    article.classList.add('book_item')
    article.setAttribute('id', `id-${bookObject.id}`)
    article.append(bookTitle, bookAuthor, bookYear, btnContainer)

    if(bookObject.isComplete) {
        btnGreen.innerText = 'Belum selesai dibaca'
        btnGreen.addEventListener('click', ()=> undoBookFromCompleted(bookObject.id))
    }
    else {
        btnGreen.innerText = 'Selesai dibaca'
        btnGreen.addEventListener('click', ()=> addBookToCompleted(bookObject.id))
    }

    return article
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId)
    
    if (bookTarget == null) return
    
    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId)
    
    if (bookTarget == null) return
    
    bookTarget.isComplete = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId)

    if(bookTarget == -1) return

    bookList.splice(bookTarget, 1)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function findBook(bookId) {
    for (const book of bookList) {
        if(book.id === bookId) return book
    }
    return null
}

function findBookIndex(bookId) {
    for (const index in bookList) {
        if(bookList[index].id === bookId) return index
    }
    return -1
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY)
    let dataBook = JSON.parse(serializedData)
    
    if (dataBook !== null) {
        for (const book of dataBook) {
            bookList.push(book)
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT))
}

function searchBook(bookTitle) {
    const books =[]
    for (const book of bookList) {
        if(book.title.includes(bookTitle)) books.push(book)
    }
    return books
}

document.addEventListener(RENDER_SEARCH, ()=>{
    const bookTitle = document.querySelector('#searchBookTitle').value
    const books = searchBook(bookTitle)

    const uncompletedBookList = document.querySelector('#incompleteBookshelfList')
    uncompletedBookList.innerHTML = ''

    const completedBookList = document.querySelector('#completeBookshelfList')
    completedBookList.innerHTML = ''

    for (const book of books) {
        const bookElement = makeBook(book)
        if (!book.isComplete) uncompletedBookList.append(bookElement)
        else completedBookList.append(bookElement)
    }
})

function renderEdit(bookId){
    const container = document.querySelector(`#id-${bookId}`)
    const book = findBook(bookId)
    const editForm = document.createElement('form')
    container.innerHTML = ''

    const inputTitle = document.createElement('input')
    inputTitle.setAttribute('type', 'text')
    inputTitle.setAttribute('id', 'editTitle')
    inputTitle.setAttribute('value', book.title)
    inputTitle.style.display = 'block'

    const inputAuthor = document.createElement('input')
    inputAuthor.setAttribute('type', 'text')
    inputAuthor.setAttribute('id', 'editAuthor')
    inputAuthor.setAttribute('value', book.author)
    inputAuthor.style.display = 'block'

    const inputYear = document.createElement('input')
    inputYear.setAttribute('type', 'number')
    inputYear.setAttribute('id', 'editYear')
    inputYear.setAttribute('value', book.year)
    inputYear.style.display = 'block'

    const save = document.createElement('button')
    save.setAttribute('type', 'submit')
    save.classList.add('green')
    save.innerText = 'Save'

    const cancel = document.createElement('button')
    cancel.classList.add('red')
    cancel.addEventListener('click', ()=> document.dispatchEvent(new Event(RENDER_EVENT)))
    cancel.innerText = 'Cancel'

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('action')
    btnContainer.append(save, cancel)

    editForm.append(inputTitle, inputAuthor, inputYear, btnContainer)
    container.append(editForm)

    editForm.addEventListener('submit', (event)=>{
        event.preventDefault()
        editBook(bookId)
  })
}

function editBook(bookId) {
    const targetIndex = findBookIndex(bookId)
    console.log(bookList[targetIndex])
    bookList[targetIndex].title = document.querySelector('#editTitle').value
    bookList[targetIndex].author = document.querySelector('#editAuthor').value
    bookList[targetIndex].year = document.querySelector('#editYear').value
    console.log('tess')
    console.log(bookList[targetIndex])

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}
