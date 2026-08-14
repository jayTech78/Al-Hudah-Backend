const mongoose = require ("mongoose")
let bookSchema = mongoose.Schema
({
    bookId: {type:String, required: true},
    name: {type:String, required: true},
    price: {type:String, required: true}
})

let bookModel = mongoose.model("book", bookSchema);
module.exports = bookModel;