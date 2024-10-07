var express = require('express');
var router = express.Router();

var userHelpers = require('../Helpers/user-helpers')
const Handlebars = require('handlebars');
const fs = require("fs")

Handlebars.registerHelper('isEqual', function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

const verifyLogin = (req, res, next) => {

  if (req.session.adminloggedIn) {
    next()
  } else {
    res.redirect('/admin/login')

  }
}

/* GET users listing. */

// Home Page 
router.get('/', verifyLogin, async function (req, res, next) {
  var duty_docters = await userHelpers.getDutyDocters();
  var offDuty_docters = await userHelpers.getOffDutyDocters();
  var docters = duty_docters.length + offDuty_docters.length;

  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length

  var PendingAppointments = await userHelpers.GetPendingAppointment()
  var PendingAppointmentsLength = PendingAppointments.length

  var ConfirmAppointments = await userHelpers.GetConfirmedAppointment()
  var ConfirmAppointmentsLength = ConfirmAppointments.length

  var CompletedAppointments = await userHelpers.GetCompletedAppointment()
  var CompletedAppointmentsLength = CompletedAppointments.length

  let Admin = req.session.admin.Username



  res.render('admin/home', { admins: true, Admin, duty_docters, offDuty_docters, docters, PendingAppointmentsLength, ConfirmAppointmentsLength, contactslength, CompletedAppointmentsLength, PendingAppointments })

});

// Admin Signup And Login

router.get('/add-AdminUser', verifyLogin, async (req, res, next) => {
  let Admin = req.session.admin.Username
  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length
  res.render('admin/add_AdminUser', { admins: true, Admin, contactslength });
});

router.post('/add-AdminUser', verifyLogin, (req, res) => {

  userHelpers.AddAdminId(req.body).then((response) => {

    res.redirect('/admin/admin-panel');
  })
});

router.get('/login', (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { "loginErr": req.session.loginErr, footer: true })
    req.session.loginErr = false;
  }
});

router.post('/login', (req, res) => {
  userHelpers.doLoginAdmin(req.body).then((response) => {
    if (response.status) {
      req.session.adminloggedIn = true;
      req.session.admin = response.admin;
      res.redirect('/admin');

    } else {
      req.session.loginErr = true;
      res.redirect('/admin/login');
    }
  })
});
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false
  req.session.destroy()
  res.redirect('/')
})

// Contact Form
router.get('/contact', verifyLogin, async (req, res) => {
  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length
  let Admin = req.session.admin.Username

  userHelpers.GetContact().then((Contacts) => {
    console.log("Contact: " + Contacts.name);

    res.render('admin/view-contacts', { admins: true, Contacts, contactslength, Admin })
  })

})

// Department Management

router.get('/departments', verifyLogin, async (req, res) => {

  let Activedepartments = await userHelpers.getActiveDepartments()
  let InActivedepartments = await userHelpers.getInActiveDepartments()

  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length

  let Admin = req.session.admin.Username
  res.render('admin/departments', { admins: true, Activedepartments, InActivedepartments, contactslength, Admin })
})


router.get('/add-department', verifyLogin, async (req, res) => {
  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length

  let Admin = req.session.admin.Username

  res.render('admin/add-department', { admins: true, contactslength, Admin })
})

router.post('/add-department', verifyLogin, async (req, res) => {
  // number_of_docters = await userHelpers.NumberOfDocters()

  userHelpers.addDepartment(req.body, () => {
    res.redirect('/admin/departments');
  })

})

router.get('/edit-department/:id', verifyLogin, async (req, res) => {

  let department = await userHelpers.FindDepartments(req.params.id)
  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length

  let Admin = req.session.admin.Username

  res.render('admin/edit-department', { department, admins: true, contactslength, Admin })
})

router.post('/edit-department/:id', verifyLogin, (req, res) => {
  userHelpers.updateDepartment(req.params.id, req.body).then(() => {
    res.redirect('/admin/departments')

  })
})

router.get('/delete-department/:id', verifyLogin, (req, res) => {

  userHelpers.DeleteDepartment(req.params.id).then(() => {
    res.redirect('/admin/departments');
  })
})

// Docter Management

router.get('/docters', verifyLogin, async (req, res) => {
  var duty_docters = await userHelpers.getDutyDocters();
  console.log("Duty Docters", duty_docters);

  var offDuty_docters = await userHelpers.getOffDutyDocters()

  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length

  let Admin = req.session.admin.Username
  res.render('admin/docters', { admins: true, duty_docters, offDuty_docters, contactslength, Admin })

})

router.get('/add-docters', verifyLogin, async function (req, res, next) {
  var department = await userHelpers.getDepartments();
  console.log("Departments: " + department.Name);

  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length

  let Admin = req.session.admin.Username

  res.render('admin/add-docter', { admins: true, department, contactslength, Admin })
});

router.post('/add-docters', verifyLogin, (req, res) => {

  userHelpers.addDocter(req.body, (id) => {


    res.redirect('/admin/docters')
  })

})

