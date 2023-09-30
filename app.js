//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://pragya:pragya@cluster0.gohdwd3.mongodb.net/todolistDB",{useNewUrlParser:true});

const ItemSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  }
});

const ListSchema = {
  name:String,
  items: [ItemSchema]
};



const Item = mongoose.model("Item",ItemSchema);
const eat = new Item({name:"eat"});
const work = new Item({name:"work"});
const run = new Item({name:"run"});
let defaultItems=[];


const List = mongoose.model("List",ListSchema);

app.get("/", function(req, res) {
  Item.find().then((data)=>{
    if(defaultItems.length===0){
      defaultItems = [eat , work, run];
        Item.insertMany(defaultItems);
        res.redirect("/");
      }else{
      res.render("list", {listTitle: "Today", newListItems: data});
      }
  })
  .catch((err)=>{
    console.log(err);
  });
});




app.get("/:Category",(req,res)=>{
 const category = _.capitalize(req.params.Category);

 List.findOne({name:category})
 .then((result)=>{
  if(result){
    //show an existing list
    res.render("list",{listTitle: result.name, newListItems: result.items})
  }else{
    //create a new list
    const list = new List({
      name:category,
      items:defaultItems
     });
     list.save();
     res.redirect("/"+category);
 }
 });

});


 


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name:itemName});

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName})
    .then((result)=>{
      result.items.push(item);
      result.save();
      res.redirect("/"+listName);

    })
  }

});

app.post("/delete",function(req,res){
  const listName = req.body.listName;
  const checkedItemId =  req.body.checkbox;
  if(listName==="Today"){
    Item.deleteOne({ _id: req.body.checkbox })
    .then((result) => {
      console.log('Document deleted successfully:', result);
      res.redirect("/");
    })
    .catch((err) => {
      console.error('Error deleting document:', err);
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then((result) => {
      console.log("Updated document:", result.value);
      res.redirect("/"+listName);
    })
    .catch((error) => {
      console.error(error);
    })
  }
});

  


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
