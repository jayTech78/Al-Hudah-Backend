const express = require ("express")
const router = express.Router()
const {getBooks,addBook,findBookById,updateBook,deleteBook} = require("../controllers/book.controller")

router.post("/addBook", addBook)
router.post("/findBookById",findBookById)
router.post("/updateBook",updateBook)
router.post("/deleteBook",deleteBook)
router.get("/getBooks",getBooks)
module.exports = router