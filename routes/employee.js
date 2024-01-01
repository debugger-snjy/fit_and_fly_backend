// This file is used for Operations by Employee

// Importing the express Package
const express = require('express');

// Create a router of the express
const router = express.Router()

// Importing the express-validator
const { body, validationResult } = require('express-validator');

const { MongoClient } = require('mongodb');

const Items = require('../models/Items');
const Orders = require('../models/Orders');
const Employees = require('../models/Employee');
const Customers = require('../models/Customer')

// Getting the Middle ware
const fetchUser = require('../middleware/fetchUserId');

// Module to use the Mailing Services
const nodemailer = require("nodemailer")

// Importing the dotenv for JWT_SECRET_KEY access
const dotenv = require('dotenv');

// Getting the Environment Variables from the env file
dotenv.config();

// Function to Send a Mail : 
const sendMailFromAccount = async (userEmail, subjectData, bodyData) => {

    try {

        // Creating the transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fitandfly.sanjay@gmail.com',
                pass: process.env.MAIL_PASSKEY,
            },
        });

        await transporter.sendMail({
            from: "fitandfly.sanjay@gmail.com",
            to: userEmail,
            subject: subjectData,
            html: bodyData,
            attachments: [{
                filename: 'Fit&Fly.png',
                path: '../Fit&Fly.png',
                cid: 'fit&flylogo2023' //same cid value as in the html img src
            }]
        });




        // TODO : Make Alert Message of the Transaction

        return true
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
        return 0
    }

}

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Function to check whether the Uploaded File is a Image or not :
function isImageFile(filePath) {
    const ext = path.extname(filePath);

    // Check if the file extension is .xlsx (case-insensitive)
    return ext.toLowerCase() === '.png' || ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.jpeg' || ext.toLowerCase() === ".avif";
}

// Set up storage for uploaded files for Category Images
const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        const folderPath = "H:\\Intership Projects - Silver Touch\\Assignment 1 - Project\\Frontend\\fit_and_fly\\public\\Categories"

        fs.mkdir(folderPath, (err) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log('The folder already exists.');
                } else {
                    console.error(`Error creating the folder: ${err}`);
                }
            } else {
                console.log('Folder created successfully.');
            }
        });

        cb(null, folderPath + '\\');

    },
    filename: (req, file, cb) => {

        cb(null, "CAT - " + req.body.categoryName + "." + file.originalname.split(".")[1]);

    }
});

// Set up storage for uploaded files for Attendance
const itemStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        const folderPath = "H:\\Intership Projects - Silver Touch\\Assignment 1 - Project\\Frontend\\fit_and_fly\\public\\Items"

        fs.mkdir(folderPath, (err) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log('The folder already exists.');
                } else {
                    console.error(`Error creating the folder: ${err}`);
                }
            } else {
                console.log('Folder created successfully.');
            }
        });

        cb(null, folderPath + '\\');

    },
    filename: (req, file, cb) => {

        cb(null, req.body.itemCode + "_" + req.body.itemName + "." + file.originalname.split(".")[1]);

    }
});

// Create the multer instance for Attendance
const itemUpload = multer({ storage: itemStorage });

// Create the multer instance for Attendance
const categoryUpload = multer({ storage: categoryStorage });

// =====================================================================================================================================================
// ----- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ----------
// =====================================================================================================================================================

// For Fetching Carts Items - GET Request
// Full Route : /api/employee/fetch/allcartitems
router.get('/fetch/allcartitems', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Cart Items Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.carts?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("carts");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allCartItems = await cursor.toArray();

        if (allCartItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Cart Items Record has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allCartItems)
        }

        return res.json({ status: status, msg: msg, cartItems: allCartItems });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ------
// =======================================================================================================================================================

