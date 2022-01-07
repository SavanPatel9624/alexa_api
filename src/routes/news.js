const express = require('express')
const newsRouter = express.Router()
const axios = require('axios');
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const map = require("lodash/map");
const filter = require("lodash/filter");
const size = require("lodash/size");
const replace = require("lodash/replace");

const apiUrl = 'https://alexa-api-2.herokuapp.com';

const dbcon = mysql.createConnection({
    port: 3306,
    connectionLimit: 1000,
    // host: "bk3vagjjhjnbhrco2e6c-mysql.services.clever-cloud.com",
    // user: "udowjyundk2bwm90",
    // password: "lPlJcewPxYNEGAouj9y2",
    // database: "bk3vagjjhjnbhrco2e6c",
    host:'sql6.freemysqlhosting.net',
    // user:'u274955297_root',
    // password:'7!K#LqMCKh',
    password:'nE8fZABJXe',
    user:'sql6463918',
    // database:'u274955297_alexa_ceramic',
    database:'sql6463918',
    charset: "utf8mb4",
    multipleStatements: true,
});

dbcon.connect();

let imageName;
let collectionData = [];
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

newsRouter.get('', async(req, res) => {
    return res.send({ error: false, message: "Success" });
});

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

const handleDeleteImage = (fileName) => {
    const directoryPath = "public/images";
    //passing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        console.log("==============files",files);
        console.log("==============files",fileName);
        if(files && files.length > 0) {
            files?.forEach(function (file) {
                // Do whatever you want to do with the file
                if (file === fileName) {
                    fs.unlink( `public/images/${fileName}`, (err) => {
                        if (err) throw err;
                    });
                }
            });
        }
    });
};

newsRouter.put("/update_data/:id", async (req, res) => {
    const image = [];
    const multipleArrary = upload.array("file", 20);
    multipleArrary(req, res, function (err) {
        if (err) {
            return res.send({ error: true, message: "Error uploading file." });
        }
        map(req.files, (o) => {
            image.push(o.filename);
        });

        const id = req.params.id;
        const unLinkImg = req.body.img;
        const sub_title = req.body.subTitle;
        const title = req.body.title;
        const description = req.body.description;
        const more_details = req.body.more_details;
        const year = req.body.year;
        let img;
        const alias_name = req.body.alias_name;

        if (sub_title) {
            const sql = "UPDATE main_table SET sub_title=? WHERE id = ? ";
            dbcon.query(sql, [sub_title, id], (error, result, fields) => {
                if (error) throw error;
            });
        }
        if (title) {
            const sql = "UPDATE main_table SET title=? WHERE id = ? ";
            dbcon.query(sql, [title, id], (error, result, fields) => {
                if (error) throw error;
            });
        }
        if (description) {
            const sql = "UPDATE main_table SET description=? WHERE id = ? ";
            dbcon.query(sql, [description, id], (error, result, fields) => {
                if (error) throw error;
            });
        }
        if (more_details) {
            const sql = "UPDATE main_table SET more_details=? WHERE id = ? ";
            dbcon.query(sql, [more_details, id], (error, result, fields) => {
                if (error) throw error;
            });
        }
        if (year) {
            const sql = "UPDATE main_table SET year=? WHERE id = ? ";
            dbcon.query(sql, [year, id], (error, result, fields) => {
                if (error) throw error;
            });
        }

        if (alias_name === "home_clients" || alias_name === "company_profile") {
            const selectSql =
                "SELECT img FROM main_table WHERE alias_name=? AND id=?";
            const unlink = [];
            map(JSON.parse(unLinkImg), (o) =>
                unlink.push(replace(o, `${apiUrl}/`, ""))
            );
            let getImg = [];
            dbcon.query(selectSql, [alias_name, id], (error, result, fields) => {
                if (error) throw error;
                getImg = JSON.parse(JSON.stringify(result));
                console.log("=======getImg", getImg);
                const oldImg = getImg && JSON.parse(getImg[0].img);
                let deleteImg = [];

                const filterDelete = (oldImg, unlink) => {
                    let res = [];
                    res = oldImg.filter((el) => {
                        return !unlink.find((element) => {
                            return element === el;
                        });
                    });
                    return res;
                };

                const filterNotDelete = (oldImg, unlink) => {
                    let res = [];
                    res = oldImg.filter((el) => {
                        return unlink.find((element) => {
                            return element === el;
                        });
                    });
                    return res;
                };
                console.log("======oldImg", oldImg);
                deleteImg = size(oldImg) > 0 ? filterDelete(oldImg, unlink) : [];
                size(oldImg) > 0 && image.push(...filterNotDelete(oldImg, unlink));
                size(deleteImg) > 0 &&
                map(deleteImg, (img) => {
                    console.log("=======>deleteImg", img);
                    if (img) {
                        handleDeleteImage(img);
                    }
                });
                img = JSON.stringify(image);
                const sql = "UPDATE main_table SET img=? WHERE id = ? ";
                dbcon.query(sql, [img, id], (error, result, fields) => {
                    if (error) throw error;
                });
            });
        } else {
            if (size(image) > 0) {
                const fileName = unLinkImg && unLinkImg.replace(`${apiUrl}/`, "");
                console.log("=======fileName", fileName);

                if (fileName) {
                    handleDeleteImage(fileName);
                }

                img = JSON.stringify(image);
            } else {
                const unlink = [];
                unlink.push(replace(unLinkImg, `${apiUrl}/`, ""));

                img = JSON.stringify(unlink);
            }

            const sql = "UPDATE main_table SET img=? WHERE id = ? ";
            dbcon.query(sql, [img, id], (error, result, fields) => {
                if (error) throw error;
            });
        }

        return res.json({
            error: false,
            message: "Update data Successfully",
        });
    });
});

