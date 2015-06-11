
var mongoose = require('mongoose');
var devicecollection= require('../DataAcces/devicecollection');
var usercollection = mongoose.model('users');
var moment = require('moment');
var fs =require('fs');
var express = require('express');
var router = express.Router();



router.get('/search', function(req, res, next) {
  console.log(req);
  var is_ajax_request = req.xhr;
  var parm = req.query.term;
  console.log(parm);
  console.log(is_ajax_request);
  if(is_ajax_request){


    devicecollection.find({},function(err, items) {
      console.log(items);
        res.json(items);
      });


  }



});

router.post('/overview', function(req, res, next) {

  if (req.session && req.session.user){
    console.log("SESSION"+req.session.user.username);
    usercollection.findOne({username:req.session.user.username},function(err,user){
      if(!user){
        req.session.user= {};
        req.redirect('/login');

      }else{

        res.locals.user = user;
var devicenames;
var devicetypes;
var devicedescription;
var txtfilter = req.body.txtfilter;
var ofilter =  req.body.values;
var dtoday = moment();
console.log('filter :' + ofilter);
//var parmregex = '/.*' + parm + '*./';
if (txtfilter!='' || txtfilter==undefined){
var parmregex = '/.*' + txtfilter + '*./';
console.log(parmregex);
 var parm = req.body.txtfilter;
  console.log(parm);
  parm = parm.toLowerCase()
  devicecollection.find( {$or: [{devicename:parm} , { devicetype: parm },{devicedescription: {$regex: eval(parmregex)}}] },function(err, docs) {
    console.log("devs:overview:"+docs);
    for(i=0 ; i< docs.length ; i++){
      var stop = false;
      console.log("DOC: "+docs[i].deviceregistrations);

      for(r=0 ; r< docs[i].deviceregistrations.length ; r++){
        var name;

        var tmp = docs[i].deviceregistrations[r];
        usercollection.findById(tmp.by,function(err,user){
          if(!user){

          }else{
            name=user.username;
            console.log("user.name; "+user.username);
          }

        });

        console.log("DOC: "+tmp);
        console.log("FROM: "+tmp.from);
        console.log("until: "+tmp.until);


        if (stop==true) {} else{

          if (moment(dtoday).isBetween(tmp.from, tmp.until)){


            //  if (dtoday > docs[i].deviceregistrations[r].from && dtoday < docs[i].deviceregistrations[r].until){
            // is vandaag uitgeleend
            stop = true
            docs[i].isuitgeleend = true ;
            console.log("isuitgeleend: "+docs[i].isuitgeleend);
          }else{
            //is vandaag niet uitgeleend
            docs[i].isuitgeleend = false ;
            console.log("isuitgeleend: "+docs[i].isuitgeleend);

          }
        }

        docs[i].deviceregistrations[r].username = "test";
        console.log(docs[i].deviceregistrations[r]);
      }

    }
    res.render('overview', {
      "txtfilter":"",
      "devicelist": docs,
      "user":req.session.user.username
    });


    });
  }else{
    devicecollection.find({},{},function(e,docs){
      console.log("devs:overview:"+docs);

      res.render('overview', {
        "txtfilter":"",
        "devicelist": docs
      });

})
}
}});}//afsluiter zoekene op user -<cookie
});




