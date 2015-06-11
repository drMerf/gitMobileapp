var availableTags = new Array();
var checkoutlist  = new Array();
var registrations = new Array();
var globregistrations = new Array();
var prevDevice;
var myfinaljsonformat;
var finaljson;
var dates=new Array();
var gtimeline;
//$.datepicker.setDefaults( $.datepicker.regional[ "fr" ] );
$(window).load(function() {
  //  $(".inithide").hide();

  $('#txtfilter').autocomplete({
    source: availableTags,
    minLength: 3
  });
  $('#txtfilter').keydown(function(e) {
    var word = $('#txtfilter').val();
    var evt = e ? e:event;
    var input = evt.keyCode;
    var letter  =evt.key;

    word=word+letter;
    console.log(word);
    console.log(word.length);

    // controle meer post
    //  dan 3 karakters
    if (word.length>3){
      console.log("sending search request");

      // get all
      $.ajax({
        type: "GET",
        url: "/search",
        dataType: "json",
        data:{term: word}
      }).done (function (data) {
        console.Log("data  ");
        console.log(data);

        availableTags.length = 0;
        for(i in data){
          //device name is uniek dus mag altijd bij de tags komen
        //  console.Log("data  ");
        //  console.log(data[i]);

          availableTags[availableTags.length]=data[i].devicename;
          //types zijn niet uniek, als ze al bestaan -> niet toevoegen
          var typeuniek= true;
        //  for (var i = 0; i<availableTags.length; i++){

            //    if (availableTags[i]==data[i].devicetype){
                //  typeuniek = false;
              //  }
      //    }


          console.log('TYPENIEK');
          console.log('TYPENIEK');

          console.log("dev: "+availableTags.indexOf(data[i].devicetype));
          console.log('TYPENIEK');
          console.log('TYPENIEK');
          if (availableTags.indexOf(data[i].devicetype)==-1) {availableTags[availableTags.length]=data[i].devicetype;}
            //description is 99% anders , dubbel mag
          availableTags[availableTags.length]=data[i].devicedescription;
      }

        $('#txtfilter').focus();

      });

    }




  });
  /*
  console.log("masonry ...");

  $('#tilecontainer').masonry({

  itemSelector: '.tile',

  isAnimated: true,

  isFitWidth: false

});
console.log("masonry done");


*/



$( ".searchbutton" ).click(function(e) {

  // from vallidation
  var today = new Date();
  var todayRaw = today;
  var tdd = today.getDate();
  var tmm = today.getMonth()+1; //January is 0!
  var tyyyy = today.getFullYear();
  if(tdd<10) { tdd='0'+tdd }
    if(tmm<10) {  tmm='0'+tmm }
      today = tdd+'-'+tmm+'-'+tyyyy;
      //until validation
      var until=new Date();
      until.setDate(until.getDate()+7);
      var untilRaw = until;
      var udd =until.getDate();
      var umm = until.getMonth()+1; //January is 0!
      var uyyyy = until.getFullYear();
      if(udd<10) {udd='0'+udd}
        if(umm<10) {umm='0'+umm}
          until =udd +'-'+umm+'-'+uyyyy;
          $( this ).toggleClass( "searchbuttonclick" );

          var currentuser = $('#results').text();
          console.log("CURENT USER: "+currentuser);
          console.log("FROM : "+todayRaw);
          console.log("UNTIL : "+untilRaw);
          $(this).val("CHECKOUT");



          //get all devices checked
          checkoutlist = [];
          $('#devicesbasket').html('');
          $('.searchbuttonclick').each(function(i, obj) {

            var id =   $(this).closest('.tile').attr('devID');

            console.log("ID : "+id);
            //var deviceId = $(this).closest('.tile').attr('devID');
            var devicename =  $(this).closest('.tile').children('.contenttile').children('.title').children('span').text();
          //  checkoutlist[checkoutlist.length]= devicename;
            checkoutlist[checkoutlist.length]= id;
            console.log("adding device:"+devicename +"  --- " +id);


            //in het mandje
            var currentbasket=$('#devicesbasket').html()
            var basketitem =   "<div class='basketitem'><span class='basketid'>"+id+ "</span><span class='baskettitle'>Device : "+devicename+ "</span><span class='fromuntilspan'>From : </span><input type='text' class='textboxfrom'/><br/><span class='fromuntilspan'>Until : </span><input lable:'From' name:'From' type='text' class='textboxuntil'/></div>";
            currentbasket= currentbasket+basketitem;


            //console.log("html          " + currentbasket );
            //set html content
            $('#devicesbasket').html(currentbasket);



          });

          //$( "#my-timeline" ).trigger( "UPDATE" );

          jsonmaken();

          $(".textboxfrom").datepicker({
            dateFormat: 'dd-mm-yy',
            minDate: 0,
            maxDate: +100,
            changeYear: true
          });
          $(".textboxfrom").css({'display':'inline', 'float':'right', 'margin-right':'150px'});
          $(".textboxfrom").datepicker("setDate", today);
          //until
          $(".textboxuntil").datepicker({
            dateFormat: 'dd-mm-yy',
            minDate: 0,
            maxDate: +100,
            changeYear: true
          });
          $(".textboxuntil").css({'display':'inline', 'float':'right', 'margin-right':'150px'});
          $(".textboxuntil").datepicker("setDate", until);

          $('.basketitem').each(function(i, obj) {
            //var obj = $(this);
            test(obj);


          });

          //from




          console.log("list  "+checkoutlist);

          var seldevice =  $(this).closest('.tile').children('.contenttile').children('.title').children('span').text();
          var seldeviceid  = $(this).closest('.tile').attr("devID");
          console.log("dev: "+seldeviceid);
          console.log("dev: "+checkoutlist.indexOf(seldeviceid));
          //in in lijst
          if (checkoutlist.indexOf(seldeviceid)>-1){
            $(this).val("UNDO");
          }else{
            $(this).val("CHECKOUT");
          }
          if ($('#devicesbasket').html()==''){
            $('#basket').hide();
          }
          else{    $('#basket').show();
        }


        prevDevice=seldeviceid;




      });

      $('#comfirm').click(function(e){
        e.preventDefault();
        var dateFrom = new Array();
        var dateUntil  =  new Array();
        var items = new Array();

        $('.basketitem').each(function(i, obj) {
          var postitem = {id:'' ,name: '',from:'',until:'' };
          var from = $(this).children('.textboxfrom').val();
          var until = $(this).children('.textboxuntil').val();
          var name = $(this).children('.baskettitle').text();
          var id = $(this).children('.basketid').text();
          //controle's




          // value
          //  postitem=JSON.stringify(items);
          postitem.name=name;
          postitem.from=from;
          postitem.until=until;
          postitem.id=id;
          console.log("{id:" +id+",name:"+name+",from:"+from + ",until:" +until+"}");
          var item = "[value:{id:" +id+"name:"+name+",from:"+from + ",until:" +until+"}]";
          items[items.length] = postitem;
        });
        //post data klaarmaken
        var postData = {values: '' };
        postData.values=JSON.stringify(items);


        //posten
        $.ajax({
          type: "POST",
          url: "/comfirm",
          data: postData,

          success: function(b){location.reload();},
          error: function(err){console.log("error");  location.reload();}
        });

      });


      //device basket hidden
      if ($('#devicesbasket').html()==''){
        $('#basket').hide();
      }
      else{    $('#basket').show();
    }


    //errorr input

    $('#adduser').click(function(e) {
      e.preventDefault();
      // username
      var user =  $('#UserName').val() ;
      var userpatt = new RegExp(/\w/);
      var validuser = userpatt.test(user);

      // password
      var password =  $('#UserPassword').val() ;
      var passwordpatt = new RegExp(/^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/);
      var validpassword = passwordpatt.test(password);

      // password 2nd
      var passwordsec =  $('#UserPasswordsec').val() ;
      var validpasswordsec=true;

      //email
      var email =  $('#inputUserEmail').val() ;
      var emailpatt = new RegExp(/^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/);
      var validemail = emailpatt.test(email);

      console .log("email : "+ email+ " valid: " + validemail);
      console .log("validpassword : "+ password+ " valid: " + validpassword);
      console .log("validuser : "+ user+ " valid: "  + validuser);
        //controle
      if (!validemail) {
        //display error
        $("#errorEmail").text("Incorrect E-mail address : example -> 'Tom.depessemier@beobank.be'");
      }
      if (!validpassword) {
        //display error
        $("#errorPassword").text("Incorrect Password, A password must be between 8 - 20 characters and must have at least 1 digit : example -> 'password1'");
      }
      if (passwordsec!=password) {
        validpasswordsec = false;
        //display error
        $("#errorPasswordsec").text("The password fields should contain the same password");
      }

      if (!validuser){
        //display error
        $("#errorUserName").text("Incorrect username, A username cant be empty   : example -> 'Tom'");
      }

      if (validuser && validpassword && validemail && validpasswordsec){
        $('#newuser').unbind('submit').submit();
      }


    });

    /// new device validation
    $("#btnAdddevice").click(function(e){
      e.preventDefault();

      // name
      var name =  $('#inputDeviceName').val() ;
      var namepatt = new RegExp(/\w{2,30}/);
      var validname = namepatt.test(name);

      // type
      var type =  $('#inputDeviceType').val() ;
      var typepatt = new RegExp(/\w{2,30}/);
      var validtype = typepatt.test(type);

      // description
      var description =  $('#inputDeviceDescription').val() ;
      var descriptionpatt = new RegExp(/\w{1,350}/);
      var validdescription = descriptionpatt.test(description);

      // val imageval
      var imageval =  $('#val').text() ;
      var imagevalpatt = new RegExp(/\w/);
      var validimageval = imagevalpatt.test(imageval);


      console .log("name : "+ name+ " valid: " + validname);
      console .log("type : "+ type+ " valid: " + validtype);
      console .log("description : "+ description+ " valid: "  + validdescription);
      console .log("imageval : "+ imageval+ " valid: "  + validimageval);



      if (!validname) {
        //display error
        $("#errorname").text("Name is required and must be between 3 - 30  characters long: example -> 'Android S5'");
      }


      if (!validtype) {
        //display error
        $("#errorDeviceType").text("Type is required and must be between 3 - 30 characters long: example -> 'Phone'");
      }


      if (!validdescription) {
        //display error
        $("#errorDeviceDescription").text("Description is required and must be between 1 - 350 characters long.");
      }


      if (!validimageval) {
        //display error
        $("#errorVal").text("Select a image of the device first...");
      }
      if (validname && validtype && validdescription && validimageval){
        $('#formDevice').unbind('submit').submit();
      }
    });

    //login validation

    $("#btnLogin").click(function(e){

      e.preventDefault();

      // name
      var name =  $('#inputUserName').val() ;
      var namepatt = new RegExp(/\w{2,20}/);
      var validname = namepatt.test(name);

      // password
      var password =  $('#inputUserPassword').val() ;
      var passwordpatt = new RegExp(/^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/);
      var validpassword = passwordpatt.test(password);


      console .log("name : "+ name+ " valid: " + validname);
      console .log("type : "+ password+ " valid: " + validpassword);



      if (!validname) {
        //display error
        $("#usernameerror").text("Name is required.");
      }

      if (!validpassword) {
        //display error
        $("#passworderror").text("Password is required.");
      }
      if (validname && validpassword){
        $('#formlogin').unbind('submit').submit();
      }



    });







    /// dit zorgt er voor dat de webkit van file custom wordt
    $('#selectimage').click(function(){
      $("input[type='file']").trigger('click');
    });
    $("input[type='file']").change(function(){
      $('#val').text(this.value.replace(/C:\\fakepath\\/i, ''))
    });



    //global from and until trigger
    $("#globalfrom").change(function (){


      $(".textboxfrom").val($("#globalfrom").val());

    });

    $("#globaluntil").change(function (){

      $(".textboxuntil").val($("#globaluntil").val());


    });
    $('.propertyedit').click(
      function() {
        //e.stopImmediatePropagation();
      //  e.preventDefault();

        var id  = $(this).closest('.tile').attr("devID");

         console.log("name : " + name);

          window.location.href = "/updatedevice?"+id;


      }

    );

    // slot verbergen ev
    $(document).ready(function(){
      console.log("INIT");
      var totalresults=0;

      $('.tile').each(function(i, obj) {
        var bchkshowalldevices = $('#chktoonall').is(':checked');
        var dtoday = new Date();

        //check de checkbox en toon wat mag getoont worden
        if (bchkshowalldevices){
          $(this).hide();
          if($(this).children('.deviceplaceholder').attr("isReserved")=='true'){
          }else {
            $(this).children('.deviceplaceholder').children('.lock').hide();
            $(this).show();
            totalresults++ ;
          }

        }else{
          $(this).show();
          if($(this).children('.deviceplaceholder').attr("isReserved")=='true'){

          }else {
            $(this).children('.deviceplaceholder').children('.lock').hide();
          }
        }

        //controle array

        registrations = new Array();
        var regs=new Array();
        regs=[];
        regs = '['+$(this).attr("registrations")+']';


        console.log("registrations :  "+ regs);

        try {
          registrations = eval(regs);
          var name = $(this).closest('.tile').children('.contenttile').children('.title').children('span').text();
          var id  = $(this).closest('.tile').attr("devID");
          regitem = {"id": id,"name": name,
          "registrations":registrations

        }

        globregistrations[globregistrations.length] = regitem;
        console.log(globregistrations);
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log("ERROR " +e.message);
        }
      }
      var vorigefrom = new Date();
      var vorigeuntil = new Date();
      var finalfrom = new Date();
      var finaluntil = new Date();
      var b ;

      if (registrations.length>0){
        for ( i = 0 ; i < registrations.length ;i++){

          var until = new Date(registrations[i].until);
          var from = new Date(registrations[i].from);
          var by = new Date(registrations[i].by);
          var finalfrom = new Date(registrations[i].from);
          var finaluntil = new Date(registrations[i].until);
          b = false;

          if (dtoday>from && dtoday<until){
            console.log("BETWEEN");
            b=true
            if (from >vorigefrom || from==vorigefrom ){
              console.log("from ==== vorige from");
           from = vorigefrom;
           until = vorigeuntil;
            finalfrom = from;
            finaluntil = until;


            } else
              {
                console.log("vorige from ==== from");
                vorigefrom = from;
                vorigeuntil = until;
              }



            }
            if (b==false){
              if (dtoday<from && dtoday<until){
                console.log("AFTER");
                b=true
                if (from >vorigefrom || from==vorigefrom ){
                  console.log("from ==== vorige from");
                  finalfrom = from;
                  finaluntil = until;

                }else
                  {
                    console.log("vorige from ==== from");
                    vorigefrom = from;
                    vorigeuntil = until;
                  }

                }
              }


              //invullen
              if (b) {

                // from vallidation
                var dfrom = new Date(finalfrom);
            //    var fromRaw = finalfrom;
                var fdd = dfrom.getDate();
                var fmm = dfrom.getMonth()+1; //January is 0!
                var fyyyy = dfrom.getFullYear();
                if(fdd<10) { fdd='0'+fdd }
                  if(fmm<10) {  fmm='0'+fmm }
                    dfrom = fdd+'-'+fmm+'-'+fyyyy;

                    //until validation
                    var duntil=new Date(finaluntil);

            //        var untilRaw = finaluntil;
                    var udd =duntil.getDate();
                    var umm = duntil.getMonth()+1; //January is 0!
                    var uyyyy = duntil.getFullYear();
                    if(udd<10) {udd='0'+udd}
                      if(umm<10) {umm='0'+umm}
                        duntil =udd +'-'+umm+'-'+uyyyy;




                        console.log("final until "+ duntil);
                        console.log("final from "+ dfrom);
                        console.log("final NAME "+ registrations[i].username);



                        ///belgische datum notatie
                        duntil.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3");
                        dfrom.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3");


                        $(this).children('.extrainfotile').children('.from').children('.closestfrom').text(dfrom);
                        $(this).children('.extrainfotile').children('.by').children('.closestby').text(registrations[i].username);
                        $(this).children('.extrainfotile').children('.until').children('.closestuntil').text(duntil);



                      }else{


                      }





                    }
                  }

                  //jsonmaken();
                  //try{makeJson()} catch(e){console.log(e.message)}
                  //var timeline = new createStoryJS('my-timeline', finaljson);


                });
              if(totalresults==0)  {
                $('#filtererror').show();
              }else {
                $('#filtererror').hide();
              }


              });


              //filter valideren voor doorsturen, samenstellen
              $('#btnfilter').click(function (e) {
                // controleren of er geen foute karakters in de search string staan...

                // bepalen of het een datum dat we zoeken of niet

                // bepalen of het een persoon naam is?
                //e.preventDefault();
                // console.log("filter text   :  " + txtFilter);
              });

              $('#chktoonall').click(function(){


                $('#tilecontainer').children('div').each(function(i, obj) {
                  var bchkshowalldevices = $('#chktoonall').is(':checked');
                  console.log("fbchkshowalldevices  :  " + bchkshowalldevices);
                  if (bchkshowalldevices){
                    $(this).hide();
                    if($(this).children('.deviceplaceholder').attr("isReserved")=='true'){
                    }else {
                      $(this).children('.deviceplaceholder').children('.lock').hide();
                      $(this).show();
                    }

                  }else{
                    $(this).show();
                    if($(this).children('.deviceplaceholder').attr("isReserved")=='true'){

                    }else {
                      $(this).children('.deviceplaceholder').children('.lock').hide();
                    }


                  }

                });

              });
              function jsonmaken1(){
                var container = document.getElementById('my-timeline');
                console.log("DATES");

                console.log(dates);

                var items = new vis.DataSet(dates);

                // Configuration for the Timeline
                var options = {
                  width: '100%'


                };

                // Create a Timeline
                var timeline = new vis.Timeline(
                  container,
                  items,
                  options
                );



              }
              function jsonmaken(){
                $('#timlinecontainer').html("<div id='my-timeline'></div>");
                console.log("myURL?method maken ");
                console.log(fetch_url);
                var fetch_url = "myURL?method=getDates";
                console.log("json maken ");
                console.log(checkoutlist);


                dates=new Array();
                //var eras=[];
                for(var g=0;g<globregistrations.length;g++) {
                  console.log(globregistrations[g]);
                  if (checkoutlist.indexOf(globregistrations[g].id)>-1){
                    console.log(globregistrations[g].id);




                    if (globregistrations[g].registrations.length>0){

                      for ( i = 0 ; i < globregistrations[g].registrations.length ;i++){
                        //formaat instellen
                        var fdate = new Date(globregistrations[g].registrations[i].from);
                        var udate = new Date(globregistrations[g].registrations[i].until);

                        console.log("{startDate:"+fdate+",endDate:"+udate+",headline:"+globregistrations[g].name +"}");

                        var date = {"start":fdate,"end":udate,"content":globregistrations[g].name};
                        //timelinejs formats
                        //var date = {"startDate":fdate,"endDate":udate,"headline":globregistrations[g].name};
                        console.log(date);
                        dates[dates.length]= date;

                      }

                    }
                  }
                }

                //  items[items.length] = postitem;
                console.log("dates");
                console.log(dates);
                if (dates.length>0){

                  //mydatesjsonformat = JSON.stringify(dates);
                  var today= new Date();
                  jsonmaken1();
                  /*
                  finaljson={
                  "timeline":
                  {
                  "headline":"DEVICE TIMELINE",
                  "type":"default",
                  "date": dates,
                  "era": dates
                }
              }
              console.log("finaljson");
              console.log(finaljson);*/
              //myfinaljsonformat = JSON.stringify(finaljson);

              //gtimeline = new createStoryJS({





            }else{
              $('#timlinecontainer').html("<div id='my-timeline'></div>");
            }
          }

          function datepickerinstellen(id){
            console.log("datepickerinstellen"+id);

            var target = document.getElementById( id );
            console.log("target");
            console.log(target);









          }

          function test(target){
            var tname = $(target).children('.baskettitle').text();
            var dpicker = $(target).children('.textboxfrom');
            var upicker = $(target).children('.textboxuntil');
            var dfromraw=new Date();
            var dfrom;
            var duntil;
            var  first = true;
        //    var dpicker = $(target).children('.textboxuntil');
            console.log( target);

            console.log( name);

            tname =   tname.substring(9);

            var darray = new Array();
            //var eras=[];
            for(var g=0;g<globregistrations.length;g++) {
            //  console.log(globregistrations[g]);
        //    console.log("globregistrations ");
        //    console.log(globregistrations[g].name);

        //    console.log(tname);
        //    console.log(globregistrations[g].name==tname);
              if (globregistrations[g].name==tname){
                if (globregistrations[g].registrations.length>0){
                  for ( i = 0 ; i < globregistrations[g].registrations.length ;i++){


                    var tmpfrom = new Date(globregistrations[g].registrations[i].from);
                    var tmpuntil = new Date(globregistrations[g].registrations[i].until);
                    var tmpdate = new Date(globregistrations[g].registrations[i].from);
                    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    var diffDays = Math.round(Math.abs((tmpuntil.getTime() - tmpfrom.getTime())/(oneDay)));

                    //  console.log("diffDays "+diffDays);
                    for (var d=0;d<diffDays+1;d++){



                      //formaat instellen
                      var formatdate = new Date(tmpdate);
                      formatdate.setDate(formatdate.getDate()+d);
                      var test= formatdate;
                      var tdd = formatdate.getDate();
                      var tmm = formatdate.getMonth()+1; //January is 0!
                      var tyyyy = formatdate.getFullYear();
                      if(tdd<10) { tdd='0'+tdd }
                        if(tmm<10) {  tmm='0'+tmm }
                          formatdate = tdd+'-'+tmm+'-'+tyyyy;




                          darray[darray.length] = formatdate;
                          console.log("formatdate");
                          var convertdate = new Date(test);
                          convertdate.setDate(convertdate.getDate());
                          dfromraw=convertdate;

                          console.log(dfromraw);
                          console.log("formatdate");
                        }


                  //      console.log("DATEPICKER INSTELLEN");
                      //  console.log(darray);
                        $(dpicker).datepicker( "option", "beforeShowDay", function(sdate) {
                          //until validation
                          var d=new Date(sdate);
                          var udd =d.getDate();
                          var umm = d.getMonth()+1; //January is 0!
                          var uyyyy = d.getFullYear();
                          if(udd<10) {udd='0'+udd}
                            if(umm<10) {umm='0'+umm}
                              d =udd +'-'+umm+'-'+uyyyy;
                          var displayarray= new Array() ;
                          if (darray.indexOf(d)>-1){
                            //  console.log("udate"+ sdate);
                          //  console.log("DATEPICKER INSTELLEN true");




                            displayarray[displayarray.length] = false
                            } else
                            {
                            //  console.log("DATEPICKER INSTELLEN false");
                              displayarray[displayarray.length] = true
                          }
                            return displayarray;


                          } );
                          displayarray = new Array();
                          $(upicker).datepicker( "option", "beforeShowDay", function(sdate) {
                            //until validation
                            var d=new Date(sdate);
                            var udd =d.getDate();
                            var umm = d.getMonth()+1; //January is 0!
                            var uyyyy = d.getFullYear();
                            if(udd<10) {udd='0'+udd}
                              if(umm<10) {umm='0'+umm}
                                d =udd +'-'+umm+'-'+uyyyy;
                                var displayarray= new Array() ;
                                if (darray.indexOf(d)>-1){
                                  //  console.log("udate"+ sdate);
                                  //  console.log("DATEPICKER INSTELLEN true");




                                  displayarray[displayarray.length] = false
                                } else
                                  {
                                    //  console.log("DATEPICKER INSTELLEN false");
                                    displayarray[displayarray.length] = true
                                  }
                                  return displayarray;


                                } );



                          var d=new Date(dfromraw);
                          d.setDate(d.getDate()+1);
                          var udd =d.getDate();
                          var umm = d.getMonth()+1; //January is 0!
                          var uyyyy = d.getFullYear();
                          if(udd<10) {udd='0'+udd}
                            if(umm<10) {umm='0'+umm}
                              dfrom =udd +'-'+umm+'-'+uyyyy;




                          $(dpicker).datepicker("setDate", dfrom);
                          var formatdate = new Date(dfromraw);
                          console.log("formatdate");
                          console.log(formatdate);
                          console.log("formatdate");







                          formatdate.setDate(formatdate.getDate()+7);
                          var tdd = formatdate.getDate();
                          var tmm = formatdate.getMonth()+1; //January is 0!
                          var tyyyy = formatdate.getFullYear();
                          if(tdd<10) { tdd='0'+tdd }
                          if(tmm<10) {  tmm='0'+tmm }
                          duntil = tdd+'-'+tmm+'-'+tyyyy;



                          tmpdate = new Date(dfrom);
                          $(upicker).datepicker("setDate", duntil);
                        //  $(dpicker).datepicker( "option", "setDate", dfrom);


                  }

                }
              }
            }


          };


          $('#my-timeline').on("UPDATE", function() {
            finaljson=jsonmaken();
            $(this).updateDisplay();

          });


        });