// get home data
newsRouter.get('/get_home_data',async(req,res)=>{
    const sql = "SELECT * FROM main_table";
    return dbcon.query(sql, (error, result, fields) => {
        if (error) throw error;
        const getAllData = JSON.parse(JSON.stringify(result));
        const homeCarouselData = [];
        const data1 = filter(getAllData, (o) => o.alias_name === "home_carousel");
        map(data1, (item) => {
            const image = JSON.parse(item.img);
            homeCarouselData.push({
                ...item,
                img: image && image[0] && `${apiUrl}/${image && image[0]}`,
            });
        });

        const aboutData = [];
        const data = filter(getAllData, (o) => o.alias_name === "home_about");
        map(data, (item) => {
            const image = JSON.parse(item.img);
            aboutData.push({
                ...item,
                img: image && image[0] && `${apiUrl}/${image && image[0]}`,
                more_details: JSON.parse(item.more_details),
            });
        });

        const homeCollection = [];
        const collection = filter(
            getAllData,
            (o) => o.alias_name === "home_collection"
        );
        map(collection, (item) => {
            const image = JSON.parse(item.img);
            homeCollection.push({
                ...item,
                img: image && image[0] && `${apiUrl}/${image && image[0]}`,
            });
        });

        const homeClients = [];
        const clients = filter(getAllData, (o) => o.alias_name === "home_clients");
        size(clients) > 0 &&
        map(clients, (item) => {
            const image = JSON.parse(item.img);
            const files = [];
            map(image, (i) => {
                i && files.push(`${apiUrl}/${i}`);
            });
            homeClients.push({
                ...item,
                img: files,
            });
        });

        const homeAchievements = filter(
            getAllData,
            (o) => o.alias_name === "home_achievements"
        );

        return res.json({
            error: false,
            data: {
                homeCarouselData,
                aboutData,
                homeCollection,
                homeClients,
                homeAchievements,
            },
            message: "Get Data Successfully",
        });
    });})

// get company profile data
newsRouter.get("/get_company_profile", async(req, res) => {
    const sql = "SELECT * FROM main_table";
    return dbcon.query(sql, (error, result, fields) => {
        if (error) throw error;

        const companyProfile = [];
        const getAllData = JSON.parse(JSON.stringify(result));
        const data = filter(getAllData, (o) => o.alias_name === "company_profile");
        map(data, (item) => {
            const image = JSON.parse(item.img);
            const files = [];
            size(image) > 0 &&
            map(image, (i) => {
                i && files.push(`${apiUrl}/${i}`);
            });
            companyProfile.push({
                ...item,
                more_details: item.more_details && JSON.parse(item.more_details),
                img: files,
            });
        });

        return res.json({
            error: false,
            data: { companyProfile },
            message: "Upload data Successfully",
        });
    });
});

