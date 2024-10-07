const { resolve } = require('express-hbs/lib/resolver');
var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');
const { Collection } = require('mongo');

const { error } = require('jquery');

// const Razorpay = require('razorpay');
// var instance = new Razorpay({
//     key_id: 'rzp_test_1BNo3QWTFv1lZD',
//     key_secret: 'U96xsmoOABcPB9p4SsTqejTI',
//   });



module.exports = {

    AddAdminId: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let Checkusername = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ "Username": adminData.Username })
            console.log("Check username", Checkusername);

            if (Checkusername == null) {
                adminData.Password = await bcrypt.hash(adminData.Password, 10);
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                    resolve(data.insertedId)
                })
            } else {
                resolve({ status: false })
            }
        });

    },
    doLoginAdmin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Username: adminData.Username })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log("Login Successful");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login Failed");
                resolve({ status: false })

            }
        });
    },

    Contact: (details, callback) => {

        db.get().collection(collection.CONTACT_COLLECTION).insertOne(details).then((data) => {

            console.log(data);
            var Succuess = true
            callback(Succuess)
        })
    },

    GetContact: (callback) => {
        return new Promise(async (resolve, reject) => {
            let contact = await db.get().collection(collection.CONTACT_COLLECTION).find().toArray();

            resolve(contact)
        })

    },

    getActiveDepartments: (callback) => {
        return new Promise(async (resolve, reject) => {
            let Departments = await db.get().collection(collection.DEPARTMENTS_COLLECTION).find({ "status": "ACTIVE" }).toArray();

            resolve(Departments)
        })

    },

    getInActiveDepartments: (callback) => {
        return new Promise(async (resolve, reject) => {
            let Departments = await db.get().collection(collection.DEPARTMENTS_COLLECTION).find({ "status": "INACTIVE" }).toArray();

            resolve(Departments)
        })

    },
    getDepartments: (callback) => {
        return new Promise(async (resolve, reject) => {
            let Departments = await db.get().collection(collection.DEPARTMENTS_COLLECTION).find().toArray();

            resolve(Departments)
        })

    },
    FindDepartments: (Id, callback) => {
        return new Promise(async (resolve, reject) => {
            let Departments = await db.get().collection(collection.DEPARTMENTS_COLLECTION).findOne({ _id: new ObjectId(Id) })

            resolve(Departments)
        })

    },


    addDepartment: (details, callback) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.DEPARTMENTS_COLLECTION).insertOne(details).then((data) => {
                callback(data.insertedId)
            })
        })

    },

    Docterdate: (DocterName) => {
        return new Promise(async(resolve, reject) => {

            let DocterDetails = await db.get().collection(collection.DOCTER_COLLECTION).findOne({ "Docter_Name" : DocterName });
                DocterDetails = await DocterDetails.Docter_Available;

                resolve(DocterDetails);
        })
    },


    updateDepartment: (proId, departmentDetails) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.DEPARTMENTS_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {

                    $set: {
                        Name: departmentDetails.Name,
                        Description: departmentDetails.Description,
                        status: departmentDetails.status
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    updateDocter: (proId, docterDetails) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.DOCTER_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {

                    $set: {
                        Docter_Name: docterDetails.Docter_Name,
                        Email: docterDetails.Email,
                        Phone_Number: docterDetails.Phone_Number,
                        status: docterDetails.Status
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    getDocters: (callback) => {
        return new Promise(async (resolve, reject) => {
            let docters = await db.get().collection(collection.DOCTER_COLLECTION).find().toArray()

            resolve(docters)
        })
    },
    getDutyDocters: (callback) => {
        return new Promise(async (resolve, reject) => {
            let docters = await db.get().collection(collection.DOCTER_COLLECTION).find({ "status": "OnDuty" }).toArray()

            resolve(docters)
        })
    },
    getOffDutyDocters: (callback) => {
        return new Promise(async (resolve, reject) => {
            let docters = await db.get().collection(collection.DOCTER_COLLECTION).find({ "status": "OffDuty" }).toArray()

            resolve(docters)
        })
    },

    addDocter: (docter_Details, callback) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.DOCTER_COLLECTION).insertOne(docter_Details).then((data) => {
                console.log("Data b cbj", data.insertedId);
                callback(data.insertedId)
            })

        })

    },

    FindDocterDetails: (Id, callback) => {
        return new Promise(async (resolve, reject) => {
            let DocterDetails = await db.get().collection(collection.DOCTER_COLLECTION).findOne({ _id: new ObjectId(Id) })

            resolve(DocterDetails)
        })

    },


    off_duty: (proId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.DOCTER_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {

                    $set: {
                        status: "OffDuty",
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    on_duty: (proId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.DOCTER_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {

                    $set: {
                        status: "OnDuty",
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    DeleteDepartment: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DEPARTMENTS_COLLECTION).deleteOne({ _id: new ObjectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },

    FireDocter: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DOCTER_COLLECTION).deleteOne({ _id: new ObjectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },

    Admin_panel: (callback) => {
        return new Promise(async (resolve, reject) => {
            let Admin_panel = await db.get().collection(collection.ADMIN_COLLECTION).find().toArray();

            resolve(Admin_panel)
        })

    },

    DeleteAdminUser: (proId) => {
        return new Promise(async (resolve, reject) => {
            let Admin_user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: new ObjectId(proId) })
            if (Admin_user.Username == "Admin") {

                resolve({ status: false })
            } else {
                db.get().collection(collection.ADMIN_COLLECTION).deleteOne({ _id: new ObjectId(proId) }).then((response) => {
                    resolve(response)
                })
            }

        })
    },

    BookAppointment: (details, callback) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.APPOINTMENT_COLLECTION).insertOne(details).then((data) => {
                console.log(data);
                resolve(data.insertedId)
            })
        })
    },

    GetPendingAppointment: (callback) => {
        return new Promise(async (resolve, reject) => {
            let GetAppointment = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ "status": "PENDING" }).toArray();

            resolve(GetAppointment)
        })

    },

    GetConfirmedAppointment: (callback) => {
        return new Promise(async (resolve, reject) => {
            let GetAppointment = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ "status": "CONFIRMED" }).toArray();

            resolve(GetAppointment)
        })

    },

    GetCompletedAppointment: (callback) => {
        return new Promise(async (resolve, reject) => {
            let GetAppointment = await db.get().collection(collection.APPOINTMENT_COLLECTION).find({ "status": "COMPLETED" }).toArray();

            resolve(GetAppointment)
        })

    },

    ConfirmAppointment: (proId) => {
        return new Promise(async(resolve, reject) => {

            let GetAppointment = await db.get().collection(collection.APPOINTMENT_COLLECTION).findOne({ _id : new ObjectId(proId) });

            console.log("Appointment details = " +GetAppointment);

            db.get().collection(collection.APPOINTMENT_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {

                    $set: {
                        "status": "CONFIRMED"
                    }
                }).then((response) => {
                    resolve(GetAppointment)
                })
        })

    },

    CancelledAppointment: (proId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.APPOINTMENT_COLLECTION).deleteOne({ _id: new ObjectId(proId) }).then((response) => {
                resolve(response);
            })
        })
    },

    CompleteAppointment: (proId) => {
        return new Promise(async(resolve, reject) => {

            db.get().collection(collection.APPOINTMENT_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {

                    $set: {
                        "status": "COMPLETED"
                    }
                }).then((response) => {
                    resolve(response)
                })
        })

    },



}