/* GET Device Overview page.
userauth= only admin

*/
router.get('/overview', function(req, res) {
  if (req.session && req.session.user){
    console.log("SESSION"+req.session.user.username);
    usercollection.findOne({username:req.session.user.username},function(err,user){
if(!user){
req.session.user= {};
req.redirect('/login');

}else{

  res.locals.user = user;
  var dtoday = moment();
  var registrations=[];



  devicecollection.find({},{},function(e,docs){
    console.log("devs:overview:"+docs);
    for(i=0 ; i< docs.length ; i++){
      var stop = false;
      console.log("DOC: "+docs[i].deviceregistrations);

      for(r=0 ; r< docs[i].deviceregistrations.length ; r++){

        var tmp = docs[i].deviceregistrations[r];


          console.log("DOC: "+tmp);
          console.log("FROM: "+tmp.from);
          console.log("until: "+tmp.until);


          if (stop) {} else{

       if (moment(dtoday).isBetween(tmp.from, tmp.until)){


      //  if (dtoday > docs[i].deviceregistrations[r].from && dtoday < docs[i].deviceregistrations[r].until){
          // is vandaag uitgeleend
          stop = true
          docs[i].isuitgeleend = true ;
          console.log("isuitgeleend: "+docs[i].isuitgeleend);
        }else{
          //is vandaag niet uitgeleend
          docs[i].isuitgeleend = false ;
          console.log("isuitgeleend: "+docs[i].isuitgeleend);

      }
    }



      }

    }
    if (req.session && req.session.user){
      res.render('overview', {
      "txtfilter":"",
      "devicelist": docs,
      "user":req.session.user.username
    });}
    else{
      res.redirect('/login');

    }

  });
}
    });
  }
  else
    {

      res.redirect('/login');
  };
});
/* GET new device page. */
router.get('/newdevice', function(req, res, next) {
  res.render('newdevice', { title: 'Add New Device', devicename:'', devicetype:'', devicedescription:'', imagebyt:'', serror:''  });
});


router.post('/comfirm', function(req, res, next) {

  //login check
  if (req.session && req.session.user){
    console.log("SESSION"+req.session.user.username);
    usercollection.findOne({username:req.session.user.username},function(err,user){
      if(!user){
        req.session.user= {};
        req.redirect('/login');
    }else{
        //start verwerken
        var dtoday = moment().format("d-M-YYYY");
        var parm = eval(req.body.values);
        var greenlight=false;
        //console.log(parm);
        for(var p in parm){
          console.log(parm[p]);
          var item = parm[p];
          var sfromDate =item.from.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3");
          var fromDate =moment(sfromDate);


          var suntilDate=item.until.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3");
          var untilDate =moment(suntilDate);
          var registrations=new Array();
        //  var registrationitem={by:user.id,from:'"'+fromDate+'"',until:'"'+untilDate+'"'};




          var registrationitem={by:user.id,from:fromDate,until:untilDate,username:req.session.user.username};


    console.log("registrations :"+registrations.length);
    console.log("ID :"+item.id);
    console.log("BY :"+registrationitem.by);
    console.log("BY name :"+req.session.user.username);
    console.log("FROM :"+registrationitem.from);
    console.log("UNTIL :"+registrationitem.until);
    console.log("Today :"+dtoday);

    devicecollection.findById(item.id,function(err,device){
      registrations=  device.deviceregistrations;
    //  console.log("reg :" +registrations);
var oldregs = registrations;
      for (i = 0; i < oldregs.length; i++) {
      var instfrom=moment(oldregs[i].from);
      var instuntil=moment(oldregs[i].until);

  if (moment(dtoday).isBetween(instfrom, instuntil)){
  //dtoday > registrations[i].from && dtoday < registrations[i].until
  console.log("Reeds uitgeleend door"+ oldregs[i].by);

  }else{
    //console.log("registrations :" +registrations);
    console.log("registrations");


    greenlight=true;
    console.log(registrations);
  }

      };
      if (registrations.length==0){
        console.log("error length 0");

        greenlight=true;
      }
      if(greenlight){
        registrations[registrations.length] = registrationitem;
      //device.deviceregistrations = registrationitem;
    devicecollection.update({_id: item.id}, {$set: {"deviceregistrations": registrations}}, function(err){
          console.log("error :" +err);
        ///render
     //res.render('succes', { title: 'succesvol ingeladen'});
     res.send(greenlight);



    });
  }

  });

  }
  }})};//login check





});







/* GET New User page. */
router.get('/newuser', function(req, res) {
  res.render('newuser', { title: 'Add New User' });
});

router.get('/help', function(req, res) {
  res.render('help', { title: 'Help' });
});


/* GET Userlist page. */
router.get('/userlist', function(req, res) {

  usercollection.find({},{},function(e,docs){
    console.log(docs);
// console.log(req.session.passport.user);

    res.render('userlist', {
      "userlist" : docs
    });
  });
});