// get Infrastructure data
newsRouter.get("/get_infrastructure", (req, res) => {
    const sql = "SELECT * FROM main_table";
    return dbcon.query(sql, (error, result, fields) => {
        if (error) throw error;

        const infrastructureCarousel = [];
        const getAllData = JSON.parse(JSON.stringify(result));
        const data = filter(
            getAllData,
            (o) => o.alias_name === "infrastructure_carousel"
        );
        map(data, (item) => {
            const image = JSON.parse(item.img);
            infrastructureCarousel.push({
                ...item,
                img: image && image[0] && `${apiUrl}/${image && image[0]}`,
            });
        });

        const infrastructure = [];
        const data1 = filter(getAllData, (o) => o.alias_name === "infrastructure");
        map(data1, (item) => {
            const image = JSON.parse(item.img);
            infrastructure.push({
                ...item,
                img: image && image[0] && `${apiUrl}/${image && image[0]}`,
            });
        });

        return res.json({
            error: false,
            data: { infrastructureCarousel, infrastructure },
            message: "Get Data Successfully",
        });
    });
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
                        logo: `${apiUrl}/${req.file.filename}`,
                    },
                },
                message: "Upload data Successfully",
            });
        }
    );
});

// put footer
newsRouter.put("/update_footer/:id", upload.single("file"), (req, res) => {
    const img = imageName;
    const id = req.params.id;
    const logo = req.body.logo;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const address = req.body.address;
    const facebook = req.body.facebook;
    const twitter = req.body.twitter;
    const instagram = req.body.instagram;
    const printrest = req.body.printrest;
    if (mobile) {
        const sql = "UPDATE footer SET mobile=? WHERE id = ? ";
        dbcon.query(sql, [mobile, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (email) {
        const sql = "UPDATE footer SET email=? WHERE id = ? ";
        dbcon.query(sql, [email, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (address) {
        const sql = "UPDATE footer SET address=? WHERE id = ? ";
        dbcon.query(sql, [address, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (facebook) {
        const sql = "UPDATE footer SET facebook=? WHERE id = ? ";
        dbcon.query(sql, [facebook, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (twitter) {
        const sql = "UPDATE footer SET twitter=? WHERE id = ? ";
        dbcon.query(sql, [twitter, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (instagram) {
        const sql = "UPDATE footer SET instagram=? WHERE id = ? ";
        dbcon.query(sql, [instagram, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (printrest) {
        const sql = "UPDATE footer SET printrest=? WHERE id = ? ";
        dbcon.query(sql, [printrest, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (img) {
        if (logo) {
            const unlink = logo.replace(`${apiUrl}/`, "");
            if (unlink) {
                handleDeleteImage(unlink);
            }
        }
        const sql = "UPDATE footer SET logo=? WHERE id = ? ";
        dbcon.query(sql, [img, id], (error, result, fields) => {
            if (error) throw error;
        });
    }

    return res.json({
        error: false,
        message: "Update data Successfully",
    });
});

// get footer
newsRouter.get("/footer", (req, res) => {
    const sql = "SELECT * FROM footer";
    dbcon.query(sql, (error, result, fields) => {
        if (error) throw error;
        const footer = JSON.parse(JSON.stringify(result));
        return res.json({
            error: false,
            data: {
                ...footer[0],
                logo: footer[0].logo ? `${apiUrl}/${footer[0].logo}` : "",
            },
            message: "get data Successfully",
        });
    });
});

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

// Get Media Data
newsRouter.get("/get_media", (req, res) => {
    const sql = "SELECT * FROM media_table";
    return dbcon.query(sql, (error, result, fields) => {
        if (error) throw error;

        const mediaData = [];
        const getAllData = JSON.parse(JSON.stringify(result));
        map(getAllData, (item) => {
            const gallary = JSON.parse(item.gallary);
            const banner_img = JSON.parse(item.banner_img);
            const files = [];
            size(gallary) > 0 &&
            map(gallary, (i) => {
                i && files.push({ src: `${apiUrl}/${i}`, width: 1, height: 1 });
            });
            mediaData.push({
                ...item,
                gallary: files,
                banner_img: banner_img && banner_img[0] && `${apiUrl}/${banner_img[0]}`,
            });
        });

        return res.json({
            error: false,
            data: { mediaData },
            message: "Get Data Successfully",
        });
    });
});

// Put media
newsRouter.put("/update_media/:id", (req, res) => {
    const image = [];
    const bannerImage = [];

    const multipleArrary = upload.array("file", 20);
    multipleArrary(req, res, function (err) {
        if (err) {
            return res.send({ error: true, message: "Error uploading file." });
        }
        const isBanner = req.body.bannerImage;
        map(req.files, (o, index) => {
            if (index === 0 && isBanner) {
                bannerImage.push(o.filename);
            } else {
                image.push(o.filename);
            }
        });

        const gallary = req.body.gallary;
        const description = req.body.description;
        const id = req.params.id;
        const title = req.body.title;

        if (title) {
            const sql = "UPDATE media_table SET title=? WHERE id = ? ";
            dbcon.query(sql, [title, id], (error, result, fields) => {
                if (error) throw error;
            });
        }
        if (description) {
            const sql = "UPDATE media_table SET description=? WHERE id = ? ";
            dbcon.query(sql, [description, id], (error, result, fields) => {
                if (error) throw error;
            });
        }

        if (isBanner) {
            const selectSql = "SELECT banner_img FROM media_table WHERE id=?";
            dbcon.query(selectSql, [id], (error, result, fields) => {
                if (error) throw error;
                const getImg = JSON.parse(JSON.stringify(result));
                const oldImg = getImg && JSON.parse(getImg[0].banner_img);
                if (oldImg && oldImg[0]) {
                    handleDeleteImage(oldImg[0]);
                }
                const img = JSON.stringify(bannerImage);
                const sql = "UPDATE media_table SET banner_img=? WHERE id = ? ";
                dbcon.query(sql, [img, id], (error, result, fields) => {
                    if (error) throw error;
                });
            });
        }
        console.log("============gallary", gallary);
        if (size(JSON.parse(gallary)) > 0) {
            const selectSql = "SELECT gallary FROM media_table WHERE id=?";
            const unlink = [];
            map(JSON.parse(gallary), (o) =>
                unlink.push(replace(o, `${apiUrl}/`, ""))
            );
            let getImg = [];
            dbcon.query(selectSql, [id], (error, result, fields) => {
                if (error) throw error;
                getImg = JSON.parse(JSON.stringify(result));
                const oldImg = size(getImg) > 0 && JSON.parse(getImg[0].gallary);
                console.log("==============oldImg", oldImg);
                let deleteImg = [];

                const filterDelete = (oldImg, unlink) => {
                    let res = [];
                    res = oldImg.filter((el) => {
                        return !unlink.find((element) => {
                            return element === el;
                        });
                    });
                    return res;
                };
                const filterNotDelete = (oldImg, unlink) => {
                    let res = [];
                    res = oldImg.filter((el) => {
                        return unlink.find((element) => {
                            return element === el;
                        });
                    });
                    return res;
                };

                deleteImg = size(oldImg) > 0 ? filterDelete(oldImg, unlink) : [];
                size(oldImg) > 0 && image.push(...filterNotDelete(oldImg, unlink));
                size(deleteImg) > 0 &&
                map(deleteImg, (img) => {
                    if (img) {
                        handleDeleteImage(img);
                    }
                });
                img = JSON.stringify(image);
                const sql = "UPDATE media_table SET gallary=? WHERE id = ? ";
                dbcon.query(sql, [img, id], (error, result, fields) => {
                    if (error) throw error;
                });
            });
        } else {
            const selectSql = "SELECT gallary FROM media_table WHERE id=?";
            const unlink = [];
            map(JSON.parse(gallary), (o) =>
                unlink.push(replace(o, `${apiUrl}/`, ""))
            );
            let getImg = [];
            dbcon.query(selectSql, [id], (error, result, fields) => {
                if (error) throw error;
                getImg = JSON.parse(JSON.stringify(result));
                const oldImg = size(getImg) > 0 && JSON.parse(getImg[0].gallary);
                console.log("==============oldImg", oldImg);
                let deleteImg = [];

                const filterDelete = (oldImg, unlink) => {
                    let res = [];
                    res = oldImg.filter((el) => {
                        return !unlink.find((element) => {
                            return element === el;
                        });
                    });
                    return res;
                };
                deleteImg = size(oldImg) > 0 ? filterDelete(oldImg, unlink) : [];
                size(deleteImg) > 0 &&
                map(deleteImg, (img) => {
                    if (img) {
                        handleDeleteImage(img);
                    }
                });
                img = JSON.stringify(image);
                const sql = "UPDATE media_table SET gallary=? WHERE id = ? ";
                dbcon.query(sql, [img, id], (error, result, fields) => {
                    if (error) throw error;
                });
            });
        }

        return res.json({
            error: false,
            message: "Update data Successfully",
        });
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
                        img: `${apiUrl}/${img}`,
                    },
                },
                message: "Upload data Successfully",
            });
        }
    );
});

//Put Collection
newsRouter.put("/update_collection/:id", upload.single("file"), (req, res) => {
    const img = imageName;
    const id = req.params.id;
    const image = req.body.img;
    const title = req.body.title;
    const size_x = req.body.size_x;
    const size_y = req.body.size_y;
    const size_type = req.body.size_type;
    const thickness = req.body.thickness;
    const tiles = req.body.tiles;
    const weight = req.body.weight;

    if (title) {
        const sql = "UPDATE collection_table SET title=? WHERE id = ? ";
        dbcon.query(sql, [title, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (weight) {
        const sql = "UPDATE collection_table SET weight=? WHERE id = ? ";
        dbcon.query(sql, [weight, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (tiles) {
        const sql = "UPDATE collection_table SET tiles=? WHERE id = ? ";
        dbcon.query(sql, [tiles, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (thickness) {
        const sql = "UPDATE collection_table SET thickness=? WHERE id = ? ";
        dbcon.query(sql, [thickness, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (size_x) {
        const sql = "UPDATE collection_table SET size_x=? WHERE id = ? ";
        dbcon.query(sql, [size_x, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (size_y) {
        const sql = "UPDATE collection_table SET size_y=? WHERE id = ? ";
        dbcon.query(sql, [size_y, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (size_type) {
        const sql = "UPDATE collection_table SET size_type=? WHERE id = ? ";
        dbcon.query(sql, [size_type, id], (error, result, fields) => {
            if (error) throw error;
        });
    }
    if (img) {
        if (image) {
            const unlink = image.replace(`${apiUrl}/`, "");
            console.log("====unlinkCX", unlink);
            if (unlink) {
                handleDeleteImage(unlink);
            }
        }
        const sql = "UPDATE collection_table SET img=? WHERE id = ? ";
        dbcon.query(sql, [img, id], (error, result, fields) => {
            if (error) throw error;
        });
    }

    return res.json({
        error: false,
        message: "Update data Successfully",
    });
});

// DELETE Collection
newsRouter.delete("/delete_collection/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM collection_table WHERE id = ? ";
    if (!id) {
        return res.json({
            status: 400,
            error: true,
            message: "Please Provide True Id",
        });
    }
    dbcon.query(sql, [id], (error, result, fields) => {
        if (error) throw error;
        return res.send({
            error: false,
            status: 200,
            message: "DELETED Successfully",
        });
    });
});

// Get Collection
newsRouter.get("/get_collection", (req, res) => {
    const sql = "SELECT * FROM collection_table";
    dbcon.query(sql, (error, result, fields) => {
        if (error) throw error;
        const collection = JSON.parse(JSON.stringify(result));
        const collectionData = [];
        map(collection, (item) => {
            collectionData.push({
                ...item,
                img: item.img && `${apiUrl}/${item.img}`,
            });
        });
        return res.json({
            error: false,
            data: {
                collectionData,
            },
            message: "get data Successfully",
        });
    });
});

// Get Export
newsRouter.get("/get_export", (req, res) => {
    const sql = "SELECT * FROM main_table WHERE alias_name=?";
    dbcon.query(sql, ["export"], (error, result, fields) => {
        if (error) throw error;
        const exportData = JSON.parse(JSON.stringify(result));

        return res.json({
            error: false,
            data: {
                ...exportData[0],
            },
            message: "get data Successfully",
        });
    });
});

//Delete Data Id
newsRouter.delete("/delete_main_table/:id", (req, res) => {
    const id = req.params.id;
    console.log("==========id", id);
    const sql = "DELETE FROM main_table WHERE id = ? ";
    if (!id) {
        return res.json({
            status: 400,
            error: true,
            message: "Please Provide True Id",
        });
    }
    dbcon.query(sql, [id], (error, result, fields) => {
        if (error) throw error;
        console.log("=================>result");
        return res.send({
            error: false,
            status: 200,
            message: "DELETED Successfully",
        });
    });
});

//Delete Media Id
newsRouter.delete("/delete_media/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM media_table WHERE id = ? ";
    if (!id) {
        return res.json({
            status: 400,
            error: true,
            message: "Please Provide True Id",
        });
    }
    dbcon.query(sql, [id], (error, result, fields) => {
        if (error) throw error;
        return res.send({
            error: false,
            status: 200,
            message: "DELETED Successfully",
        });
    });
});

// send email
newsRouter.post("/send_email", (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "abcd@abcd.com",
            pass: "111",
        },
    });
    const mailOption = {
        from: req.body.data.emailid,
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





module.exports = newsRouter 
