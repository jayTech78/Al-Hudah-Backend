const bookModel = require('../models/book.model')

const addBook = async (req, res) => {
    const { name, price } = req.body
    const bookId = Math.floor(Math.random() * 10e5)
    const bookObj = {
        bookId,
        name,
        price
    }
    let form = await new bookModel(bookObj)
    form.save(bookObj)
    .then(()=>{
        res.send({status:true, message:'Book Added Successfully'})
    })
    .catch((error)=>
    {
        res.send({status:true, message:'There was an error'+error})
    })
}
const findBookById= async(req,res)=>
{
    const {bookId} = req.body
    const findBook = await bookModel.find({bookId})
    return (findBook)
}
const updateBook = async(req,res)=>
{
    const {bookId} =  req.body
    // console.log(req.body)
    await bookModel.findOneAndUpdate({bookId},
        {
            name: req.body.name,
            price: req.body.price
        }
    )
    .then((book)=>
    {
        if(book)
        {
            res.send({status:true, message:'Updated Succesfully'})
        }
        else{
            res.send({status:false, message:'Can not Update'})
        }
    }).catch((error)=>
    {
        res.send({status:true, message: error})
    })
}
const deleteBook = async(req, res)=>
{
    const{bookId}= req.body
    await bookModel.findOneAndDelete({ bookId }).then(() => {
        res.send({ status: true, message: 'Deleted Successfully!!!' })
    });
}
const getBooks = async (req, res)=>
{
    const books = await bookModel.find()
    if(books)
    {
        res.send({status:true,books})
    }else
    {
        req.send({status:false, message:'No Book Has Been Added'})
    }
}

module.exports= {getBooks,addBook,findBookById,updateBook,deleteBook}