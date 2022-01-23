const filter = require("lodash/filter");
const map = require("lodash/map");
const size = require("lodash/size");
const express = require("express");
const dbcon = require("../database/connection");
const newsRouter = express.Router();
const API_URL = require('../clientConfig');

newsRouter.get('', async(req, res) => {
    return res.send({ error: false, message: "Success" });
});

// get home data
newsRouter.get('/get_home_data',async(req, res)=>{
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
                img: image && image[0] && `${API_URL}/${image && image[0]}`,
            });
        });

        const aboutData = [];
        const data = filter(getAllData, (o) => o.alias_name === "home_about");
        map(data, (item) => {
            const image = JSON.parse(item.img);
            aboutData.push({
                ...item,
                img: image && image[0] && `${API_URL}/${image && image[0]}`,
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
                img: image && image[0] && `${API_URL}/${image && image[0]}`,
            });
        });

        const homeClients = [];
        const clients = filter(getAllData, (o) => o.alias_name === "home_clients");
        size(clients) > 0 &&
        map(clients, (item) => {
            const image = JSON.parse(item.img);
            const files = [];
            map(image, (i) => {
                i && files.push(`${API_URL}/${i}`);
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
                img: item.img && `${API_URL}/${item.img}`,
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
                i && files.push({ src: `${API_URL}/${i}`, width: 1, height: 1 });
            });
            mediaData.push({
                ...item,
                gallary: files,
                banner_img: banner_img && banner_img[0] && `${API_URL}/${banner_img[0]}`,
            });
        });

        return res.json({
            error: false,
            data: { mediaData },
            message: "Get Data Successfully",
        });
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
                logo: footer[0].logo ? `${API_URL}/${footer[0].logo}` : "",
            },
            message: "get data Successfully",
        });
    });
});

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
                i && files.push(`${API_URL}/${i}`);
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
                img: image && image[0] && `${API_URL}/${image && image[0]}`,
            });
        });

        const infrastructure = [];
        const data1 = filter(getAllData, (o) => o.alias_name === "infrastructure");
        map(data1, (item) => {
            const image = JSON.parse(item.img);
            infrastructure.push({
                ...item,
                img: image && image[0] && `${API_URL}/${image && image[0]}`,
            });
        });

        return res.json({
            error: false,
            data: { infrastructureCarousel, infrastructure },
            message: "Get Data Successfully",
        });
    });
});

module.exports = newsRouter