var today = new Date();
var options = {
    weekday : "long",
    day : "numeric" ,
    month : "long"
};
var day = today.toLocaleDateString("en-US" , options);


const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const { response } = require('express');
const mongoose = require('mongoose');
var dotenv = require('dotenv');
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine' , 'ejs');
app.use(express.static("public"));

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

const port = process.env.PORT || "3000";
app.set("port", port);
// app.listen(port);

app.listen(port,function(){
    console.log("Server started succesfully");
})
dotenv.config();
const url = process.env.MONGODB_URL;
mongoose.connect(url,{useNewUrlParser:true});
const itemsSchema = {
    name:String
};
const Item =  mongoose.model ("Item",itemsSchema);

const item1 = new Item({
    name : "ENTER YOUR TODO LIST"
});

const defaultItem = [item1];


const listSchema = {
    name :String,
    items: [itemsSchema]
}
const List = mongoose.model("List" , listSchema);

app.get("/",function(req,res){
   
    
    Item.find({},function(err,foundItems){
        if(foundItems.length ===0 ){
            Item.insertMany(defaultItem,function(err){
                if(err) {
                    console.log(err);
                }
            })
            res.redirect("/");
        }
        else {
            res.render("list" , {currDay: day , newItemAdd: foundItems})
        }
    });   
});

app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items: defaultItem
                })
                list.save();
                res.redirect("/"  + customListName);
            } 
            else {
               res.render("list" , {currDay: foundList.name , newItemAdd: foundList.items}); 
            }
      }
    })
    
    
})
app.post("/",function(req,res){
    const newtodo = req.body.newItem;
    const currDay = req.body.button;
    const newItem = new Item({
        name : newtodo
    });

   

    if(currDay === day){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: currDay},function(err,foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + currDay);
        })
    }
})
app.post("/delete",function(req,res){
    const toDelete = req.body.toRemove;
    const listName = req.body.listName;
    if(listName === day){
        Item.findByIdAndRemove(toDelete,function(err){
            if(!err){
                res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id:toDelete}}},function(err){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
   

    
})