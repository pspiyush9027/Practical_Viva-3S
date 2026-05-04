import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    StockName: {
        type:String,
        required:true,
        trim:true,
        maxlength:100
    },
    StockSymbol: { 
        type:String,
        required:true,
        trim:true,
        uppercase:true,
        unique:true,
        maxlength:20
    },
    CurrentPrice: {
        type:Number,
        required:true,
        min:0
    },
    Sector: {
        type:String,  
        trim:true,
        default:''
    },
    isActive:{
        type:Boolean,
        default:true

    },
},
{
    timestamps:true
}
);
export default mongoose.models.Stock || mongoose.model('Stock', stockSchema); 