router.get('/edit-docter/:id', verifyLogin, async (req, res) => {
  var department = await userHelpers.getDepartments();
  let docter = await userHelpers.FindDocterDetails(req.params.id)

  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length
  console.log("Docter Details: " + docter);

  let Admin = req.session.admin.Username

  res.render('admin/edit-docters', { docter, admins: true, department, contactslength, Admin })
})

router.post('/edit-docter/:id', verifyLogin, (req, res) => {
  userHelpers.updateDocter(req.params.id, req.body).then(() => {

    let id = req.params.id;


    res.redirect('/admin/docters')

  })
})


router.get('/off-duty/:id', verifyLogin, (req, res) => {
  userHelpers.off_duty(req.params.id).then(() => {
    res.redirect('/admin/docters')

  })
})

router.get('/on-duty/:id', verifyLogin, (req, res) => {
  userHelpers.on_duty(req.params.id).then(() => {
    res.redirect('/admin/docters')

  })
})

router.get('/Fire-Docter/:id', verifyLogin, (req, res) => {
  var DocterId = req.params.id
  var pathToFile = './public/docter-images/' + DocterId + '.jpg'
  userHelpers.FireDocter(DocterId).then(() => {
    
    res.redirect('/admin/docters');
  })
})

// Admin Panel 

router.get('/admin-panel', verifyLogin, async (req, res) => {
  userHelpers.Admin_panel().then(async (Admin_panel) => {
    console.log("Admin: Panel ", Admin_panel);
    let length = await Admin_panel.length;
    console.log("Length of admin panel", length);

    let contacts = await userHelpers.GetContact()
    let contactslength = contacts.length

    let Admin = req.session.admin.Username

    res.render('admin/admin-panel', { Admin_panel, admins: true, length, contactslength, Admin })
  })
})
router.get('/delete-admin-user/:id', verifyLogin, async (req, res) => {
  userHelpers.DeleteAdminUser(req.params.id).then(async (Admin_panel) => {
    res.redirect('/admin/admin-panel')
  })
})

router.get('/appointments', verifyLogin, async function (req, res, next) {

  var PendingAppointments = await userHelpers.GetPendingAppointment()
  var ConfirmAppointments = await userHelpers.GetConfirmedAppointment()
  var CompletedAppointment = await userHelpers.GetCompletedAppointment()

  let contacts = await userHelpers.GetContact()
  let contactslength = contacts.length
  let Admin = req.session.admin.Username

  res.render('admin/appointment', { admins: true, PendingAppointments, ConfirmAppointments, CompletedAppointment, contactslength , Admin})
})

router.get('/confirm-appointment/:id', verifyLogin, async function (req, res, next) {


  userHelpers.ConfirmAppointment(req.params.id).then(async (AppointmentDetails) => {

    // let link = 'https://wa.me/91'+AppointmentDetails.Phone_Number+'?text=Dear%20'+AppointmentDetails.Name+',%0AYour%20Appointment%20With%20Dr.'+AppointmentDetails.DocterName+'%20At%20Aysha%20Clinic%20Has%20Been%20Successfully%20Booked%20For%20'+AppointmentDetails.Booking_Date+'.%20If%20You%20Need%20To%20Reschedule%20or%20Cancel%20Your%20Appointment,%20Please%20Contact%20Us%20At%20+91%2088480%2054467.%20Thank%20You%20For%20Choosing%20Aysha%20Clinic.'
    let link = 'https://wa.me/91' + AppointmentDetails.Phone_Number + '?text=Booking%20Confirmation%20-%20Aysha%20Clinic%0A%0ADear%20' + AppointmentDetails.Name + '%0A%0AYour%20appointment%20with%20Dr.%20' + AppointmentDetails.DocterName + '%20at%20Aysha%20Clinic%20has%20been%20successfully%20booked.%0A%0A%2A%2AAppointment%20Details%3A%2A%2A%0A-%20%2A%2ADate%3A%2A%2A%20' + AppointmentDetails.Booking_Date + '%0A%0AIf%20you%20need%20to%20reschedule%20or%20cancel%20your%20appointment%2C%20please%20contact%20us%20at%20%5BPhone%20Number%5D.%0A%0AThank%20you%20for%20choosing%20Aysha%20Clinic.%20We%20look%20forward%20to%20seeing%20you.%0A%0ABest%20regards%2C%0AAysha%20Clinic%0A%0A'

    console.log("Link : " + link);

    res.redirect(link)
  })
})

router.get('/cancel-appointment/:id', verifyLogin, async function (req, res, next) {
  userHelpers.CancelledAppointment(req.params.id).then(async (Appointments) => {
    res.redirect('/admin/appointments/')
  })
})

router.get('/complete-appointment/:id', verifyLogin, async function (req, res, next) {
  userHelpers.CompleteAppointment(req.params.id).then(async (Appointments) => {
    res.redirect('/admin/appointments/')
  })
})

module.exports = router;
