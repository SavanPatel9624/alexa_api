const express = require('express')
const newsRouter = express.Router()
const fs = require("fs");
const map = require("lodash/map");
const size = require("lodash/size");
const multer = require("multer");
const replace = require("lodash/replace");
const dbcon = require("../database/connection");
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

const handleDeleteImage = (fileName) => {
    const directoryPath = "public/images";
    //passing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        if(files && files.length > 0) {
            files.forEach(function (file) {
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
                unlink.push(replace(o, `${API_URL}/`, ""))
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
                const fileName = unLinkImg && unLinkImg.replace(`${API_URL}/`, "");
                console.log("=======fileName", fileName);

                if (fileName) {
                    handleDeleteImage(fileName);
                }

                img = JSON.stringify(image);
            } else {
                const unlink = [];
                unlink.push(replace(unLinkImg, `${API_URL}/`, ""));

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
            const unlink = logo.replace(`${API_URL}/`, "");
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
                unlink.push(replace(o, `${API_URL}/`, ""))
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
                unlink.push(replace(o, `${API_URL}/`, ""))
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
            const unlink = image.replace(`${API_URL}/`, "");
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



module.exports = newsRouter;
