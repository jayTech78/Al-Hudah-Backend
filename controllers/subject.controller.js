const subjectModel = require('../models/subject.model')

const addSubject = async (req, res) => {
    const { subject } = req.body
    const subjectId = Math.floor(Math.random() * 10e5)
    const subjectObj = {
        subjectId,
        subject
    }
    let form = await new subjectModel(subjectObj)
    form.save()
    .then(()=>{
        res.send({status:true, message:'Subject Added Successfully', newSubject:form})
    })
    .catch((error)=>
    {
        res.send({status:true, message:'There was an error'+error})
    })
}
const findSubjectById= async(req,res)=>
{
    const {feeId} = req.body
    const findFee = await feesModel.findOne({feeId})
    return (findFee)
}
const updateSubject = async(req,res)=>
{
    const {subjectId, subject} =  req.body
    await subjectModel.findOneAndUpdate({subjectId},{
        subject
    })
    .then((subject)=>
    {
        if(subject)
        {
            res.send({status:true, message:'Update Succesfully'})
        }
        else{
            res.send({status:false, message:'Can not Update'})
        }
    }).catch((error)=>
    {
        res.send({status:true, message: error})
    })
}
const deleteSubject = async(req, res)=>
{
    const{subjectId}= req.body
    await subjectModel.findOneAndDelete({ subjectId }).then(() => {
        res.send({ status: true, message: 'Deleted Successfully!!!' })
    });
    
}
const getSubjects = async (req, res)=>
{
    const subjects = await subjectModel.find()
    if(subjects)
    {
        res.send({status:true,subjects})
    }
    else{
        req.send({status:false,message:'There was an error'})
    }
}
module.exports= {getSubjects, addSubject,findSubjectById,updateSubject,deleteSubject}