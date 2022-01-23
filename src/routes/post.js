const express = require("express");
const newsRouter = express.Router();
const nodemailer = require("nodemailer");
const dbcon = require("../database/connection");
const map = require("lodash/map");
const multer = require("multer");
const path = require("path");
const API_URL = require('../clientConfig');

let imageName;
const storage = multer.diskStorage({
    destination: "./public/images",
    filename: (req, file, cb) => {
        imageName =
            file.fieldname + "-" + Date.now() + path.extname(file.originalname);

        return cb(null, imageName);
    },
});

const upload = multer({
    storage: storage,
    limits: { fieldSize: 105906176 },
});



// post data
newsRouter.post('/add_data', async(req, res) => {
    const image = [];
    const multipleArrary = upload.array("file", 20);
    multipleArrary(req, res, function (err) {
        if (err) {
            return res.send({ error: true, message: "Error uploading file." });
        }
        map(req.files, (o) => {
            image.push(o.filename);
        });

        const img = JSON.stringify(image);
        const sub_title = req.body.subTitle;
        const title = req.body.title;
        const description = req.body.description;
        const more_details = req.body.more_details;
        const year = req.body.year;
        const alias_name = req.body.alias_name;

        const sql =
            "INSERT INTO main_table (sub_title,title,description,more_details,year,img,alias_name) VALUES (?,?,?,?,?,?,?)";
        dbcon.query(
            sql,
            [sub_title, title, description, more_details, year, img, alias_name],
            (error, result, fields) => {
                if (error) throw error;
                return res.json({
                    error: false,
                    data: {
                        resp: {
                            subTitle: sub_title,
                            title,
                            description,
                            more_details,
                            year,
                            img,
                        },
                    },
                    message: "Upload data Successfully",
                });
            }
        );
    });
})

// post media
newsRouter.post("/add_media", async (req, res) => {
    const image = [];
    const bannerImage = [];
    const multipleArrary = upload.array("file", 20);

    multipleArrary(req, res, function (err) {
        const isBanner = req.body.bannerImage;
        if (err) {
            return res.send({ error: true, message: "Error uploading file." });
        }
        map(req.files, (o, index) => {
            if (index === 0 && isBanner) {
                bannerImage.push(o.filename);
            } else {
                image.push(o.filename);
            }
        });

        const gallary = JSON.stringify(image);
        const banner_img = JSON.stringify(bannerImage);
        const title = req.body.title;
        const description = req.body.description;
        const sql =
            "INSERT INTO media_table (title,description,gallary,banner_img) VALUES (?,?,?,?)";
        dbcon.query(
            sql,
            [title, description, gallary, banner_img],
            (error, result, fields) => {
                if (error) throw error;
                return res.json({
                    error: false,
                    data: {
                        resp: {
                            title,
                            description,
                        },
                    },
                    message: "Upload data Successfully",
                });
            }
        );
    });
});

//Post Collection
newsRouter.post("/add_collection", upload.single("file"), (req, res) => {
    let img = imageName;
    const title = req.body.title;
    const size_x = req.body.size_x;
    const size_y = req.body.size_y;
    const size_type = req.body.size_type;
    const weight = req.body.weight;
    const thickness = req.body.thickness;
    const tiles = req.body.tiles;
    const sql =
        "INSERT INTO collection_table (title,size_x,size_y,size_type,weight,thickness,tiles,img) VALUES (?,?,?,?,?,?,?,?)";

    return dbcon.query(
        sql,
        [title, size_x, size_y, size_type, weight, thickness, tiles, img],
        (error, result, fields) => {
            if (error) throw error;
            return res.json({
                error: false,
                data: {
                    resp: {
                        title,
                        size: { size_x, size_y, size_type },
                        weight,
                        thickness,
                        tiles,
                        img: `${API_URL}/${img}`,
                    },
                },
                message: "Upload data Successfully",
            });
        }
    );
});

// post footer
newsRouter.post("/footer", upload.single("file"), (req, res) => {
    let img = imageName;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const address = req.body.address;
    const facebook = req.body.facebook;
    const twitter = req.body.twitter;
    const instagram = req.body.instagram;
    const printrest = req.body.printrest;
    const sql =
        "INSERT INTO footer (mobile,email,address,facebook,twitter,instagram,printrest,logo) VALUES (?,?,?,?,?,?,?,?)";

    return dbcon.query(
        sql,
        [mobile, email, address, facebook, twitter, instagram, printrest, img],
        (error, result, fields) => {
            if (error) throw error;
            return res.json({
                error: false,
                data: {
                    result,
                    resp: {
                        mobile,
                        email,
                        address,
                        facebook,
                        twitter,
                        instagram,
                        printrest,
                        logo: `${API_URL}/${req.file.filename}`,
                    },
                },
                message: "Upload data Successfully",
            });
        }
    );
});

// send email
newsRouter.post("/send_email", (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            // here add client email and password
            user: "abcd@abcd.com",
            pass: "111",
        },
    });
    const mailOption = {
        from: req.body.data.emailid,
        // here add client email
        to: "abcd@abcd.com",
        subject: "mail send",
        text: "Hello!",
        html: `<h1> ${req.body.data.formType}</h1>
          <ul>
            <li>name: ${req.body.data.name}</li>
            <li>email: ${req.body.data.emailid}</li>
            <li>mobile: ${req.body.data.phone}</li>
          </ul>
          <div>
          <h4> Message </h4>
          <p>${req.body.data.message}</p>
          </div>
          `,
    };

    transporter.sendMail(mailOption, (error, info) => {
        if (error) throw error;
        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return res.send({
            error: false,
            data: { messageIdL: info.messageId },
            status: 200,
            message: "Email send Success",
        });
    });
});

module.exports = newsRouter;