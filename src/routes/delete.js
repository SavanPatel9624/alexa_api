const express = require("express");
const newsRouter = express.Router();
const dbcon = require("../database/connection");


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

//Delete Data Id
newsRouter.delete("/delete_main_table/:id", (req, res) => {
    const id = req.params.id;
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

module.exports = newsRouter;