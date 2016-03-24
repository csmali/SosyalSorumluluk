var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');

var bodyParser = require('body-parser')
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.json());                        
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// bize hizmet edecek dosyalari ayarliyoruz
app.use(express.static(path.join(__dirname,'bower_components')));  

var userItems = [{id:1,desc:'null'}];
var firstNameItems = [{id:1,desc:'soyisim1'},{id:2,desc:'soyisim2'},{id:3,desc:'soyisim3'}];

var lastNameItems = [{id:1,desc:'soyisim1'},{id:2,desc:'soyisim2'},{id:3,desc:'soyisim3'}];
var fileContent;
var activeEmail;
var activeLine;
var currentUserStatus=1;		// Ihtiyac sahibi miyiz yoksa yardimsever miyiz booleani
var isUserFound =false; 
var ihtiyacsahibiUrunleri = [{urunAciklamasi:'Urunleri Listelemek Icin Asagidaki',urunAdi:'Butona Tiklayiniz'}];;
var yardimseverUrunleri = [{urunAciklamasi:'Urunleri Listelemek Icin Asagidaki',urunAdi:'Butona Tiklayiniz'}];;
app.get('/',function(req,res){
	res.render('index.ejs',{
		title:'My App',nameItems:firstNameItems,lastNameItems:lastNameItems
	});	
	isUserFound =false;
});


var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

app.get('/loginPage',function(req,res){
	res.render('login.ejs',{
		title:'My App',nameItems:firstNameItems,lastNameItems:lastNameItems
	});	
});

app.get('/error',function(req,res){
	res.render('userNoteFoundError.ejs',{
		title:'My App',nameItems:firstNameItems,lastNameItems:lastNameItems
	});	
});

app.get('/user',function(req,res){
	res.render('userPage.ejs',{
	});	
	while(userItems.length > 0) {
		userItems.pop();
	}	
	 var contents = fs.readFileSync("users.json");
	 var jsonContent = JSON.parse(contents);
	for(var user in jsonContent){
		 if(jsonContent[user].email === activeEmail){
				userItems.push({id:userItems.length+1,desc:jsonContent[user].name});
				userItems.push({id:userItems.length+1,desc:jsonContent[user].surname});
				userItems.push({id:userItems.length+1,desc:jsonContent[user].email});
				userItems.push({id:userItems.length+1,desc:jsonContent[user].city});
				userItems.push({id:userItems.length+1,desc:jsonContent[user].status});
				userItems.push({id:userItems.length+1,desc:jsonContent[user].personalInfo});
		 }
	}
			 
			

});

app.get('/myUserPage',function(req,res){
	
	console.log(currentUserStatus);
	if(currentUserStatus==0)
		res.render('myUserPageIhtiyac.ejs',{
		title:'My App',userItems:userItems,urunItems:ihtiyacsahibiUrunleri
	});	
	else
		res.render('myUserPageYardimsever.ejs',{
		title:'My App',userItems:userItems,urunItems:yardimseverUrunleri
	});	
	
		
	 
	
});
app.post('/thing', function (req, res, next) {
  var data = myFunction(req.body);
  console.log("BURAYA GIRIYOZ DA");
  res.json(data);
});
app.post('/login',function(req,res){
	var tempEmail=req.body.logEmail;
	var tempPassword=req.body.logPassword;
	console.log(tempEmail+" "+tempPassword);
	 var contents = fs.readFileSync("users.json");
	 var jsonContent = JSON.parse(contents);
	 for(var urunid in jsonContent){
		 if(jsonContent[urunid].email === tempEmail && encrypt(tempPassword)===jsonContent[urunid].password){
			 	console.log("Kullanici kayitli");
					isUserFound=true;
					activeEmail=tempEmail;
					if(jsonContent[urunid].status=== "Ihtiyac Sahibi")
						currentUserStatus=0;  // Ihtiyac sahibi icin
					else
						currentUserStatus=1;	// yardim sever icin statusumuz
				
		 }
	}
			 
				
			/* asenkron oldugu icin 1500 mslik delay konuldu cunku dosya okunmadan isUserFound degismemis oluyor*/
			setTimeout(function() {
				if(isUserFound){
					res.redirect('/user');
					isUserFound=false;
				}
				else{
				res.redirect('/error');
				}
			}, 1500);
			

	});
app.post('/urunEkle', function (req, res) {
	var counter=0;
	 var contents = fs.readFileSync("urunler.json");
	 var jsonContent = JSON.parse(contents);
	 var tempUrunler =  [{id:1,desc:'null'}];
	while(tempUrunler.length > 0) {
			tempUrunler.pop();
		}		 
		for(var urunid in jsonContent){
				tempUrunler.push({id:yardimseverUrunleri.length+1,urunAdi:jsonContent[urunid].urunadi,urunAciklamasi:jsonContent[urunid].urunaciklamasi});
				counter++;
		 }
	
	var newUrunIsim =req.body.urunIsmi;
	var newUrunInfo =req.body.urunInfo;
	var newUrunEmail = activeEmail;
	var obj = {urunid:(counter+1),urunadi:newUrunIsim,urunaciklamasi:newUrunInfo,urunsahibiemail:newUrunEmail};
	jsonContent.push(obj);
	var configJSON = JSON.stringify(jsonContent);
	fs.writeFileSync("urunler.json", configJSON);	
	res.redirect('/myUserPage');
});

// when Add to Bottom button is clicked
app.post('/urunListele', function (req, res) {
	while(yardimseverUrunleri.length > 0) {
		yardimseverUrunleri.pop();
	}	
	 var contents = fs.readFileSync("urunler.json");
	 var jsonContent = JSON.parse(contents);
	 for(var urunid in jsonContent){
		 if(jsonContent[urunid].urunsahibiemail === activeEmail){
				yardimseverUrunleri.push({id:yardimseverUrunleri.length+1,urunAdi:jsonContent[urunid].urunadi,urunAciklamasi:jsonContent[urunid].urunaciklamasi});
			console.log("dogru mu   ", jsonContent[urunid].urunid);
		 }
	}
	res.redirect('/myUserPage');
});

app.post('/add',function(req,res){
	 var fs = require("fs");
	 var contents = fs.readFileSync("users.json");
	 var jsonContent = JSON.parse(contents);
	var encryptedPass=encrypt(req.body.password);
	var counter=0;
	for(var userid in jsonContent){
				counter++;
		 }
	var newName =req.body.fname;
	var newLName=req.body.lname;
	var newEmail=req.body.email;
	console.log(newName + newLName+newEmail);
	var newCity=req.body.city;
	var newPassword=req.body.password;
	var newType=req.body.selectpicker;
	var newPersonalInfo=req.body.personalInfo;
	if(newName.toString()!== "" && newLName.toString()!=="" && newCity.toString()!=="" && newEmail.toString()!==""){

		var obj = {userid:(counter+1),name:newName,surname:newLName,email:newEmail,status:newType,password:encrypt(newPassword),personalInfo:newPersonalInfo,city:newCity};
		jsonContent.push(obj);
		var configJSON = JSON.stringify(jsonContent);
		fs.writeFileSync("users.json", configJSON);
		console.log("The file was saved!");
		res.redirect('/loginPage');

	}
	else{
		res.status(500).send('Lutfen giris formunu duzgun doldurunuz'); 
		setTimeout(function() {
						res.redirect('/ş');

			}, 1500);
	
	}
});



app.listen(1337,function(){
console.log('ready on port 1337');
});