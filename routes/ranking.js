var express = require('express');
var router = express.Router();
var connection = require('../database.js');
var sanitizeHtml = require('sanitize-html');
const { check, validationResult } = require('express-validator');

/* GET all university ranking. */
router.get('/', function (req, res, next) {
    connection
        .raw(`select world_rank, university.university_name as university_name, country.country_name as country_name, national_rank, quality_of_education, score, ranking_year, university_id, country_id from university_ranking_year inner join university on university_ranking_year.university_id = university.id inner join country on university_ranking_year.country_id = country.id `)
        .then((result) => {
            var university_ranking_year = result[0];
            res.json({
                university_ranking_year: university_ranking_year
            });
        })
        .catch((error) => {
            res.json(500, {
                "message": error
            })
        })
});

/* GET university respective ranking details with year and world ranking */
router.get('/:year/:ranking',
    check('year', "Invalid route param").isInt(),
    check('ranking', "Invalid route param").isInt(),
    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        connection
            .raw(`select world_rank, university.university_name as university_name, country.country_name as country_name, national_rank, quality_of_education, score, ranking_year, university_id, country_id from university_ranking_year inner join university on university_ranking_year.university_id = university.id inner join country on university_ranking_year.country_id = country.id where ranking_year = ? and world_rank = ?`, [req.params.year, req.params.ranking])
            .then((result) => {
                var university_ranking_year = result[0];
                if (university_ranking_year.length == 0) {
                    res.json({
                        message: "no record found"
                    })
                } else {
                    res.json({
                        university_ranking_year: university_ranking_year
                    });
                }

            })
            .catch((error) => {
                res.json(500, {
                    "message": error
                })
            })


    });

/* insert new university ranking record */
router.post('/',
    (req, res, next) => {
        connection
            .raw(`insert into university_ranking_year values (?,?,?,?,?,?,?)`, [sanitizeHtml(req.body.world_rank), sanitizeHtml(req.body.university_id), sanitizeHtml(req.body.country_id), sanitizeHtml(req.body.national_rank), sanitizeHtml(req.body.quality_of_education), sanitizeHtml(req.body.score), sanitizeHtml(req.body.ranking_year)])
            .then((result) => {
                var university_ranking_year = result[0];
                if (university_ranking_year.length == 0) {
                    res.json({
                        message: "failed to create a new record"
                    })
                } else {
                    res.json({
                        university_ranking_year: university_ranking_year
                    });
                }

            })
            .catch((error) => {
                res.json(500, {
                    "message": error
                })
            })
    });

/* update existing university ranking */
router.put('/:year/:university_id/:country_id',
    check('year', "Invalid route param").isInt(),
    check('university_id', "Invalid route param").isInt(),
    check('country_id', "Invalid route param").isInt(),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        connection
            .raw(`select * from university_ranking_year where ranking_year = ? and university_id = ? and country_id = ?`, [req.params.year, req.params.university_id, req.params.country_id])
            .then((result) => {
                var count = result[0];
                if (count.length > 0) {
                    connection
                        .raw(`update university_ranking_year set world_rank = ?, university_id = ?, country_id = ?, national_rank = ?, quality_of_education = ?, score = ?, ranking_year = ? where ranking_year = ? and university_id = ? and country_id = ?  `, [sanitizeHtml(req.body.world_rank), sanitizeHtml(req.body.university_id), sanitizeHtml(req.body.country_id), sanitizeHtml(req.body.national_rank), sanitizeHtml(req.body.quality_of_education), sanitizeHtml(req.body.score), sanitizeHtml(req.body.ranking_year), req.params.year, req.params.university_id, req.params.country_id])
                        .then((result) => {
                            var count = result[0];
                            return res.json({
                                message: count
                            })
                        })
                        .catch((error) => {
                            return res.status(500).json({
                                message: error
                            })
                        })
                } else {
                    return res.json({
                        message: "No specific record found"
                    })
                }
            })
    });

/* delete existing university ranking record with ranking_year, university_id, country_id */
router.delete('/:year/:university_id/:country_id',
    check('year', "Invalid route param").isInt(),
    check('university_id', "Invalid route param").isInt(),
    check('country_id', "Invalid route param").isInt(),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        connection
            .raw(`select * from university_ranking_year where ranking_year = ? and university_id = ? and country_id = ?`, [req.params.year, req.params.university_id, req.params.country_id])
            .then((result) => {
                var count = result[0];
                if (count.length > 0) {
                    connection
                        .raw(`delete from university_ranking_year where ranking_year = ? and university_id = ? and country_id = ? `, [req.params.year, req.params.university_id, req.params.country_id])
                        .then((result) => {
                            var count = result[0];
                            return res.json({
                                message: count
                            })
                        })
                        .catch((error) => {
                            return res.status(500).json({
                                message: error
                            })
                        })
                } else {
                    return res.json({
                        message: "No specific record found"
                    })
                }
            })
    });



module.exports = router;
