const express = require("express")
var router = express.Router();

var userHelpers = require('../Helpers/user-helpers')
var appointmentSucess =  false

var docterConfirm = false;

var docterName;

/* GET home page. */
router.get('/', async function (req, res, next) {

  let department = await userHelpers.getDepartments()
  let docter = await userHelpers.getDutyDocters()

  res.render('user/home',{ department,docter, appointmentSucess});

});

router.get('/about', async function (req, res, next) {

  res.render('user/about');

});
router.get('/service', async function (req, res, next) {

  let department = await userHelpers.getDepartments()
  let docter = await userHelpers.getDutyDocters()
  console.log("Docter :  ",docter);
  
  res.render('user/service',{ department,docter,appointmentSucess});
  appointmentSucess = false
});
router.post('/service', async function (req,res, next) {
    userHelpers.BookAppointment(req.body).then((data) => {
      appointmentSucess = true
      res.redirect('/service')
    })
})


router.get('/price', async function (req, res, next) {

  res.render('user/price');

});

router.get('/detail', async function (req, res, next) {

  res.render('user/detail');

});

router.get('/gallery', async function (req, res, next) {

  res.render('user/gallery');

});

router.get('/appointment', async function (req, res, next) {
  let department = await userHelpers.getDepartments()
  let docter = await userHelpers.getDutyDocters()

  console.log("Docter " + docter);
  
  const today = new Date().toISOString().split('T')[0];

  if(docterConfirm){
    var date = await userHelpers.Docterdate(docterName)
    console.log("Date :" + date);
    
    res.render('user/appointment',{ department,docter,appointmentSucess, today, docterConfirm, docterName, date});

  }else{
 
    res.render('user/appointment',{ department,docter,appointmentSucess, today, docterConfirm, docterName});

  }

});

router.post('/docterconfirm', function(req, res, next) {
  
  docterConfirm = true;
  docterName =  req.body.DocterName;
  docterName.toString();
  res.redirect('/appointment')
})

router.post('/docterdelete', function(req, res, next) {
  docterConfirm = false;
  docterName = "";
  res.redirect('/appointment');
})

router.post('/appointment', async function (req,res, next) {
    userHelpers.BookAppointment(req.body).then((data) => {
      appointmentSucess = true
      res.redirect('/')
    })
})

router.get('/contact', async function (req, res, next) {
  res.render('user/contact');
})
router.post('/contact', async function (req, res, next) {
 
    userHelpers.Contact(req.body, ()=>{
      
      res.redirect('/contact');  
    })
})


router.get('/team', async function (req, res, next) {
  res.render('user/team');
})

router.get('/testimonial', async function (req, res, next) {
  res.render('user/testimonial');
})

module.exports = router;