router.get('/updatedevice', function(req, res) {


var id = req._parsedUrl.query

//replace voor witspaces te vervangein in url
//  devicenaam =  devicenaam.replace(/['%20']/g,' ');
  //devicenaam = devicenaam.replace(/  +/g, ' ');



  devicecollection.findById(id,function(err,chkdevice){
    console.log("UPDATE ...");
    console.log(chkdevice.devicedescription);
    if (chkdevice){
      retStatus = 'Success';
      res.render('updatedevice', { title: 'update - '+chkdevice.devicename,deviceId:chkdevice._id,devicename:chkdevice.devicename, devicetype:chkdevice.devicetype, devicedescription:chkdevice.devicedescription, imagebyt:chkdevice.imagebyt,serror:'' });
    }
  });
});

/* POST to update Device Service */
router.post('/updatedevice', function(req, res) {

var item = req.body;

devicecollection.findById(item.deviceId,function(err,chkdevice){
  console.log("UPDATE .");
  var files = req.files.file;
  var imagebyt;
  if (files=='' || files==undefined){

    imagebyt = chkdevice.imagebyt

  }else{
    imagebyt  =files.name;

  }

  if (chkdevice){
    console.log("UPDATE ...");
    devicecollection.update({_id: item.deviceId}, {$set: {devicename:item.devicename, devicetype:item.devicetype, devicedescription:item.devicedescription, imagebyt:imagebyt}}, function(err){
      res.redirect('/overview');

  }
);
}
});
});

/* POST to Add Device Service */
router.post('/adddevice', function(req, res) {

  console.log("fill body&file");

  var body = req.body;
  var files = req.files;
  console.log(body);
  console.log("Merge body&file"+files.file.name);
  body.imagebyt=files.file.name;
  //body.deviceregistrations={from:'',until:'',by:''};
  console.log("sending to ddb"+body);

var quant = body.Quantity;

  console.log("Quantity "+body.Quantity);
  for(i=0 ; i< quant ; i++){
    delete body.Quantity;
    var device = new devicecollection(body);
    // Submit to the DB
    device.save(function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
        console.log("There was a problem adding the information to the database.");
      }
      else {
        console.log("SUCCES,redirect");

      }
    });

  }
  // If it worked, set the header so the address bar doesn't still say /adduser
  res.location("/overview");
  // And forward to success page
  res.redirect("/overview");
// controle on unique device names

//  devicecollection.findOne({devicename:body.devicename},function(err,chkdevice){
  //  if (!chkdevice){//exists?

    //}else{
  //    res.render('newdevice', { title: 'Add New Device', devicename:'', devicetype:'', devicedescription:'', imagebyt:'',serror:'This device already exists' });
  //  }
//  });
});

/* POST to Add User Service*/
router.post('/newuser', function(req, res) {
  var user = new usercollection(req.body);

  usercollection.findOne({username:req.body.username},function(err,chkuser){

    if (!chkuser){//exists?
      user.role=0;
    console.log("adding user ");
  // Submit to the DB
    user.save(function (err) {
      req.session.user=user;
      res.redirect('/overview');
   });
}else{


  res.render('newuser', { title: 'Add New User',   serror:'Gebruiker bestaat al'  });

}
});
});

/* GET SUCCES page.*/
router.get('/succes', function(req, res) {


    res.render('succes', { title: 'succesvol ingeladen'});
  });


/* GET login page.*/
router.get('/login', function(req, res) {
  //console.log(req.body.username);
  req.session.destroy();
  var inputname = '';
  if(!req.body.username===''){
    inputname=   req.body.username;

  }else
    {inputname=""}


  res.render('login', { title: 'Login',pname:inputname });
});
/* POST login page.*/
router.post('/login',function(req,res){
  console.log(req.body.username);
  var inputname = '';
  if(!req.body.username===''){
  inputname=   req.body.username;

}else
  {inputname=""}



  usercollection.findOne({username:req.body.username},function(err,user){

if (!user){
  res.render('login', { title: 'Login',uerror: "User doesn't exist." });
}else{
  if (req.body.password===user.password){
    req.session.user=user;
    res.redirect('/overview');

  } else{

    res.render('login', { title: 'Login',perror: "Incorrect password.",pname: inputname });

  }

}

  });

});





/*
router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/userlist');
});
*/




  module.exports = router;