// For Fetching Orders - GET Request
// Full Route : /api/employee/fetch/allorders
router.get('/fetch/allorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Orders Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.orders?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("orders");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allOrders = await cursor.toArray();

        if (allOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allOrders)
        }

        return res.json({ status: status, msg: msg, orders: allOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Approved Orders - GET Request
// Full Route : /api/employee/fetch/approvedorders
router.get('/fetch/approvedorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Approved Orders Found !";

    try {

        // Finding all the Item
        const allApprovedOrders = await Orders.find({ orderStatus: "Approved" });

        if (allApprovedOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Approved Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allApprovedOrders)
        }

        return res.json({ status: status, msg: msg, orders: allApprovedOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Unapproved Orders - GET Request
// Full Route : /api/employee/fetch/unapprovedorders
router.get('/fetch/unapprovedorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Unapproved Orders Found !";

    try {

        // Finding all the Item
        const allUnapprovedOrders = await Orders.find({ orderStatus: "Approval Remaining" });

        if (allUnapprovedOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Approved Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allUnapprovedOrders)
        }

        return res.json({ status: status, msg: msg, orders: allUnapprovedOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Approving an Order - PUT Request
// Full Route : /api/employee/approve/order/:orderid
router.put('/approve/order/:orderid', fetchUser, [

    body("arrivalTime", "Your Arrival Time is Required").exists()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Order NOT Approved Successfully !";

    try {

        const userData = await Employees.findById(req.user.id)
        let approveDate = new Date();

        // Finding the Order with that id
        const orderToApprove = await Orders.findById(req.params.orderid);
        console.log(orderToApprove)

        const customerData = await Customers.findById(orderToApprove.user)

        if (orderToApprove.orderStatus === "Approval Remaining") {

            const approvedOrder = await Orders.findByIdAndUpdate(req.params.orderid, { $set: { orderStatus: "Approved", orderApproveDate: approveDate.toLocaleString(), orderApprovedBy: "Employee", orderApproverName: userData.name, orderArrivalTime: req.body.arrivalTime } }, { new: true });

            if (approvedOrder) {

                // Setting up the parameters
                status = "success";
                msg = "Order has been Approved Successfully"

                const orderUserEmail = customerData.email;
                const orderSubjectData = "Fit&Fly - Order : " + approvedOrder.orderID + " Approved !";
                const orderBodyData = `
                <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid #ddd">
                    <center>
                        <img src="cid:fit&flylogo2023" width="50%"><br>
                        <hr color="black" size="3px">
                    </center>
                
                    <p>Hello ${customerData.name} !</p>
                    <p>This Email is to notify that your order that you have placed from your Account is approved and you will receive the order within ${approvedOrder.orderArrivalTime} Days.</p>
                    <p>Orders Details : </p>
                    <p>
                    <table border="2" width="50%">
                        <tr align="left">
                            <th>Order ID</th>
                            <td>${approvedOrder.orderID}</td>
                        </tr>
                        <tr align="left">
                            <th>Order From</th>
                            <td>${approvedOrder.orderFrom}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Price</th>
                            <td>Rs ${approvedOrder.orderPrice}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Date</th>
                            <td>${approvedOrder.orderDate.toLocaleString()}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Status</th>
                            <td>${approvedOrder.orderStatus}</td>
                        </tr>
                        <tr align="left">
                            <th>Your Account Balance</th>
                            <td>${customerData.account_balance}</td>
                        </tr>
                
                    </table>
                    </p>
                    <br><br><br><br>
                    <hr>
                    <p><small>This is a auto-generated message.</small></p>
                </div>
                `

                const sentApprovedOrderMail = await sendMailFromAccount(orderUserEmail, orderSubjectData, orderBodyData)

                if (sentApprovedOrderMail) {
                    console.log("Approval Mail Sent !")
                }
                else {
                    console.log("Approval Mail Not Sent !")
                }

                return res.json({ status: status, msg: msg, orders: approvedOrder });

            }
        }
        else if (orderToApprove.orderStatus === "Approved") {
            // Setting up the parameters
            status = "success";
            msg = "Order has already Approved"
        }

        return res.json({ status: status, msg: msg });

    } catch (error) {
        console.log(error)

        if (error.path === "_id") {
            // Setting up the parameters
            status = "failed";
            msg = "Order with this Order ID not Found"
            res.status(500).json({ status: status, msg: msg });
        }
        else {
            console.log("Error Occured !")
            console.error("Error : ", error.message)
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
});

// For Disapproving an Order - PUT Request
// Full Route : /api/employee/disapprove/order/:orderid
router.put('/disapprove/order/:orderid', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Order NOT Disapproved Successfully !";

    try {

        const userData = await Employees.findById(req.user.id)

        // Finding the Order with that id
        const orderToDisapprove = await Orders.findById(req.params.orderid);

        const customerData = await Customers.findById(orderToDisapprove.user)

        if (orderToDisapprove.orderStatus === "Approved") {

            const disapprovedOrder = await Orders.findByIdAndUpdate(req.params.orderid, { $set: { orderStatus: "Approval Remaining", orderApproveDate: null, orderArrivalTime: 0, orderApprovedBy: "None", orderApproverName: "", orderDisapprovedBy: "Employee", orderDisapproverName: userData.name } }, { new: true });

            if (disapprovedOrder) {

                // Setting up the parameters
                status = "success";
                msg = "Order has been Disapproved Successfully"

                const orderUserEmail = customerData.email;
                const orderSubjectData = "Fit&Fly - Order : " + disapprovedOrder.orderID + " DisApproved !";
                const orderBodyData = `
                <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid #ddd">
                    <center>
                        <img src="cid:fit&flylogo2023" width="50%"><br>
                        <hr color="black" size="3px">
                    </center>
                
                    <p>Hello ${customerData.name} !</p>
                    <p>This Email is to notify that your order that you have placed from your Account is disapproved by the Company due to some issues. Soon your order will be approved again !</p>
                    <p>Orders Details : </p>
                    <p>
                    <table border="2" width="50%">
                        <tr align="left">
                            <th>Order ID</th>
                            <td>${disapprovedOrder.orderID}</td>
                        </tr>
                        <tr align="left">
                            <th>Order From</th>
                            <td>${disapprovedOrder.orderFrom}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Price</th>
                            <td>Rs ${disapprovedOrder.orderPrice}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Date</th>
                            <td>${disapprovedOrder.orderDate.toLocaleString()}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Status</th>
                            <td>${disapprovedOrder.orderStatus}</td>
                        </tr>
                        <tr align="left">
                            <th>Your Account Balance</th>
                            <td>${customerData.account_balance}</td>
                        </tr>
                
                    </table>
                    </p>
                    <br><br><br><br>
                    <hr>
                    <p><small>This is a auto-generated message.</small></p>
                </div>
                `

                const sentDisapprovedOrderMail = await sendMailFromAccount(orderUserEmail, orderSubjectData, orderBodyData)

                if (sentDisapprovedOrderMail) {
                    console.log("Disapproval Mail Sent !")
                }
                else {
                    console.log("Disapproval Mail Not Sent !")
                }

                return res.json({ status: status, msg: msg, orders: disapprovedOrder });

            }
        }
        else if (orderToDisapprove.orderStatus === "Approval Remaining") {
            // Setting up the parameters
            status = "success";
            msg = "Order has Already Disapproved Successfully !"
        }

        return res.json({ status: status, msg: msg });

    } catch (error) {
        console.log(error)

        if (error.path === "_id") {
            // Setting up the parameters
            status = "failed";
            msg = "Order with this Order ID not Found"
            res.status(500).json({ status: status, msg: msg });
        }
        else {
            console.log("Error Occured !")
            console.error("Error : ", error.message)
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
});


// =======================================================================================================================================================
// ----- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST R
// =======================================================================================================================================================

// For Fetching Wishlist - GET Request
// Full Route : /api/employee/fetch/allwishlists
router.get('/fetch/allwishlists', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Wishlist Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.wishlist?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("wishlist");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allWishlist = await cursor.toArray();

        if (allWishlist.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Wishlist has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allWishlist)
        }

        return res.json({ status: status, msg: msg, orders: allWishlist });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- I
// =======================================================================================================================================================

// For Adding Item - POST Request
// Full Route : /api/employee/add/item
router.post('/add/item', itemUpload.single('file'), [

    body("itemName", "Your Item Name is Required").exists(),
    body("itemPrice", "Your Item Price is Required").exists(),
    body("itemType", "Your Item Type is Required").exists(),
    body("itemCategory", "Your Item Category is Required").exists(),
    body("itemCode", "Your Item Code Balance is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item has NOT Added Successfully";

    try {

        let validImageFile = false;
        let fileuploadName;

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        if (req.file) {
            // Check if the File type is for an Image file
            if (isImageFile(req.file.filename.toString().toLowerCase())) {
                validImageFile = true
                fileuploadName = req.body.itemCode + "_" + req.body.itemName + "." + req.file.originalname.split(".")[1];
            } else {
                validImageFile = false
                status = "failed";
                msg = "File is in NOT Valid Format !"
                return res.json({ status: status, msg: msg });
            }

            if (validImageFile) {

                // If no Errors are found !!
                const { itemName, itemDate, itemPrice, itemType, itemCategory, itemImages, itemCode } = req.body;

                let newItemDate = new Date(itemDate).toLocaleString();
                let itemAddedBy = "Admin";

                // Create a new item document
                const item = new Items({
                    itemName,
                    newItemDate,
                    itemPrice,
                    itemType,
                    itemCategory,
                    itemImages: fileuploadName,
                    itemAddedBy,
                    itemCode,
                });

                // Save the item document to the database
                // If saved successfully
                if (await item.save()) {

                    // Setting up the parameters
                    status = "success";
                    msg = "Item Record has been Added Successfully"

                    // Printing all the item 
                    console.log(item)
                }

                return res.json({ status: status, msg: msg, item: item });
            }
            return res.json({ status: status, msg: msg });
        }
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ status: status, msg: 'Item with this Item Code Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching Item - GET Request
// Full Route : /api/employee/fetch/item/:id
router.get('/fetch/item/:id', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items Record has NOT Fetched Successfully";

    try {
        // Finding all the Items 
        const item = await Items.find({ _id: req.params.id });

        if (item.length !== 0) {

            const updateItemViews = await Items.findByIdAndUpdate(req.params.id, { $set: { itemViews: item[0].itemViews + 1 } }, { new: true });

            if (updateItemViews.length) {
                console.log("Views Updated Successfully !!")
            }
            else {
                console.log("Views Updation Failed !!")
            }

            // Setting up the parameters
            status = "success";
            msg = "Items Record has been Fetched Successfully"

            // Printing the item
            console.log(item)

            // Code to check that we get the date in the normal string format or not ?
            // const datecheck = new Date(item[0].itemDate).toLocaleString()
            // console.log("Date : ",item[0].itemDate)
            // console.log("Date : ",datecheck)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Item - GET Request
// Full Route : /api/employee/fetch/item/itemcode/:itemcode
router.get('/fetch/item/itemcode/:itemcode', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items with this Item Code NOT Exists";

    try {
        // Finding all the Item
        const item = await Items.find({ itemCode: req.params.itemcode });

        if (item.length !== 0) {

            const updateItemViews = await Items.findByIdAndUpdate(req.params.id, { $set: { itemViews: item[0].itemViews + 1 } }, { new: true });

            if (updateItemViews.length) {
                console.log("Views Updated Successfully !!")
            }
            else {
                console.log("Views Updation Failed !!")
            }

            // Setting up the parameters
            status = "success";
            msg = "Items Record has been Fetched Successfully"

            // Printing the item
            console.log(item)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Items - GET Request
// Full Route : /api/employee/fetch/allitem
router.get('/fetch/allitems', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Items Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.items?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("items");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allItems = await cursor.toArray();

        if (allItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Items Record has been Fetched Successfully"

            // Finding all the Items 
            console.log(allItems)
        }

        return res.json({ status: status, msg: msg, items: allItems });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Item - GET Request
// Full Route : /api/employee/fetch/item/category/:category
router.get('/fetch/item/category/:category', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items with this Category NOT Found !";

    try {
        // Finding all the Item
        const item = await Items.find({ itemCategory: req.params.category });

        if (item.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Items in Category has been Fetched Successfully"

            // Printing the item
            console.log(item)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Item - DEL Request
// Full Route : /api/employee/delete/item/:id
router.delete('/delete/item/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item Record Not Found";

    try {

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const item = await Items.findById(req.params.id);

        // If that Item doesn't exists, then returning the Bad Response
        if (!item) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Item Record Not Found !" })
        }

        const deletedItem = await Items.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Item Record has been Deleted Successfully"

        return res.json({ status: status, msg: msg, item: deletedItem });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Item Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Item - PUT Request
// Full Route : /api/employee/update/item/:id
router.put('/update/item/:id', itemUpload.single('file'), [

    body("itemName", "Your Item Name is Required").exists(),
    body("itemPrice", "Your Item Price is Required").exists(),
    body("itemType", "Your Item Type is Required").exists(),
    body("itemCategory", "Your Item Category is Required").exists(),
    body("itemCode", "Your Item Code Balance is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item Record Not Updated Successfully";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no errors are present or found
        const { itemName, itemPrice, itemType, itemCategory, itemImages, itemCode } = req.body;

        let itemLastUpdateBy = "Admin";

        // Create a newItem Object with the new Updated Data 
        const newItem = {
            itemName,
            itemPrice,
            itemType,
            itemCategory,
            itemImages,
            itemCode,
            itemLastUpdateBy
        }

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const item = await Items.findById(req.params.id);

        // If that item doesn't exists, then returning the Bad Response
        if (!item) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Item Record Not Found !" });
        }

        // If code is reached here, that's means the item is belong to the user which is logged in and also that item exists
        const updatedItem = await Items.findByIdAndUpdate(req.params.id, { $set: newItem }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Item Record Updated Successfully"
        return res.json({ status: status, msg: msg, updatedItem });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        if (error.code === 11000) {
            // Setting up the parameters
            status = "failed";
            msg = "Item with this Item Code Already Exists"
            return res.json({ status: status, msg: msg });
        }
        else {
            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Updated Successfully"
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
})

// =======================================================================================================================================================
// ----- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY R
// =======================================================================================================================================================

// For Adding Item - POST Request
// Full Route : /api/employee/add/category
router.post('/add/category', categoryUpload.single('file'), [

    body("categoryName", "Your Category Name is Required").exists(),
    body("categoryAdderName", "Your Category Adder Name is Required").exists(),
    body("categoryAddedBy", "Your Category Added By is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Category has NOT Added Successfully";

    try {

        let validImageFile = false;
        let fileuploadName;

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Catgeory Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        if (req.file) {

            // Check if the File type is for an Image file
            if (isImageFile(req.file.filename.toString().toLowerCase())) {
                validImageFile = true
                fileuploadName = "CAT - " + req.body.categoryName.toString() + "." + req.file.originalname.split(".")[1];
            } else {
                validImageFile = false
                status = "failed";
                msg = "File is in NOT Valid Format !"
                return res.json({ status: status, msg: msg });
            }

            if (validImageFile) {

                // If no Errors are found !!
                const { categoryName, categoryAdderName, categoryAddedBy } = req.body;

                let addedBy = categoryAddedBy;

                // Create a new category document
                const category = new Categories({
                    categoryName,
                    categoryImageLocation: fileuploadName,
                    categoryAdderName,
                    addedBy,
                });

                // Save the category document to the database
                // If saved successfully
                if (await category.save()) {

                    // Setting up the parameters
                    status = "success";
                    msg = "Category has been Added Successfully"

                    // Printing all the category 
                    console.log(category)
                }

                return res.json({ status: status, msg: msg, category: category });
            }
            return res.json({ status: status, msg: msg });

        }
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ status: status, msg: 'Category Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching All Catgories - GET Request
// Full Route : /api/employee/fetch/allcategories
router.get('/fetch/allcategories', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Catgories Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.categories?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("categories");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allCatgories = await cursor.toArray();

        if (allCatgories.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Catgories has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(allCatgories)
        }

        return res.json({ status: status, msg: msg, categories: allCatgories });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Catgories - GET Request
// Full Route : /api/employee/fetch/allcategoriesnames
router.get('/fetch/allcategoriesnames', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Catgories Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.categories?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("categories");

        const allCatgories = await collection.find({}, { projection: { categoryName: 1 } }).toArray();

        if (allCatgories.length !== 0) {

            const categoryNames = allCatgories.map(category => category.categoryName);

            console.log("Category Names:", categoryNames);

            // Setting up the parameters
            status = "success";
            msg = "All Catgories has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(categoryNames)

            return res.json({ status: status, msg: msg, categories: categoryNames });

        }

        return res.json({ status: status, msg: msg });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Category - DEL Request
// Full Route : /api/employee/delete/category/:id
router.delete('/delete/category/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Category Not Found";

    try {

        // Finding the category from the database, whether the category exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const category = await Categories.findById(req.params.id);

        // If that Category doesn't exists, then returning the Bad Response
        if (!category) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Category Not Found !" })
        }

        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Category has been Deleted Successfully"

        return res.json({ status: status, msg: msg, category: deletedCategory });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Category Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Category - PUT Request
// Full Route : /api/employee/update/category/:id
// router.put('/update/category/:id', categoryUpload.single('file'), [
router.put('/update/category/:id', categoryUpload.single('file'), [

    body("categoryName", "Your Category Name is Required").exists(),
    body("categoryAdderName", "Your Category Adder Name is Required").exists(),
    body("categoryAddedBy", "Your Category Added By is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Category Not Updated Successfully";

    try {

        let validImageFile = false;
        let fileuploadName;

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // if (req.file) {

        //     // Check if the File type is for an Image file
        //     if (isImageFile(req.file.filename.toString().toLowerCase())) {
        //         validImageFile = true
        //         fileuploadName = "CAT - " + req.body.categoryName.toString() + "." + req.file.originalname.split(".")[1];
        //     } else {
        //         validImageFile = false
        //         status = "failed";
        //         msg = "File is in NOT Valid Format !"
        //         return res.json({ status: status, msg: msg });
        //     }
        // }

        // If no errors are present or found
        const { categoryName, categoryAdderName, categoryAddedBy } = req.body;

        let newCategory;

        // if (validImageFile) {
        //     // Create a newCategory Object with the new Updated Data 
        //     newCategory = {
        //         categoryName,
        //         categoryAdderName,
        //         categoryAddedBy,
        //         categoryImageLocation: fileuploadName,
        //     }
        // }
        // else {

        // Create a newCategory Object with the new Updated Data 
        newCategory = {
            categoryName,
            categoryAdderName,
            categoryAddedBy,
        }

        // }

        // Finding the category from the database, whether the category exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const category = await Categories.findById(req.params.id);

        // If that category doesn't exists, then returning the Bad Response
        if (!category) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Category Not Found !" });
        }

        // If code is reached here, that's means the category is belong to the user which is logged in and also that category exists
        const updatedCategory = await Categories.findByIdAndUpdate(req.params.id, { $set: newCategory }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Category Updated Successfully";
        return res.json({ status: status, msg: msg, updatedCategory });

    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        if (error.code === 11000) {
            // Setting up the parameters
            status = "failed";
            msg = "Category Already Exists"
            return res.json({ status: status, msg: msg });
        }
        else {
            // Setting up the parameters
            status = "failed";
            msg = "Category Not Updated Successfully"
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
})

// =======================================================================================================================================================
// ----- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES -
// =======================================================================================================================================================

// For Fetching Transaction which are cancelled !
// Full Route : /api/employee/fetch/transactions/cancelled
router.get('/fetch/transactions/cancelled', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Cancelled Transactions Found !";

    try {

        // Fetching all the transaction with transactionCancelled : true
        const allCancelledTransactions = await Transactions.find({ transactionCancelled: true });

        if (allCancelledTransactions.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Cancelled Transactions has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(allCancelledTransactions)
        }

        return res.json({ status: status, msg: msg, transactions: allCancelledTransactions });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Transaction which are NOT cancelled !
// Full Route : /api/employee/fetch/transactions/notcancelled
router.get('/fetch/transactions/noncancelled', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Non-Cancelled Transactions Found !";

    try {

        // Fetching all the transaction with transactionCancelled : true
        const allNonCancelledTransactions = await Transactions.find({ transactionCancelled: false });

        if (allNonCancelledTransactions.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Non-Cancelled Transactions has been Fetched Successfully"

            // Finding all the Non-Cancelled Transactions 
            console.log(allNonCancelledTransactions)
        }

        return res.json({ status: status, msg: msg, transactions: allNonCancelledTransactions });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Transaction 
// Full Route : /api/employee/fetch/alltransactions
router.get('/fetch/alltransactions', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Transactions Found !";

    try {

        // Fetching all the transaction with transactionCancelled : true
        const allTransactions = await Transactions.find({});

        if (allTransactions.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Transactions has been Fetched Successfully"

            // Finding all the Transactions 
            console.log(allTransactions)
        }

        return res.json({ status: status, msg: msg, transactions: allTransactions });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

module.exports = router;